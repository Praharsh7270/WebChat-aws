import express from 'express';
import { getUserSidebar , getCobversations,getMessages } from '../controllers/MessageController.js';
import { protectRoute } from '../Middleware/AuthMiddleware.js';
import { upload } from '../Middleware/UploadMiddleware.js';
import { sendMessage } from '../controllers/MessageController.js';

const router = express.Router();

router.get("/users" ,protectRoute,  getUserSidebar);
router.get("/conversations" ,protectRoute,  getCobversations);
router.get("/:id" ,protectRoute,  getMessages);
router.post("/send/:id" ,protectRoute,upload.single("media"),sendMessage);

export default router;