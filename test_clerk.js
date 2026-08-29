import "dotenv/config";
import "./Backend/src/lib/sanitize-env.js";
import { clerkClient } from "@clerk/express";

async function run() {
    try {
        console.log("Secret key present?", !!process.env.CLERK_SECRET_KEY);
        const clerkUser = await clerkClient.users.getUser("user_3IJuN8JPTe6UhdSZeWIzkW6bNGh");
        console.log("Success:", clerkUser.emailAddresses[0].emailAddress);
    } catch(err) {
        console.error("Clerk error:", err.message);
    }
}
run();
