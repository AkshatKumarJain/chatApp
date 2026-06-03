import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"


export const signup = async (req, res) => {
    const {fullName, email, password, bio} = req.body;

    try {
        if(!fullName || email || password || bio)
            return res.json({success: false, message: "missing details" });
        const user = await User.findOne({email});
        if(user)
            return res.status(409).json({
                message: "Account already exists!"
            })

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createUser = await User.create({fullName, email, password: hashedPassword, bio});

        const token = generateToken(createUser._id);

        return res.status(201).json({
            data: createUser, token,
            message: "User account created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email});

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect)
            return res.status(401).json({
                message: "Incorrect password"
            })

        const token = generateToken(createUser._id);

        return res.status(200).json({
            data: userData, token,
            message: "Login Successful"
        })
    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}

export const checkAuth = async (req, res) => {
    res.status(200).json({
        user: req.user
    })
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updatedUser;
        
        if(!profilePic)
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true})
        }

        return res.status(201).json({
            message: "User Profile updated successfully",
            user: updatedUser
        })
    } catch (error) {
        res.status(500).json({
            message: error
        })
    }
}