import User from "../models/user.model.js";
import jwt from "jsonwebtoken"


export const protectRoutes = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.headers.token || authHeader?.replace("Bearer ", "");

        if(!token)
            return res.status(401).json({
                message: "Not authorized, token missing"
            })

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if(!user)
            return res.status(401).json({
                message: "user not found!"
            })

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, token invalid"
        })
    }
}
