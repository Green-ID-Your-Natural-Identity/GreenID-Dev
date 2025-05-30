import express from 'express';  // Import express using ES6 import
import User from '../models/user.js';  // Import the User model using ES6 import
import ActivityLog from '../models/activityLogs.js';
import { uploadProfilePic } from '../middleware/multer.js';

const router = express.Router();  // Create a router instance

// User signup route
router.post('/create-profile', uploadProfilePic.single('profilePicture'), async (req, res) => {
    const { uid, fullName, email, age, city, state, country, sustainabilityGoal, shortBio, consentForDataUse } = req.body;
    const profilePicUrl = req.file?.path;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        // Create a new user with location and UID from Firebase
        const newUser = new User({
            uid, // Firebase UID
            fullName,
            email,
            age,
            location: { city, state, country }, // Location split into city, state, country
            profilePicture : profilePicUrl ,
            sustainabilityGoal,
            shortBio,
            consentForDataUse,
        });

        // Save the user to the database
        await newUser.save();

        // Respond with success and user profile
        res.status(201).json({
            message: 'User profile updated successfully!',
            user: newUser // Return the user data after creating
        });
    } catch (error) {
        // Handle errors
        console.error("Error during user creation:", error); // Log the full error
        res.status(500).json({ message: 'Error signing up user', error :error.message });
    }
});

// Add this route in your userRoutes.js
router.get('/get-user-profile', async (req, res) => {
    try {
        const uid = req.query.uid; // Get UID from query parameter
        
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Assuming you have an activity log model and are storing logs per user
        const activityLogs = await ActivityLog.find({ uid });

        // Calculate total points by summing only Approved logs
        const totalPoints = activityLogs
            .filter(log => log.Status === 'Approved')
            .reduce((sum, log) => sum + (log.points || 0), 0);
        // console.log(totalPoints) ;
        
        res.json({ user, activityLogs , totalPoints });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });

    }
});

export default router;  // Export the router as a module
