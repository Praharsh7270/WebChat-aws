import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/UserModel.js";

async function syncUserFromClerk(clerkId) {
  const clerkUser = await clerkClient.users.getUser(clerkId);
  const email =
    clerkUser.emailAddresses.find((address) => address.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error(`Clerk user ${clerkId} does not have an email address`);
  }

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    email.split("@")[0];

  return User.findOneAndUpdate(
    { clerkId },
    {
      clerkId,
      email,
      FullName: fullName,
      profilePic: clerkUser.imageUrl || "",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
}

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized anna" });
    }

    const user = (await User.findOne({ clerkId: userId })) ?? (await syncUserFromClerk(userId));
  
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
