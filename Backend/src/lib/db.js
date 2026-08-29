import mongoose from "mongoose";

let isConnecting = false;

export async function connectDB() {
  let mongoUrl =
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    process.env.mongodb_url;

  if (mongoUrl) {
    mongoUrl = mongoUrl.replace(/^["']|["']$/g, '');
  }

  if (!mongoUrl) {
    console.warn(
      "[AI Studio] MongoDB connection string (MONGODB_URI) not configured. Running in offline fallback mode."
    );
    return;
  }

  if (mongoUrl.includes("<cluster>") || mongoUrl.includes("<password>") || mongoUrl.includes("<username>")) {
    console.warn(
      "[AI Studio] MongoDB connection string contains placeholder values (e.g. <cluster>). Running in offline fallback mode."
    );
    return;
  }

  if (isConnecting || mongoose.connection.readyState >= 1) return;
  isConnecting = true;

  try {
    mongoose.set("bufferCommands", false);
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected successfully (${mongoose.connection.name})`);
  } catch (error) {
    console.warn(`[AI Studio] MongoDB connection failed: ${error.message}. Running in offline fallback mode.`);
  } finally {
    isConnecting = false;
  }
}
