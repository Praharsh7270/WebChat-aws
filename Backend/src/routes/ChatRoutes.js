import express from "express";
import { chatWithAssistant } from "../controllers/ChatController.js";
import { protectRoute } from "../Middleware/AuthMiddleware.js";

const router = express.Router();

router.post("/", protectRoute, chatWithAssistant);

export default router;
