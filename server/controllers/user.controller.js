import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"

const sanitizeUser = (user) => {
    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;
    return safeUser;
}

export const signup = async (req, res) => {
    const {fullName, email, password, bio = ""} = req.body;

    try {
        if(!fullName || !email || !password)
            return res.status(400).json({success: false, message: "Missing required details" });

        if(password.length < 6)
            return res.status(400).json({success: false, message: "Password must be at least 6 characters" });

        const user = await User.findOne({email});
        if(user)
            return res.status(409).json({
                success: false,
                message: "Account already exists!"
            })

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const createdUser = await User.create({fullName, email, password: hashedPassword, bio});

        const token = generateToken(createdUser._id);
        const safeUser = sanitizeUser(createdUser);

        return res.status(201).json({
            success: true,
            user: safeUser,
            data: safeUser,
            token,
            message: "User account created successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password)
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            })

        const userData = await User.findOne({email});

        if(!userData)
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect)
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })

        const token = generateToken(userData._id);
        const safeUser = sanitizeUser(userData);

        return res.status(200).json({
            success: true,
            user: safeUser,
            data: safeUser,
            token,
            message: "Login Successful"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const checkAuth = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    })
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updatedUser;
        
        if(!profilePic)
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true}).select("-password");
        else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true}).select("-password")
        }

        return res.status(201).json({
            success: true,
            message: "User Profile updated successfully",
            user: updatedUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
