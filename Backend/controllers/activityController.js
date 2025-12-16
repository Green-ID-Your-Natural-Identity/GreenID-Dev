const axios = require("axios");
const Activity = require("../models/activityLogs");

exports.verifyWalkActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    // Check that coordinates exist
    if (!activity.coordinates || activity.coordinates.length < 2) {
      return res.status(400).json({ error: "No GPS coordinates found" });
    }

    // Send coordinates to Flask service
    const response = await axios.post("http://localhost:5000/verify_walk", {
      coordinates: activity.coordinates,
    });

    const { total_distance_km, walk_valid } = response.data;

    // Apply decision logic
    let status = walk_valid ? "verified" : "rejected";
    let confidenceScore = walk_valid ? 0.9 : 0.3; // simple heuristic
    let points = walk_valid
      ? Math.round(activity.maxPoints * confidenceScore)
      : 0;

    // Update DB
    activity.status = status;
    activity.confidenceScore = confidenceScore;
    activity.points = points;
    activity.distance = total_distance_km;
    await activity.save();

    res.json({
      success: true,
      status,
      total_distance_km,
      confidenceScore,
      points,
    });
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).json({ error: "Verification failed" });
  }
};
