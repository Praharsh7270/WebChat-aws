import mongoose from "mongoose";
import "dotenv/config";

async function run() {
    await mongoose.connect("mongodb+srv://praharshsingh26_db_user:AUUdfKSepcrdhmyv@cluster0.wpi7osr.mongodb.net/webchat?appName=Cluster0");
    const User = mongoose.model("User", new mongoose.Schema({ clerkId: String, FullName: String }, { strict: false }));
    const user = await User.findOne({ clerkId: 'user_3IJuN8JPTe6UhdSZeWIzkW6bNGh' });
    console.log("Current user:", user);
    process.exit(0);
}
run();
