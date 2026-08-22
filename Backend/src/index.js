import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`server is running on port number:  ${port}`);
});
