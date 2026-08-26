import ImageKit, {toFile} from "@imagekit/nodejs";

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
    const safeName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
    return `chat-${Date.now()}-${safeName}`;
}

async function uploadchatMedia(file){
    const fileName = createFileName(file.originalname);
    const imagekit = getImageKit();

    const uploadResponse = await imagekit.upload({
        file: toFile(file.buffer),
        fileName: fileName,
        folder: "/chat-media"
    });

    return uploadResponse.url;
}

export { uploadchatMedia , hasImageKitConfig };