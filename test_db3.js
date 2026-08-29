import mongoose from "mongoose";

async function run() {
    try {
        await mongoose.connect("mongodb+srv://praharshsingh26_db_user:AUUdfKSepcrdhmyv@cluster0.wpi7osr.mongodb.net/webchat?appName=Cluster0", {
            serverSelectionTimeoutMS: 5000,
        });
        const User = mongoose.model("User", new mongoose.Schema({ clerkId: String, email: String, FullName: String }, { strict: false }));
        const Message = mongoose.model("Message", new mongoose.Schema({ senderId: mongoose.Schema.Types.ObjectId, receiverId: mongoose.Schema.Types.ObjectId, text: String }, { strict: false }));
        
        const users = await User.find({});
        console.log("Users:", users.map(u => ({ id: u._id, clerkId: u.clerkId })));
        
        const messages = await Message.find({});
        console.log("Total messages:", messages.length);
        if (messages.length > 0) {
            console.log("Sample message:", messages[0]);
        }
        
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}
run();
