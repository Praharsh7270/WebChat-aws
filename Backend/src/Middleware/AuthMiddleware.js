import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/UserModel.js";
import mongoose from "mongoose";

const userCache = new Map();

function safeDecode(str) {
  if (!str) return undefined;
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export async function syncOrUpdateUser(clerkId, clientInfo = {}) {
  if (!clerkId) return null;

  let fullName = clientInfo.fullName;
  let email = clientInfo.email;
  let profilePic = clientInfo.profilePic;

  // Try fetching from Clerk SDK if possible
  try {
    const clerkUser = await clerkClient.users.getUser(clerkId);
    if (clerkUser) {
      const cEmail =
        clerkUser.emailAddresses?.find((address) => address.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ?? clerkUser.emailAddresses?.[0]?.emailAddress;
      const cName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username;

      if (cName) fullName = cName;
      if (cEmail) email = cEmail;
      if (clerkUser.imageUrl) profilePic = clerkUser.imageUrl;
    }
  } catch {
    // Clerk SDK fetch is optional fallback
  }

  // Fallback defaults
  if (!email || email.includes("@fallback.com")) {
    email = clientInfo.email || `${clerkId}@user.com`;
  }

  if (!fullName || fullName === "User") {
    fullName = clientInfo.fullName || (email.includes("@") ? email.split("@")[0] : "User");
  }

  let userDoc = null;

  try {
    userDoc = await User.findOne({ clerkId });
    if (userDoc) {
      let needsSave = false;
      if (fullName && fullName !== "User" && userDoc.FullName !== fullName) {
        userDoc.FullName = fullName;
        needsSave = true;
      }
      if (email && !email.includes("@fallback.com") && userDoc.email !== email) {
        userDoc.email = email;
        needsSave = true;
      }
      if (profilePic && userDoc.profilePic !== profilePic) {
        userDoc.profilePic = profilePic;
        needsSave = true;
      }

      if (needsSave) {
        await userDoc.save();
      }
    } else {
      userDoc = await User.create({
        clerkId,
        email: email || `${clerkId}@user.com`,
        FullName: fullName || "User",
        profilePic: profilePic || "",
      });
    }
  } catch (err) {
    console.warn("MongoDB syncOrUpdateUser warning:", err.message);
  }

  if (!userDoc) {
    let hex = "";
    for (let i = 0; i < 24; i++) {
      hex += clerkId.charCodeAt(i % clerkId.length).toString(16).charAt(0);
    }
    const fakeId = new mongoose.Types.ObjectId(hex.padEnd(24, '0').substring(0, 24));
    userDoc = {
      _id: fakeId,
      clerkId,
      FullName: fullName || "User",
      email: email || `${clerkId}@user.com`,
      profilePic: profilePic || "",
    };
  }

  userCache.set(clerkId, userDoc);
  userCache.set(String(userDoc._id), userDoc);

  return userDoc;
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

    const clientInfo = {
      fullName: safeDecode(req.headers["x-user-fullname"]),
      email: safeDecode(req.headers["x-user-email"]),
      profilePic: safeDecode(req.headers["x-user-image"]),
    };

    const user = await syncOrUpdateUser(userId, clientInfo);

    if (!user) {
      return res.status(401).json({ error: "User authentication failed" });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

