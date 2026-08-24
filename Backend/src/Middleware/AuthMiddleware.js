import { getAuth } from "@clerk/express";
import User from "../models/UserModel.js";

export async function protectRoute(req, res, next) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized anna" });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: "User has not been synced yet anna" });
    }
  
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}