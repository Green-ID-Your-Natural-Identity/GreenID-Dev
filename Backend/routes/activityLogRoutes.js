import express from 'express'
import ActivityLog from '../models/activityLogs.js'
import { uploadActivityMedia } from '../middleware/multer.js';

const router = express.Router();

// Create Activity Log API
router.post('/create-log' , uploadActivityMedia.array('media', 4) , async (req, res) => {
    const { uid, description, media, location } = req.body;

    try {
        if (!uid || !description) {
            return res.status(400).json({ message: 'UID and description are required!' });
        }

        const mediaUrls = req.files?.map(file => file.path);
        // Generate system time
        const currentDate = new Date();
        const readableTime = currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        // Create a new activity log
        const newLog = new ActivityLog({
            uid,
            description,
            media : mediaUrls ,
            location,
            logTime: readableTime
        });

        // Save to database
        await newLog.save();

        res.status(201).json({
            message: 'Activity log created successfully!',
            log: newLog
        });

    } catch (error) {
        res.status(500).json({ message: 'Error creating activity log', error });
    }
});

export default router;
