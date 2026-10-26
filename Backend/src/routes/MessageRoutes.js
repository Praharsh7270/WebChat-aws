import express from 'express';
import { getUserSidebar , getCobversations,getMessages, sendEmergencyMessage } from '../controllers/MessageController.js';
import { protectRoute } from '../Middleware/AuthMiddleware.js';
import { uploadMedia } from '../Middleware/UploadMiddleware.js';
import { sendMessage } from '../controllers/MessageController.js';

const router = express.Router();

router.get("/users" ,protectRoute,  getUserSidebar);
router.get("/conversations" ,protectRoute,  getCobversations);
router.post("/emergency", protectRoute, sendEmergencyMessage);
router.get("/:id" ,protectRoute,  getMessages);
router.post("/send/:id" ,protectRoute, uploadMedia, sendMessage);

export default router;
