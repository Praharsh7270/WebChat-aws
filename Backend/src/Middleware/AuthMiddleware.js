import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/UserModel.js";

async function syncUserFromClerk(clerkId) {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    const email =
      clerkUser.emailAddresses?.find((address) => address.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ?? clerkUser.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      console.warn(`Clerk user ${clerkId} does not have an email address`);
      return null;
    }

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
      user = {
        _id: userId,
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
