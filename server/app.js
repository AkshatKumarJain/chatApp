import express from "express";
import "dotenv/config.js";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8000;

const parseOrigins = (value = "") =>
    value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const allowedOrigins = parseOrigins(process.env.CLIENT_URL || process.env.CLIENT_URLS);

const corsOptions = {
    origin: (origin, callback) => {
        if(!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin))
        {
            return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    }
};

// initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: allowedOrigins.length > 0 ? allowedOrigins : "*"
    }
})

// store online users
export const userSocketMap = {}; // {userId: socketId}

// socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);

    if(userId)
    {
        userSocketMap[userId] = socket.id
    }

    // emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected!", userId)
        delete userSocketMap[userId];

        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

app.use(express.json({limit: process.env.JSON_LIMIT || '4mb'}));
app.use(cors(corsOptions));

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

app.get("/", (_, res) => {
    res.send("QuickChat API is running");
});

app.get("/health", (_, res) => {
    res.send("Server is live");
});

app.get("/api/health", (_, res) => {
    res.json({success: true, message: "Server is live"});
});

await connectDB();

server.listen(port, () => {
    console.log(`Server is running at port: ${port}.`);
})
