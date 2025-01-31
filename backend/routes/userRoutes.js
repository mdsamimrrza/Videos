import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { generateVideo } from '../controllers/replicateController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/generate", generateVideo);

export default router;
