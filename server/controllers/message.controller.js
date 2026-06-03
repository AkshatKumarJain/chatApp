import Message from "../models/message.model.js";
import User from "../models/user.model.js";


export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        // get all users except the logged-in user
        const filteredUser = await User.find({_id: {$ne: userId}}).select("-password");

        // count number of unseen messages
        const unseenMessages = {};
        const promises = filteredUser.map(async () => {
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false});
            if(messages.length > 0)
            {
                unseenMessages[user._id] = messages.length;
            }
        })

        await Promise.all(promises);
        res.status(200).json({
            users: filteredUser,
            unseenMessages
        })
    } catch (error) {
        res.status(500).json({
            message: error
        })
    }
}

// get all messages for a selected user
export const getMessages = async (req, res) => {
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {
                    senderId: myId,
                    receiverId: selectedUserId
                },
                {
                    senderId: selectedUserId,
                    receiverId: myId
                }
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.status(200).json({
            message: "messages fetched successfully",
            messages
        })
    } catch (error) {
        res.status(500).json({
            message: error
        })
    }
}