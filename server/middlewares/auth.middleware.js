import User from "../models/user.model.js";
import jwt from "jsonwebtoken"


export const protectRoutes = async (req, res, next) => {
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if(!user)
            return res.status(400).json({
                message: "user not found!"
            })

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}