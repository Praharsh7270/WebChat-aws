import mongoose from "mongoose";
import "dotenv/config";

async function run() {
    try {
        let uri = process.env.MONGODB_URI || process.env.mongodb_url;
        if (uri) uri = uri.replace(/^["']|["']$/g, '');
        
        await mongoose.connect(uri);
        const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
        const users = await User.find({});
        console.log("Total users:", users.length);
        console.log(users.slice(0, 3));
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}
run();
