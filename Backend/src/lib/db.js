import mongoose from "mongoose";

export async function connectDB() {
  // MONGODB_URI is the documented name. The legacy lowercase name is kept so
  // existing local and deployed environments continue to work.
  const mongoUrl =
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    process.env.mongodb_url;

  if (!mongoUrl) {
    throw new Error(
      "MongoDB connection string is missing. Set MONGODB_URI in the server environment."
    );
  }

  mongoose.set("bufferCommands", false);
  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 10_000,
  });

  console.log(`MongoDB connected successfully (${mongoose.connection.name})`);
}
