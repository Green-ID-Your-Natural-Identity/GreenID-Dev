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

    maxPoints: {  // 🆕 Max possible points allowed for this activity category
        type: Number,
        required: true
    },

    Status: {     // 🆕 Status of verification
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Manual_Review'],
        default: 'Pending'
    },

    confidenceScore: { // 🆕 ML model's confidence score (placeholder for now)
        type: Number,
        default: null
    },

    source: {  // 🆕 Who verified this? ml / manual / geo
        type: String,
        enum: ['ml', 'manual', 'geo', null],
        default: null
    },

    points: {
        type : Number ,
        default : 0 ,
    } ,

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
