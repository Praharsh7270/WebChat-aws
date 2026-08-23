import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import fs from "fs";
import path from "path";
import job from "./lib/cron.js";
import { json } from "stream/consumers";
import clerkWebhook from "../src/webhooks/clerk.js";

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL ;

const publicDir = path.join(process.cwd(), 'public');

app.use("/api/webhooks/clerk", express.raw({type:"application/json"}),clerkWebhook);

app.use(express.json());
app.use(cors({
    origin: frontendUrl,
    credentials: true,
}));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is healthy anna vannakam" });
});


if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));

    app.get("/{*any}", (req,res,next) =>{
        res.sendFile(path.join(publicDir, 'index.html') , (err) => next(err));
    })
}

app.listen(port, ()=>{
    connectDB();
    console.log(`server is running on port number:  ${port}`);

    if(process.env.NODE_ENV === "production"){
        job.start();
    }
});