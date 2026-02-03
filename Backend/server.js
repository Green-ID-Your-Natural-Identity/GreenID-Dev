// Import required modules
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';  // Importing routes using ES Module syntax
import activityLogRoutes from './routes/activityLogRoutes.js';
import chatRoutes from "./routes/chatRoutes.js"
import adminRoutes from './routes/admin.js' ;
import sessionMiddleware from './config/sessionConfig.js';

// Initialize app
const app = express();
dotenv.config(); // Load environment variables from .env

// Middlewares
app.use(cors({
    origin: [
        'http://localhost:5173', 
        process.env.FRONTEND_URL // Add your Vercel URL in Render Environment Variables
    ].filter(Boolean),
    credentials: true
}));            // Allow frontend to access backend
app.use(express.json());    // Allow backend to read JSON data from requests
app.use(sessionMiddleware); // ✅ VERY IMPORTANT: use before any routes

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch((error) => console.error("❌ MongoDB connection error:", error));

// Basic Route (Testing)
app.get("/", (req, res) => {
    res.send("🚀 Backend is working!");
});

app.use('/api/admin', adminRoutes);

// Use user routes for all '/api/users' paths
app.use('/api/users', userRoutes); // All user-related routes are prefixed with '/api/users'
app.use('/api/activity', activityLogRoutes);
app.use("/api/chatbot", chatRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
