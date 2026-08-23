import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB(){
    try{
        const mongoUrl = process.env.mongodb_url;
        if(!mongoUrl){
            throw new Error("MongoDB URL is not defined in the environment variables");
        }
        await mongoose.connect(mongoUrl);
        console.log("MongoDB connected successfully");
    }catch(error){
        console.log("MongoDB connection failed",error.message);
        process.exit(1);
    }
}