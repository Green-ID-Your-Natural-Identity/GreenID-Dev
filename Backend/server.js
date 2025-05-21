// Import required modules
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';  // Importing routes using ES Module syntax
import activityLogRoutes from './routes/activityLogRoutes.js';

// Initialize app
const app = express();
dotenv.config(); // Load environment variables from .env

// Middlewares
app.use(cors());            // Allow frontend to access backend
app.use(express.json());    // Allow backend to read JSON data from requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch((error) => console.error("❌ MongoDB connection error:", error));

// Basic Route (Testing)
app.get("/", (req, res) => {
    res.send("🚀 Backend is working!");
});

// Use user routes for all '/api/users' paths
app.use('/api/users', userRoutes); // All user-related routes are prefixed with '/api/users'
app.use('/api/activity', activityLogRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
