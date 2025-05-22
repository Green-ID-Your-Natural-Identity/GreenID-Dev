import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    uid: { 
        type: String, 
        required: true 
    },
    category: {
        type : String ,
        required : true
    } ,
    points: Number,
    description: { 
        type: String, 
        required: true 
    },
    media: [{ 
        type: String 
    }],
    location: {  // 📍 Optional
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        }
    },
    logTime: {  // 🕒 System se automatically generate hoga
        type: String, 
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
