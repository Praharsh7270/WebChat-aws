import express from 'express';
import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import Message from '../models/MessageModel.js';
import {hasImageKitConfig, uploadchatMedia } from "../lib/ImageKit.js";
import { getReceiverSocketId, io } from '../lib/socket.js';


export async function getUserSidebar(req, res) {
    try{
        const loggedInUser = req.user._id;

        let filterUser = [];
        try {
            // Prevent CastError if loggedInUser is a Clerk string (fallback user)
            const query = mongoose.Types.ObjectId.isValid(loggedInUser) 
                ? { _id: { $ne: loggedInUser } }
                : { clerkId: { $ne: String(loggedInUser) } };
                
            filterUser = await User.find(query).select("-clerkId");
        } catch (dbErr) {
            console.warn("getUserSidebar database offline fallback:", dbErr.message);
            filterUser = [];
        }
        res.status(200).json(filterUser);

    }
    catch(error){
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getCobversations(req, res) {
    try{
        const loggedInUser = req.user._id;
        let conveersations = [];
        
        // Ensure we handle cases where loggedInUser might be a string safely
        if (!mongoose.Types.ObjectId.isValid(loggedInUser)) {
             return res.status(200).json(conveersations);
        }
        
        const senderOrReceiverQuery = [
            { senderId: loggedInUser },
            { receiverId: loggedInUser }
        ];

        try {
            conveersations = await Message.aggregate([
                {
                    $match: {
                        $or: senderOrReceiverQuery
                    }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ["$senderId", loggedInUser] },
                                "$receiverId",
                                "$senderId"
                            ]
                        },
                        latestMessage: { $first: "$$ROOT" },
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $sort: { "latestMessage.createdAt": -1 }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $replaceRoot: { newRoot: { $arrayElemAt: ["$user", 0] } }
                },
                {
                    $project: {
                        _id: 1,
                        FullName: 1,
                        profilePic: 1,
                    }
                }
            ]);
        } catch (dbErr) {
            console.warn("getCobversations database offline fallback:", dbErr.message);
            conveersations = [];
        }

        res.status(200).json(conveersations);
    }
    catch(err){
        res.status(500).json({ error: "Internal server error Message conversations" });
    }

}


export async function getMessages(req, res) {
    try{
        const usertoChat = req.params.id;
        const myid = req.user._id;

        let messages = [];
        if (!mongoose.Types.ObjectId.isValid(myid) || !mongoose.Types.ObjectId.isValid(usertoChat)) {
             return res.status(200).json(messages);
        }

        try {
            messages = await Message.find({
                $or: [
                    { senderId: myid, receiverId: usertoChat },
                    { senderId: usertoChat, receiverId: myid }
                ]
            }).sort({ createdAt: 1 });
        } catch (dbErr) {
            console.warn("getMessages database offline fallback:", dbErr.message);
            messages = [];
        }

        res.status(200).json(messages);
    }
    catch(err){
        res.status(500).json({ error: "Internal server error Message conversations message part" });
    }

}


export async function sendMessage(req, res) {
    try{
        const {text} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
             return res.status(400).json({ error: `Invalid user identifiers. Make sure you are fully synced with the database.` });
        }

        let imgurl;
        let vdourl;

        if(req.file){
            if(!hasImageKitConfig()){
                return res.status(500).json({ error: "ImageKit configuration is missing" });
            }
            const url = await uploadchatMedia(req.file);

            if(req.file.mimetype.startsWith("video/")){
                vdourl = url;
            }
            else{
                imgurl = url;
            }
        }

        const messageData = {
            _id: String(Date.now()),
            senderId,
            receiverId,
            text,
            image:imgurl,
            video:vdourl,
            createdAt: new Date().toISOString(),
        };

        try {
            const newMessage = new Message(messageData);
            await newMessage.save();
        } catch (dbErr) {
            console.warn("Save message database offline fallback:", dbErr.message);
        }

        const receiverSocketId = getReceiverSocketId(receiverId);
        //only send msg when user is online
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", messageData);
        }

        res.status(201).json(messageData);
    }
    catch(err){
        res.status(500).json({ error: "Internal server error Message conversations message part" });
    }
}
