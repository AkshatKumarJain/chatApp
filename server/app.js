import express from "express";
import "dotenv/config.js";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8000;

app.use(express.json({limit: '4mb'}));
app.use(cors());

app.get("/health", (_, res) => {
    res.send("Server is live");
});

await connectDB();

server.listen(port, () => {
    console.log(`Server is running at port: ${port}.`);
})