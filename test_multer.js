import express from 'express';
import multer from 'multer';
import axios from 'axios';

const app = express();
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

app.post('/test', upload.single('media'), (req, res) => {
    res.json({ body: req.body });
});

const server = app.listen(0, async () => {
    try {
        const res = await axios.post(`http://localhost:${server.address().port}/test`, { text: "hello" });
        console.log("Status:", res.status);
        console.log("Body:", res.data);
    } catch(err) {
        console.log("Status:", err.response?.status);
        console.log("Body:", err.response?.data);
    }
    server.close();
});
