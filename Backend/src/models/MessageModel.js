import mongoose from "mongoose";

const emergencyLocationSchema = new mongoose.Schema(
    {
        latitude: { type: Number, required: true, min: -90, max: 90 },
        longitude: { type: Number, required: true, min: -180, max: 180 },
        accuracy: { type: Number, min: 0 },
        capturedAt: { type: Date },
    },
    { _id: false }
);

const message = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
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
    isEmergency: {
        type: Boolean,
        default: false,
    },
    emergencyId: {
        type: String,
    },
    location: {
        type: emergencyLocationSchema,
    },
},{timestamps:true});


const Message = mongoose.model("Message", message);

export default Message;
