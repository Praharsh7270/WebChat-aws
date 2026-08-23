import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clearkId:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    FullName:{
        type:String,
        required:true
    },
    profilePic:{
        type:String,
        default:"",
    },   
},{timestamps:true},
);


const User = moongoose.model("User",userSchema);

export default User;