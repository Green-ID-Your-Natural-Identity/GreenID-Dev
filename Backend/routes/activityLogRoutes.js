import express from "express";
import ActivityLog from "../models/activityLogs.js";
import { uploadActivityMedia } from "../middleware/multer.js";
import axios from "axios";

const router = express.Router();

// 📍 Category-wise max point config
const activityOptions = [
  { label: "🌳 Tree Plantation", value: "Tree Plantation", points: 20 },
  { label: "🚴‍♀️ Sustainable Commute", value: "Sustainable Commute", points: 10 },
  { label: "🔁 Recycling & Reuse", value: "Recycling & Reuse", points: 15 },
  {
    label: "♻️ Plastic Waste Reduction",
    value: "Plastic Waste Reduction",
    points: 5,
  },
  { label: "🌞 Energy Saving", value: "Energy Saving", points: 8 },
  { label: "💧 Water Conservation", value: "Water Conservation", points: 10 },
  {
    label: "📚 Sustainability Awareness",
    value: "Sustainability Awareness",
    points: 30,
  },
  { label: "🍃 Clean-up Drives", value: "Clean-up Drive", points: 25 },
  { label: "🌿 Urban Gardening", value: "Urban Gardening", points: 15 },
  { label: "🧼 Watering Plants", value: "Watering Plants", points: 2 },
  { label: "Others", value: "others", points: 10 },
];

// 🧠 Placeholder ML Model Verifier
function dummyMLVerifier(description, category) {
  // Simulate a dummy confidence score between 30-90
  const confidence = Math.floor(Math.random() * 60) + 30;
  return confidence;
}

// 🔍 Extract max points from config
function getMaxPointsForCategory(category) {
  const found = activityOptions.find((opt) => opt.value === category);
  return found ? found.points : 0;
}

// Create Activity Log API
router.post(
  "/create-log",
  uploadActivityMedia.array("media", 4),
  async (req, res) => {
    const { uid, description, category } = req.body;
    const location = JSON.parse(req.body.location);
    // const points = parseInt(req.body.points) || 0;
    const coordinates = req.body.coordinates
      ? JSON.parse(req.body.coordinates)
      : [];

    try {
      if (!uid || !description || description.trim().length < 40) {
        return res.status(400).json({
          message: "Description Should have Atleast 50 Characters",
        });
      }

      const mediaUrls = req.files?.map((file) => file.path);
      // console.log("Uploaded Files:", req.files);
      // Generate system time
      const currentDate = new Date();
      // const readableTime = currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const maxPoints = getMaxPointsForCategory(category);

      // Create a new activity log
      const newLog = new ActivityLog({
        uid,
        category,
        maxPoints,
        points: 0,
        description,
        media: mediaUrls,
        Status: "Pending",
        confidenceScore: null,
        source: null,
        location,
        coordinates,
        logTime: currentDate,
      });

      // Save to database
      await newLog.save();

      res.status(201).json({
        message: "Activity log created successfully!",
        log: newLog,
      });

      // 🧠 Begin verification logic after save
      let autoUpdated = false;

      // 🔀 "Others" always go to manual
      if (category === "others") {
        newLog.Status = "Manual_Review";
      }

      // 🧼 Watering Plants — use geolocation (placeholder)
      else if (category === "Watering Plants") {
        // Future: match location history
        newLog.Status = "Approved";
        newLog.points = maxPoints;
        newLog.source = "geo";
        autoUpdated = true;
      } else if (
        category === "Sustainable Commute" &&
        coordinates.length >= 2
      ) {
        try {
          const flaskRes = await axios.post(
            "http://127.0.0.1:5000/verify_walk",
            {
              coordinates,
            }
          );

          const { total_distance_km, walk_valid } = flaskRes.data;
          newLog.modelOutput = flaskRes.data;
          newLog.source = "geo";
          newLog.confidenceScore = walk_valid ? 0.9 : 0.4;

          if (walk_valid) {
            newLog.schematatus = "Approved";
            newLog.points = Math.round(maxPoints * 0.9);
          } else {
            newLog.Status = "Rejected";
            newLog.points = 0;
          }

          autoUpdated = true;
          console.log(
            `✅ Flask verified walk: ${total_distance_km} km | Valid: ${walk_valid}`
          );
        } catch (err) {
          console.error("Flask verification failed:", err.message);
          newLog.Status = "Manual_Review";
        }
      } else {
        const confidence = dummyMLVerifier(description, category);
        newLog.confidenceScore = confidence;
        console.log(confidence);

        if (confidence > 70) {
          newLog.Status = "Approved";
          newLog.points = maxPoints;
          newLog.source = "ml";
          autoUpdated = true;
        } else if (confidence < 40) {
          newLog.Status = "Rejected";
          newLog.points = 0;
          newLog.source = "ml";
          autoUpdated = true;
        } else {
          newLog.Status = "Manual_Review";
        }
      }

      // Save updated log with verification result
      if (autoUpdated) {
        await newLog.save();
      }
    } catch (error) {
      console.error("Activity log error:", error); // 👈 Will now show full object
      return res.status(500).json({
        message: "Error creating activity log",
        error: error.message || "Internal Server Error",
      });
    }
  }
);

export default router;
