import mongoose from "mongoose";

async function run() {
    try {
        await mongoose.connect("mongodb+srv://praharshsingh26_db_user:AUUdfKSepcrdhmyv@cluster0.wpi7osr.mongodb.net/webchat?appName=Cluster0");
        const message = new mongoose.Schema({
            senderId:{ type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
            receiverId:{ type:mongoose.Schema.Types.ObjectId, ref:"User", required:true },
            text:{ type:String },
            image:{ type:String },
            video:{ type:String },
        },{timestamps:true});
        const Message = mongoose.model("Message", message);
        
        const messageData = {
            _id: String(Date.now()),
            senderId: new mongoose.Types.ObjectId(),
            receiverId: new mongoose.Types.ObjectId(),
            text: "test"
        };
        const newMessage = new Message(messageData);
        await newMessage.save();
        console.log("Saved successfully!");
        process.exit(0);
    } catch(err) {
        console.error("Save error:", err.message);
        process.exit(1);
    }
}
run();
