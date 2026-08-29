import mongoose from "mongoose";

async function run() {
    try {
        await mongoose.connect("mongodb+srv://praharshsingh26_db_user:AUUdfKSepcrdhmyv@cluster0.wpi7osr.mongodb.net/webchat?appName=Cluster0", {
            serverSelectionTimeoutMS: 5000,
        });
        const User = mongoose.model("User", new mongoose.Schema({ clerkId: String, email: String, FullName: String }, { strict: false }));
        const users = await User.find({});
        console.log("Total users:", users.length);
        console.log(users.map(u => u._id + " | " + u.clerkId));
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}
run();
