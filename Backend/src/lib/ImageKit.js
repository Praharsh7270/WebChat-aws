import ImageKit, { toFile } from "@imagekit/nodejs";

let imagekitInstance = null;

function getImageKit() {
    if (!imagekitInstance) {
        imagekitInstance = new ImageKit({
            privateKey: process.env.IMAGE_KIT_PRIVATEkEY || process.env.IMAGE_KIT_PRIVATE_KEY || "dummy_key",
        });
    }
    return imagekitInstance;
}

function hasImageKitConfig(){
    return Boolean(process.env.IMAGE_KIT_PRIVATEkEY || process.env.IMAGE_KIT_PRIVATE_KEY);
}

function createFileName(originalName = "upload"){
    const safeName = (originalName || "upload").replace(/[^a-zA-Z0-9.-]/g, "_");
    return `chat-${Date.now()}-${safeName}`;
}

async function uploadchatMedia(file){
    if (!hasImageKitConfig()) {
        return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    }

    try {
        const fileName = createFileName(file.originalname);
        const imagekit = getImageKit();
        const fileForIk = await toFile(file.buffer, fileName, { type: file.mimetype });

        const uploadResponse = await imagekit.files.upload({
            file: fileForIk,
            fileName: fileName,
            folder: "/chat-media"
        });

        return uploadResponse.url;
    } catch (err) {
        console.warn("ImageKit upload error, using Data URI fallback:", err.message);
        return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    }
}

export { uploadchatMedia, hasImageKitConfig };
