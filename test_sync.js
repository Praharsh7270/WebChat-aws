import "dotenv/config";
import mongoose from "mongoose";
import { clerkClient } from "@clerk/express";
import User from "./Backend/src/models/UserModel.js";

async function run() {
    try {
        let uri = process.env.MONGODB_URI || process.env.mongodb_url;
        if (uri) uri = uri.replace(/^["']|["']$/g, '');
        await mongoose.connect(uri);
        
        const clerkId = "user_3IVn2GseVaSLRJ25CvgnAB90nQ2"; // From earlier test
        const clerkUser = await clerkClient.users.getUser(clerkId);
        console.log("Clerk user found:", clerkUser.id, clerkUser.firstName);
        
        process.exit(0);
    } catch (err) {
        console.error("Sync failed:", err);
        process.exit(1);
    }
}
run();
