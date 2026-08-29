import "./Backend/src/lib/sanitize-env.js";
import { clerkClient } from "@clerk/express";
console.log("Secret key format valid?", !process.env.CLERK_SECRET_KEY?.includes('"'));
