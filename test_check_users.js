import "dotenv/config";
import "./Backend/src/lib/sanitize-env.js";
import { connectDB } from "./Backend/src/lib/db.js";
import User from "./Backend/src/models/UserModel.js";
import { clerkClient } from "@clerk/express";

await connectDB();

const users = await User.find({});
console.log("DB Users count:", users.length);
for (const u of users) {
    console.log("User in DB:", { id: u._id, clerkId: u.clerkId, FullName: u.FullName, email: u.email, profilePic: u.profilePic });
}

console.log("CLERK_SECRET_KEY present:", Boolean(process.env.CLERK_SECRET_KEY));
try {
    if (users.length > 0 && users[0].clerkId) {
        const cu = await clerkClient.users.getUser(users[0].clerkId);
        console.log("Clerk User fetched successfully:", cu.id, cu.firstName, cu.lastName, cu.emailAddresses?.[0]?.emailAddress);
    }
} catch (err) {
    console.error("Error fetching from Clerk:", err.message);
}
process.exit(0);
