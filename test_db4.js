import mongoose from "mongoose";

async function run() {
    try {
        await mongoose.connect("mongodb+srv://praharshsingh26_db_user:AUUdfKSepcrdhmyv@cluster0.wpi7osr.mongodb.net/webchat?appName=Cluster0");
        const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
        
        const users = await User.find({}).limit(5);
        console.log("Users:");
        users.forEach(u => console.log(JSON.stringify(u, null, 2)));
        
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}
run();
