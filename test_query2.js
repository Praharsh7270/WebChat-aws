import mongoose from "mongoose";
import "dotenv/config";

async function run() {
    try {
        await mongoose.connect("mongodb+srv://praharshsingh26_db_user:AUUdfKSepcrdhmyv@cluster0.wpi7osr.mongodb.net/webchat?appName=Cluster0", {
            serverSelectionTimeoutMS: 5000,
        });
        const User = mongoose.model("User", new mongoose.Schema({ clerkId: String, email: String, FullName: String }, { strict: false }));
        
        const loggedInUser = "user_3IVn2GseVaSLRJ25CvgnAB90nQ2";
        const query = mongoose.Types.ObjectId.isValid(loggedInUser) 
            ? { _id: { $ne: loggedInUser } }
            : { clerkId: { $ne: String(loggedInUser) } };
        console.log("Query:", query);
            
        const filterUser = await User.find(query).select("-clerkId");
        console.log("Users found:", filterUser.length);
        process.exit(0);
    } catch (err) {
        console.error("Failed:", err.message);
        process.exit(1);
    }
}
run();
