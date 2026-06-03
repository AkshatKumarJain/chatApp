import express from "express";
import { protectRoutes } from "../middlewares/auth.middleware.js";
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoutes, getUsersForSidebar);
messageRouter.get("/:id", protectRoutes, getMessages);
messageRouter.put("/mark/:id", protectRoutes, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoutes, sendMessage);

export default messageRouter;
