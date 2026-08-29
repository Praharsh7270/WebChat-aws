import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/UserModel.js";
import mongoose from "mongoose";

async function syncUserFromClerk(clerkId) {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email =
      clerkUser.emailAddresses?.find((address) => address.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ?? clerkUser.emailAddresses?.[0]?.emailAddress ?? `${clerkId}@no-email.com`;

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      email.split("@")[0];

    return await User.findOneAndUpdate(
      { clerkId },
      {
        clerkId,
        email,
        FullName: fullName,
        profilePic: clerkUser.imageUrl || "",
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  } catch (err) {
    console.warn("syncUserFromClerk error:", err.message);
    return null;
  }
}

export async function protectRoute(req, res, next) {
  try {
    let authData = {};
    try {
      authData = getAuth(req) || {};
    } catch {
      authData = {};
    }

    const { userId } = authData;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let user = null;
    try {
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        user = await syncUserFromClerk(userId);
      }
    } catch (dbErr) {
      console.warn("Database lookup in protectRoute warning:", dbErr.message);
    }

    if (!user) {
       // Clerk SDK failed, but DB might be online. Let's create a generic user in DB!
       try {
           user = await User.findOneAndUpdate(
               { clerkId: userId },
               { clerkId: userId, FullName: "User", email: `${userId}@fallback.com`, profilePic: "" },
               { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
           );
       } catch (dbErr) {
           console.warn("Fallback DB insert failed:", dbErr.message);
       }
    }

    if (!user) {
      // If DB is offline, give them a deterministic ObjectId based on Clerk ID
      let hex = "";
      for (let i = 0; i < 24; i++) {
        hex += userId.charCodeAt(i % userId.length).toString(16).charAt(0);
      }
      user = {
        _id: new mongoose.Types.ObjectId(hex.padEnd(24, '0').substring(0, 24)),
        clerkId: userId,
        FullName: "User",
        email: "user@example.com",
        profilePic: "",
      };
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
