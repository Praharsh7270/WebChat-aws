import express from 'express';
import mongoose from 'mongoose';
import "dotenv/config";

const app = express();

const User = mongoose.model("User", new mongoose.Schema({ clerkId: String, email: String, FullName: String }, { strict: false }));

app.get("/test", async (req, res) => {
    try {
        const loggedInUser = "user_3IVn2GseVaSLRJ25CvgnAB90nQ2";
        const query = mongoose.Types.ObjectId.isValid(loggedInUser) 
            ? { _id: { $ne: loggedInUser } }
            : { clerkId: { $ne: String(loggedInUser) } };
            
        const filterUser = await User.find(query).select("-clerkId");
        res.status(200).json(filterUser);
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ error: err.message });
    }
});

async function run() {
    await mongoose.connect("mongodb+srv://praharshsingh26_db_user:AUUdfKSepcrdhmyv@cluster0.wpi7osr.mongodb.net/webchat?appName=Cluster0");
    const server = app.listen(0, async () => {
        const port = server.address().port;
        const fetch = (await import('node-fetch')).default;
        const res = await fetch(`http://localhost:${port}/test`);
        const data = await res.json();
        console.log("Returned array length:", data.length);
        process.exit(0);
    });
}
run();
