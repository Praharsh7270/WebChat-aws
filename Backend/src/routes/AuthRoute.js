import express from 'express'
import { checkAuth } from '../controllers/AuthController.js'
import { protectRoute } from '../Middleware/AuthMiddleware.js'

const router = express.Router();

router.get("/check" ,protectRoute, checkAuth)

export default router;