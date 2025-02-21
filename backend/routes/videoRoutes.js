// File: routes/videoRoutes.js
import express from 'express';
import { 
  generateVideo,
  startVideoGeneration, 
  checkVideoStatus 
} from '../controllers/replicateController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Synchronous video generation - waits for completion
router.post('/generate', generateVideo);

// Asynchronous video generation with polling
router.post('/start-generation', startVideoGeneration);
router.get('/status/:predictionId', checkVideoStatus);

// If you want to protect these routes with authentication:
// router.post('/generate', authMiddleware, generateVideo);

export default router;