import express from 'express';
import multer from 'multer';

const app = express();
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        if(!isImage && !isVideo) {
            return cb(new Error('Only image and video files are allowed'));
        }
        cb(null, true);
    },
});

app.post('/test', upload.single('media'), (req, res) => {
    res.json(req.body);
});
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message, code: err.code, status: err.status });
});
app.listen(0, async function() {
    const port = this.address().port;
    const res = await fetch(`http://localhost:${port}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hello: 'world' })
    });
    console.log(res.status);
    console.log(await res.json());
    process.exit(0);
});
