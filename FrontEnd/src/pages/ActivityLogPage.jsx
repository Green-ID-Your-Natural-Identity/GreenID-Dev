import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import FloatingChatWidget from "../components/FloatingChatWidget";

const activityOptions = [
  { label: "🌳 Tree Plantation", value: "Tree Plantation", points: 20 },
  { label: "🚴‍♀️ Sustainable Commute", value: "Sustainable Commute", points: 10 },
  { label: "🚌 Public Transport", value: "Public Transport", points: 15 },
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

const ActivityLogPage = () => {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [points, setPoints] = useState(0);
  const [logs, setLogs] = useState([]);
  const [media, setMedia] = useState([]);
  const fileInputRef = useRef(null);
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const beforeFileInputRef = useRef(null);
  const afterFileInputRef = useRef(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [coordinates, setCoordinates] = useState([]);
  const [isMarkingWalk, setIsMarkingWalk] = useState(false);

  const { user, setUser } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.warn("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (error) => {
        console.error("Geo error:", error);
        toast.error("Unable to retrieve your location.");
      }
    );
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/get-user-profile?uid=${uid}`
      );
      setLogs(res.data.activityLogs || []);
    } catch (err) {
      console.error("Fetch logs error:", err);
      toast.error("Could not load past logs.");
    }
  }, [uid]);

  useEffect(() => {
    if (uid) fetchLogs();
  }, [fetchLogs, uid]);

  const handleCategoryChange = (e) => {
    const sel = activityOptions.find((o) => o.value === e.target.value);
    setCategory(sel?.value || "");
    setPoints(sel?.points || 0);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: null }));
    }
  };

  const markStart = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported!");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordinates([{ lat: latitude, lon: longitude }]);
        setIsMarkingWalk(true);
        toast.success("✅ Start location recorded!");
      },
      (err) => {
        console.error(err);
        toast.error("Failed to get start location!");
      }
    );
  };

  const markEnd = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported!");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordinates((prev) => [...prev, { lat: latitude, lon: longitude }]);
        setIsMarkingWalk(false);
        toast.success("✅ End location recorded!");
      },
      (err) => {
        console.error(err);
        toast.error("Failed to get end location!");
      }
    );
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: null }));
    }
  };

  const processDescription = (text) => {
    return text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/(^\w|\.\s*\w)/g, (match) => match.toUpperCase())
      .replace(
        /([.!?])\s*([a-z])/g,
        (match, punct, letter) => punct + " " + letter.toUpperCase()
      );
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      setMedia([]);
      return;
    }
    if (files.length > 4) {
      toast.error("Only up to 4 files are allowed.");
      return;
    }
    if (files.some((f) => f.size > 10 * 1024 * 1024)) {
      toast.error("Each file must be under 10MB.");
      return;
    }
    
    // For Tree Plantation, only allow videos
    if (category === "Tree Plantation") {
      if (files.some((f) => !f.type.startsWith("video/"))) {
        toast.error("Tree Plantation requires video files only.");
        return;
      }
    } else {
      // For other categories, allow images and videos
      if (
        files.some(
          (f) => !f.type.startsWith("image/") && !f.type.startsWith("video/")
        )
      ) {
        toast.error("Only image and video files are allowed.");
        return;
      }
    }
    
    setMedia(files);
    setProgress(0);
    if (errors.media) {
      setErrors((prev) => ({ ...prev, media: null }));
    }
  };

  const handleBeforeImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setBeforeImage(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    setBeforeImage(file);
    if (errors.beforeImage) {
      setErrors((prev) => ({ ...prev, beforeImage: null }));
    }
  };

  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAfterImage(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    setAfterImage(file);
    if (errors.afterImage) {
      setErrors((prev) => ({ ...prev, afterImage: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!category) {
      newErrors.category = "Please select an activity category.";
      toast.error("Please select an activity category.");
    }

    if (!description.trim()) {
      newErrors.description = "Please fill out the description.";
      toast.error("Please fill out the description.");
    }

    // Special validation for Clean-up Drive
    if (category === "Clean-up Drive") {
      if (!beforeImage) {
        newErrors.beforeImage = "Please upload a before image.";
        toast.error("Please upload a before image.");
      }
      if (!afterImage) {
        newErrors.afterImage = "Please upload an after image.";
        toast.error("Please upload an after image.");
      }
    } else {
      // Regular media validation for other categories
      if (media.length === 0) {
        newErrors.media = "Please upload at least one media file.";
        toast.error("Please upload at least one media file.");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const form = new FormData();
    form.append("uid", uid);
    form.append("description", processDescription(description));
    form.append("category", category);
    // form.append('points', points);
    form.append("location", JSON.stringify(location));
    form.append("status", "pending");
    // form.append('maxPoints', points); // max allowed for category
    form.append("source", "user");

    if (category === "Sustainable Commute") {
      form.append("coordinates", JSON.stringify(coordinates));
    }
    
    // For Clean-up Drive, append before and after images separately
    if (category === "Clean-up Drive") {
      form.append("media", beforeImage);
      form.append("media", afterImage);
    } else {
      media.forEach((f) => form.append("media", f));
    }

    setUploading(true);
    try {
      await axios.post("http://localhost:5000/api/activity/create-log", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) =>
          setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      toast.success("🎉 Activity logged successfully!");

      setDescription("");
      setCategory("");
      setPoints(0);
      setMedia([]);
      setBeforeImage(null);
      setAfterImage(null);
      setErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (beforeFileInputRef.current) beforeFileInputRef.current.value = "";
      if (afterFileInputRef.current) afterFileInputRef.current.value = "";

      fetchLogs();
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err.response?.data?.message;
      toast.error(msg || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeMedia = (indexToRemove) => {
    setMedia(media.filter((_, i) => i !== indexToRemove));
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Recently";
      }
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Recently";
    }
  };

  const isVideo = (url) => /\.(mp4|mov)$/i.test(url);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <p className="text-xl text-gray-700">🔒 Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[100vw] bg-gradient-to-br from-blue-200 via-white to-green-200 overflow-x-hidden">
      {/* Navigation Bar - Glass Effect (Exact same as ProfilePage) */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <img 
                src="/Purple1.png" 
                alt="GreenID Logo" 
                className="h-16"
              />
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all"
              >
                Profile
              </button>
              <button
                onClick={() => navigate('/activity-log')}
                className="px-4 py-2 text-gray-900 bg-white/70 rounded-lg font-semibold shadow-sm"
              >
                Activity Log
              </button>
              <button
                onClick={() => navigate('/chatbot')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-white/50 rounded-lg font-medium transition-all"
              >
                Chatbot
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-gray-900/90 hover:bg-gray-900 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Log Form (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                  📝 Log New Activity
                </h2>
                <p className="text-gray-600 text-lg">
                  Make a positive impact and earn points!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Activity Category
                  </label>
                  <select
                    className={`w-full border-2 ${
                      errors.category
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-green-500"
                    } 
                      rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-green-100 text-lg bg-white text-gray-800
                      transition-all duration-200 hover:border-green-400`}
                    value={category}
                    onChange={handleCategoryChange}
                    required
                  >
                    <option value="" disabled>
                      🌍 Select Activity Category
                    </option>
                    {activityOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm flex items-center">
                      <span className="text-red-400 mr-1">⚠️</span>
                      {errors.category}
                    </p>
                  )}
                </div>

                {category === "Sustainable Commute" && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                    <p className="text-blue-800 font-semibold mb-2">
                      🚶 Walking Tracker
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={markStart}
                        disabled={coordinates.length > 0}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all disabled:bg-gray-400"
                      >
                        Mark Start
                      </button>
                      <button
                        type="button"
                        onClick={markEnd}
                        disabled={
                          coordinates.length === 0 || coordinates.length >= 2
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all disabled:bg-gray-400"
                      >
                        Mark End
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {coordinates.length === 0
                        ? "No points marked yet."
                        : coordinates.length === 1
                        ? "Start point recorded."
                        : "✅ Start & End recorded."}
                    </p>
                  </div>
                )}

                {points > 0 && (
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 rounded-2xl p-4">
                    <p className="text-green-800 font-semibold flex items-center">
                      <span className="text-green-600 mr-2">🏆</span>
                      You'll earn <span className="font-bold mx-1">
                        {points}
                      </span>{" "}
                      points for this activity!
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    className={`w-full border-2 ${
                      errors.description
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-green-500"
                    } 
                      rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-green-100 resize-y h-32 text-lg bg-white text-gray-800
                      transition-all duration-200 hover:border-green-400`}
                    placeholder="Tell us about your eco-friendly activity... 🌱"
                    value={description}
                    onChange={handleDescriptionChange}
                    required
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm flex items-center">
                      <span className="text-red-400 mr-1">⚠️</span>
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Conditional rendering for Clean-up Drive vs other categories */}
                {category === "Clean-up Drive" ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Upload Before & After Images</h4>
                    
                    {/* Before Image */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        📸 Before Image
                      </label>
                      <div
                        className={`border-2 border-dashed ${
                          errors.beforeImage ? "border-red-400" : "border-gray-300"
                        } 
                        rounded-2xl p-6 bg-gray-50 hover:border-green-400 transition-all duration-200`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          ref={beforeFileInputRef}
                          onChange={handleBeforeImageChange}
                          disabled={uploading}
                          className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6
                            file:rounded-xl file:border-0 file:text-sm file:font-semibold
                            file:bg-gradient-to-r file:from-blue-500 file:to-blue-600 file:text-white
                            hover:file:from-blue-600 hover:file:to-blue-700 file:transition-all file:duration-200
                            file:shadow-lg hover:file:shadow-xl"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload image showing area before cleanup (max 10MB)
                        </p>
                      </div>
                      {errors.beforeImage && (
                        <p className="text-red-500 text-sm flex items-center">
                          <span className="text-red-400 mr-1">⚠️</span>
                          {errors.beforeImage}
                        </p>
                      )}
                      {beforeImage && (
                        <div className="mt-2">
                          <img
                            src={URL.createObjectURL(beforeImage)}
                            alt="Before cleanup"
                            className="w-full h-48 object-cover rounded-xl shadow-md"
                          />
                        </div>
                      )}
                    </div>

                    {/* After Image */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        ✨ After Image
                      </label>
                      <div
                        className={`border-2 border-dashed ${
                          errors.afterImage ? "border-red-400" : "border-gray-300"
                        } 
                        rounded-2xl p-6 bg-gray-50 hover:border-green-400 transition-all duration-200`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          ref={afterFileInputRef}
                          onChange={handleAfterImageChange}
                          disabled={uploading}
                          className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6
                            file:rounded-xl file:border-0 file:text-sm file:font-semibold
                            file:bg-gradient-to-r file:from-green-500 file:to-emerald-500 file:text-white
                            hover:file:from-green-600 hover:file:to-emerald-600 file:transition-all file:duration-200
                            file:shadow-lg hover:file:shadow-xl"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload image showing area after cleanup (max 10MB)
                        </p>
                      </div>
                      {errors.afterImage && (
                        <p className="text-red-500 text-sm flex items-center">
                          <span className="text-red-400 mr-1">⚠️</span>
                          {errors.afterImage}
                        </p>
                      )}
                      {afterImage && (
                        <div className="mt-2">
                          <img
                            src={URL.createObjectURL(afterImage)}
                            alt="After cleanup"
                            className="w-full h-48 object-cover rounded-xl shadow-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Upload Media
                    </label>
                    <div
                      className={`border-2 border-dashed ${
                        errors.media ? "border-red-400" : "border-gray-300"
                      } 
                      rounded-2xl p-6 bg-gray-50 hover:border-green-400 transition-all duration-200`}
                    >
                      <input
                        type="file"
                        accept={category === "Tree Plantation" ? "video/*" : "image/*,video/*"}
                        multiple
                        ref={fileInputRef}
                        onChange={handleMediaChange}
                        disabled={uploading}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6
                          file:rounded-xl file:border-0 file:text-sm file:font-semibold
                          file:bg-gradient-to-r file:from-green-500 file:to-emerald-500 file:text-white
                          hover:file:from-green-600 hover:file:to-emerald-600 file:transition-all file:duration-200
                          file:shadow-lg hover:file:shadow-xl"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {category === "Tree Plantation" 
                          ? "🎥 Upload videos only (max 10MB each)" 
                          : "📷 Upload up to 4 images or videos (max 10MB each)"}
                      </p>
                    </div>
                    {errors.media && (
                      <p className="text-red-500 text-sm flex items-center">
                        <span className="text-red-400 mr-1">⚠️</span>
                        {errors.media}
                      </p>
                    )}
                  </div>
                )}

                {media.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Media Preview:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {media.map((f, idx) => {
                        const url = URL.createObjectURL(f);
                        return (
                          <div key={idx} className="relative group">
                            {f.type.startsWith("video/") ? (
                              <video
                                src={url}
                                className="w-full h-32 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                              />
                            ) : (
                              <img
                                src={url}
                                className="w-full h-32 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeMedia(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 
                                opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                            >
                              <span className="text-xs font-bold">✕</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 ease-out shadow-sm"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full py-4 rounded-2xl text-xl font-bold text-white shadow-lg transform transition-all duration-200
                    ${
                      uploading
                        ? "bg-gray-400 cursor-not-allowed scale-100"
                        : "bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 hover:shadow-xl active:scale-95"
                    }
                  `}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⏳</span>
                      Uploading {progress}%...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">🚀</span>
                      Log Activity
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Recent Activities (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  📜 Recent Activities
                </h3>
                <p className="text-sm text-gray-600">Last 3 activities</p>
              </div>

              {logs.length > 0 ? (
                <div className="space-y-4">
                  {[...logs].reverse().slice(0, 3).map((log) => (
                    <div
                      key={log._id}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 
                      rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-12 h-12">
                          {log.media?.length > 0 ? (
                            <div className="relative">
                              {isVideo(log.media[0]) ? (
                                <video
                                  src={log.media[0]}
                                  className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                />
                              ) : (
                                <img
                                  src={log.media[0]}
                                  alt="activity thumbnail"
                                  className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center text-xl">
                              🌱
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate text-left">
                            {log.category}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2 text-left">
                            {log.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-left">
                            <span
                              className={`font-semibold ${
                                log.Status === "Approved"
                                  ? "text-green-600"
                                  : log.Status === "Rejected"
                                  ? "text-red-500"
                                  : "text-yellow-600"
                              }`}
                            >
                              {log.Status || "Pending"}
                            </span>
                            <span className="text-gray-500">
                              {log.points ?? "..."} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🌱</div>
                  <p className="text-gray-600 text-sm">
                    No activities yet.
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Start logging above!
                  </p>
                </div>
              )}

              {logs.length > 3 && (
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all text-sm"
                >
                  View All Activities →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
};

export default ActivityLogPage;
