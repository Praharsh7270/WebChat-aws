import "dotenv/config";
import dotenv from "dotenv";
import path from "path";

// The standalone backend runs from Backend/, while the unified app runs from
// the repository root. Load Backend/.env in either mode without overriding
// variables already supplied by the host environment.
const backendDirectory = path.basename(process.cwd()).toLowerCase() === "backend"
  ? process.cwd()
  : path.resolve(process.cwd(), "Backend");
dotenv.config({ path: path.join(backendDirectory, ".env") });

const keysToSanitize = [
  "MONGODB_URI", "MONGODB_URL", "mongodb_url",
  "CLERK_PUBLISHABLE_KEY", "VITE_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SIGNING_SECRET", "IMAGE_KIT_PRIVATEkEY", "IMAGE_KIT_PRIVATE_KEY", "IMAGE_KIT_PUBLIC_KEY", "IMAGE_KIT_URL_ENDPOINT", "HF_TOKEN", "HF_MODEL"
];
for (const key of keysToSanitize) {
  if (process.env[key]) {
    process.env[key] = process.env[key].replace(/^["']|["']$/g, '');
  }
}
