// In models/user.js
import mongoose from 'mongoose';

// Define the User schema
const userSchema = new mongoose.Schema({
    uid: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    location: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true }
    },
    profilePicture: { type: String },
    sustainabilityGoal: { type: String },
    shortBio: { type: String },
    consentForDataUse: { type: Boolean, required: true }
}, { collection: 'users' });  // Ensure correct collection name

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model using default export
export default User;
