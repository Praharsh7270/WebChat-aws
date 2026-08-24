import express from 'express';
import User from '../models/UserModel.js';
import Message from '../models/MessageModel.js';
import {hasImageKitConfig, uploadchatMedia } from "../lib/ImageKit.js";


export async function getUserSidebar(req, res) {
    try{
        const loggedInUser = req.user._id;

        const filterUser = await User.find({ _id: { $ne: loggedInUser } },).select("-clerkId"); ;
        res.status(200).json(filterUser);

    }
    catch(error){
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getCobversations(req, res) {
    try{
        const loggedInUser = req.user._id;
        const conveersations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: loggedInUser },
                        { receiver: loggedInUser }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", loggedInUser] },
                            "$receiver",
                            "$sender"
                        ]
                    },  
                }
            },
            {
                $sort: { "latestMessage.timestamp": -1 }
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
        ])

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

        const messages = await Message.find({
            $or: [
                { sender: myid, receiver: usertoChat },
                { sender: usertoChat, receiver: myid }
            ]
        }).sort({ timestamp: 1 });

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

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imgurl,
            video:vdourl,
        })

        await newMessage.save()

        res.status(201).json(newMessage);
    }
    catch(err){
        res.status(500).json({ error: "Internal server error Message conversations message part" });
    }
}