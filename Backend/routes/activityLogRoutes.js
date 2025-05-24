import express from 'express'
import ActivityLog from '../models/activityLogs.js'
import { uploadActivityMedia } from '../middleware/multer.js';

const router = express.Router();

// Create Activity Log API
router.post('/create-log' , uploadActivityMedia.array('media', 4) , async (req, res) => {
    const { uid, description, category } = req.body;
    const location = JSON.parse(req.body.location);
    // const points = parseInt(req.body.points) || 0;

    try {
        if (!uid || !description) {
            return res.status(400).json({ message: 'UID and description are required!' });
        }

        const mediaUrls = req.files?.map(file => file.path);
        // console.log("Uploaded Files:", req.files);
        // Generate system time
        const currentDate = new Date();
        const readableTime = currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        // Create a new activity log
        const newLog = new ActivityLog({
            uid,
            category ,
            points : 0 ,
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
        console.error('Activity log error:', error); // 👈 Will now show full object
        return res.status(500).json({
            message: 'Error creating activity log',
            error: error.message || 'Internal Server Error'
        });
    }
});

export default router;
