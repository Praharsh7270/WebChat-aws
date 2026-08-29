import express from "express";
import multer from "multer";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/messages/send/:id', upload.single("media"), (req, res) => {
    console.log("Body:", req.body);
    console.log("File:", req.file);
    const text = req.body.text;
    const receiverId = req.params.id;
    // mock senderId
    const senderId = "user_3IVn2GseVaSLRJ25CvgnAB90nQ2"; // Clerk ID example
    
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ error: "Invalid user identifiers. Make sure you are fully synced with the database." });
    }
    res.json({ success: true, text });
});

app.listen(0, async function() {
    const port = this.address().port;
    const fetch = (await import('node-fetch')).default;
    
    // Test with FormData equivalent
    const FormData = (await import('formdata-node')).FormData;
    const fd = new FormData();
    fd.append("text", "hello world");
    
    const res = await fetch(`http://localhost:${port}/api/messages/send/6a8b2b2069cfbc8e70f691db`, {
        method: 'POST',
        body: fd
    });
    
    console.log("Status:", res.status);
    console.log("Response:", await res.json());
    process.exit(0);
});
