import ImageKit, {toFile} from "@imagekit/nodejs";

const imagekit = new ImageKit({
    privateKey: process.env.IMAGE_KIT_PRIVATEkEY
});

function hasImageKitConfig(){
    return Boolean(process.env.IMAGE_KIT_PRIVATEkEY);
}


function createFileName(originalName = "upload"){
    const safeName = originalName.replace(/[^a-zA-Z0-9]/g, "_");
    return `chat-${Date.now()}-${safeName}`;
}

async function uploadchatMedia(file){
    const fileName = createFileName(file.originalname);

    const uploadResponse = await imagekit.upload({
        file: toFile(file.buffer),
        fileName: fileName,
        folder: "/chat-media"
    });

    return uploadResponse.url;
}

export { uploadchatMedia , hasImageKitConfig };