import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL ;

app.use(express.json());
app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is healthy anna vannakam" });
});

app.listen(port, ()=>{
    connectDB();
    console.log(`server is running on port number:  ${port}`);
});