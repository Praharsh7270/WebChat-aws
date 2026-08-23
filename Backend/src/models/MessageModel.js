import mongoose from "mongoose";

const message = new mongoose.Schema({
    senderId:{
        type:moongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:moongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
    },
    image:{
        type:String,
    },
    video:{
        type:String,
    },
},{timestamps:true});


const Message = moongoose.model("Message", message);

export default Message;