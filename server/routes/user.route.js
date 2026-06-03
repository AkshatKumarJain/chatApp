import express from "express"
import { checkAuth, login, signup, updateProfile } from "../controllers/user.controller.js";
import { protectRoutes } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoutes, updateProfile);
userRouter.get("/check", protectRoutes, checkAuth);

export default userRouter;