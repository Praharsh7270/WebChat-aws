import mongoose from "mongoose";

async function run() {
    try {
        mongoose.set("bufferCommands", false);
        const User = mongoose.model("User", new mongoose.Schema({}));
        await User.find({});
    } catch (err) {
        console.error("Query failed:", err.name, err.message);
        process.exit(1);
    }
}
run();
