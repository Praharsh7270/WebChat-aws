import multer from 'multer';

// Allow up to 200MB for video files
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

const storage = multer.memoryStorage();

const videoExtensions = /\.(mp4|mov|avi|mkv|webm|flv|wmv|3gp|3g2|m4v|ogv|ts|mts|m2ts|vob)$/i;
const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic|heif|ico|avif)$/i;

export const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith('image/') || imageExtensions.test(file.originalname);
        const isVideo = file.mimetype.startsWith('video/') || videoExtensions.test(file.originalname);

        if (!isImage && !isVideo) {
            return cb(new Error('Only image and video files are allowed'));
        }

        cb(null, true);
    },
});

export function uploadMedia(req, res, next) {
    upload.single("media")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: "File size exceeds 200MB limit." });
                }
                return res.status(400).json({ error: `Upload error: ${err.message}` });
            }
            return res.status(400).json({ error: err.message || "Failed to process uploaded file." });
        }
        next();
    });
}
