import "dotenv/config";

const keysToSanitize = [
  "MONGODB_URI", "MONGODB_URL", "mongodb_url",
  "CLERK_PUBLISHABLE_KEY", "VITE_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SIGNING_SECRET", "IMAGE_KIT_PRIVATEkEY", "IMAGE_KIT_PRIVATE_KEY", "IMAGE_KIT_PUBLIC_KEY", "IMAGE_KIT_URL_ENDPOINT"
];
for (const key of keysToSanitize) {
  if (process.env[key]) {
    process.env[key] = process.env[key].replace(/^["']|["']$/g, '');
  }
}
