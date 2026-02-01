import express from "express";
import ActivityLog from "../models/activityLogs.js";
import { uploadActivityMedia } from "../middleware/multer.js";
import axios from "axios";

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:5000";

// 📍 Category-wise max point config
const activityOptions = [
  { label: "🌳 Tree Plantation", value: "Tree Plantation", points: 20 },
  { label: "🚴‍♀️ Sustainable Commute", value: "Sustainable Commute", points: 10 },
  { label: "🚌 Public Transport", value: "Public Transport", points: 15 },
  {
    label: "📚 Sustainability Awareness",
    value: "Sustainability Awareness",
    points: 30,
  },
  { label: "🍃 Clean-up Drives", value: "Clean-up Drive", points: 25 },
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

      // 🧠 Begin verification logic BEFORE sending response
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
            `${ML_URL}/verify_walk`,
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
      }
      // 🌳 Tree Plantation — use ML video analysis
      else if (category === "Tree Plantation" && mediaUrls && mediaUrls.length > 0) {
        try {
          // Check if media is a video file
          const videoUrl = mediaUrls.find(url => 
            url.toLowerCase().match(/\.(mp4|mov|avi|webm)$/)
          );
          
          if (!videoUrl) {
            // No video found, send to manual review
            newLog.Status = "Manual_Review";
            console.log("⚠️ Tree Plantation requires video, no video found");
          } else {
            // Use FormData to send video to ML service
            const FormData = (await import('form-data')).default;
            const formData = new FormData();
            
            // Download video from Cloudinary and send to ML service
            const videoResponse = await axios.get(videoUrl, {
              responseType: 'arraybuffer'
            });
            
            formData.append('video', Buffer.from(videoResponse.data), {
              filename: 'planting.mp4',
              contentType: 'video/mp4'
            });
            
            const mlRes = await axios.post(
              `${ML_URL}/verify_planting`,
              formData,
              {
                headers: formData.getHeaders()
              }
            );
            
            const { is_valid, confidence, evidence, reason } = mlRes.data;
            
            newLog.modelOutput = mlRes.data;
            newLog.source = "ml";
            newLog.confidenceScore = confidence;
            
            // Decision logic
            if (is_valid && confidence >= 0.6) {
              newLog.Status = "Approved";
              newLog.points = Math.round(maxPoints * confidence);
              autoUpdated = true;
            } else if (confidence >= 0.4 && confidence < 0.6) {
              newLog.Status = "Manual_Review";
            } else {
              newLog.Status = "Rejected";
              newLog.points = 0;
              autoUpdated = true;
            }
            
            console.log(
              `✅ ML verified planting: ${reason} | Confidence: ${(confidence * 100).toFixed(2)}%`
            );
          }
        } catch (err) {
          console.error("ML planting verification failed:", err.message);
          newLog.Status = "Manual_Review";
        }
      }
      // 🚌 Public Transport — use ML image classification
      else if (category === "Public Transport" && mediaUrls && mediaUrls.length > 0) {
        try {
          // Use FormData to send image to ML service
          const FormData = (await import('form-data')).default;
          const formData = new FormData();
          
          // Extract image URL from Cloudinary (first media item)
          const imageUrl = mediaUrls[0];
          
          // Download image from Cloudinary and send to ML service
          const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
          });
          
          formData.append('image', Buffer.from(imageResponse.data), {
            filename: 'transport.jpg',
            contentType: 'image/jpeg'
          });
          
          const mlRes = await axios.post(
            `${ML_URL}/verify_public_transport`,
            formData,
            {
              headers: formData.getHeaders()
            }
          );
          
          const { predicted_class, confidence, all_probabilities, is_valid } = mlRes.data;
          
          newLog.modelOutput = mlRes.data;
          newLog.source = "ml";
          newLog.confidenceScore = confidence;
          
          // Decision logic
          if (predicted_class === "not_transport") {
            newLog.Status = "Rejected";
            newLog.points = 0;
            autoUpdated = true;
          } else if (is_valid && confidence >= 0.7) {
            newLog.Status = "Approved";
            newLog.points = Math.round(maxPoints * confidence);
            autoUpdated = true;
          } else if (confidence >= 0.4 && confidence < 0.7) {
            newLog.Status = "Manual_Review";
          } else {
            newLog.Status = "Rejected";
            newLog.points = 0;
            autoUpdated = true;
          }
          
          console.log(
            `✅ ML verified transport: ${predicted_class} | Confidence: ${(confidence * 100).toFixed(2)}%`
          );
        } catch (err) {
          console.error("ML verification failed:", err.message);
          newLog.Status = "Manual_Review";
        }
      }
      // 🍃 Clean-up Drive — use ML before/after image comparison
      else if (category === "Clean-up Drive" && mediaUrls && mediaUrls.length >= 2) {
        try {
          // Use FormData to send before and after images to ML service
          const FormData = (await import('form-data')).default;
          const formData = new FormData();
          
          // Get before and after image URLs (expect exactly 2 images)
          const beforeImageUrl = mediaUrls[0];
          const afterImageUrl = mediaUrls[1];
          
          // Download both images from Cloudinary
          const beforeImageResponse = await axios.get(beforeImageUrl, {
            responseType: 'arraybuffer'
          });
          
          const afterImageResponse = await axios.get(afterImageUrl, {
            responseType: 'arraybuffer'
          });
          
          // Append both images to form data
          formData.append('before', Buffer.from(beforeImageResponse.data), {
            filename: 'before.jpg',
            contentType: 'image/jpeg'
          });
          
          formData.append('after', Buffer.from(afterImageResponse.data), {
            filename: 'after.jpg',
            contentType: 'image/jpeg'
          });
          
          const mlRes = await axios.post(
            `${ML_URL}/verify_cleanup`,
            formData,
            {
              headers: formData.getHeaders()
            }
          );
          
          const { is_valid, confidence, reason, details } = mlRes.data;
          
          newLog.modelOutput = mlRes.data;
          newLog.source = "ml";
          newLog.confidenceScore = confidence;
          
          // Decision logic
          if (is_valid && confidence >= 0.6) {
            newLog.Status = "Approved";
            newLog.points = Math.round(maxPoints * confidence);
            autoUpdated = true;
          } else if (confidence >= 0.4 && confidence < 0.6) {
            newLog.Status = "Manual_Review";
          } else {
            newLog.Status = "Rejected";
            newLog.points = 0;
            autoUpdated = true;
          }
          
          console.log(
            `✅ ML verified cleanup: ${reason} | Confidence: ${(confidence * 100).toFixed(2)}%`
          );
        } catch (err) {
          console.error("ML cleanup verification failed:", err.message);
          newLog.Status = "Manual_Review";
        }
      } else {
        // const confidence = dummyMLVerifier(description, category);
        // newLog.confidenceScore = confidence;
        // console.log(confidence);

        // if (confidence > 70) {
        //   newLog.Status = "Approved";
        //   newLog.points = maxPoints;
        //   newLog.source = "ml";
        //   autoUpdated = true;
        // } else if (confidence < 40) {
        //   newLog.Status = "Rejected";
        //   newLog.points = 0;
        //   newLog.source = "ml";
        //   autoUpdated = true;
        // } else {
        //   newLog.Status = "Manual_Review";
        // }
        
        // No specific verification logic, send to manual review
        newLog.Status = "Manual_Review";
        console.log("ℹ️ Standard category, sent to manual review.");
      }

      // Save updated log with verification result
      if (autoUpdated) {
        await newLog.save();
      }

      // ✅ Send response AFTER verification completes
      res.status(201).json({
        message: "Activity log created successfully!",
        log: newLog,
      });
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
