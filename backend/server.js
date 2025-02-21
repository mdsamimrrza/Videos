// File: server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import videoRoutes from './routes/videoRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to database (if using MongoDB)
    if (process.env.MONGODB_URI) {
      await connectDB();
      console.log('Connected to database');
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

export default app;