import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const activityOptions = [
  { label: "🌳 Tree Plantation", value: "Tree Plantation", points: 20 },
  { label: "🚴‍♀️ Sustainable Commute", value: "Sustainable Commute", points: 10 },
  { label: "🔁 Recycling & Reuse", value: "Recycling & Reuse", points: 15 },
  { label: "♻️ Plastic Waste Reduction", value: "Plastic Waste Reduction", points: 10 },
  { label: "🌞 Energy Saving", value: "Energy Saving", points: 8 },
  { label: "💧 Water Conservation", value: "Water Conservation", points: 10 },
  { label: "📚 Sustainability Awareness", value: "Sustainability Awareness", points: 30 },
  { label: "🍃 Clean-up Drives", value: "Clean-up Drive", points: 25 },
  { label: "🌿 Urban Gardening", value: "Urban Gardening", points: 15 },
  { label: "🧼 Eco-brick Making", value: "Eco-brick Making", points: 20 },
];

const ActivityLogPage = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [points, setPoints] = useState(0);
  const [logs, setLogs] = useState([]);
  const [media, setMedia] = useState([]);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const stored = localStorage.getItem('userData');
  const { uid } = stored ? JSON.parse(stored) : {};

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.warn('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      error => {
        console.error('Geo error:', error);
        toast.error('Unable to retrieve your location.');
      }
    );
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/get-user-profile?uid=${uid}`);
      setLogs(res.data.activityLogs || []);
    } catch (err) {
      console.error('Fetch logs error:', err);
      toast.error('Could not load past logs.');
    }
  }, [uid]);

  useEffect(() => {
    if (uid) fetchLogs();
  }, [fetchLogs, uid]);

  const handleCategoryChange = e => {
    const sel = activityOptions.find(o => o.value === e.target.value);
    setCategory(sel.value);
    setPoints(sel.points);
  };

  const handleMediaChange = e => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      setMedia([]);
      return;
    }
    if (files.length > 4) {
      toast.error('Only up to 4 files are allowed.');
      return;
    }
    if (files.some(f => f.size > 10 * 1024 * 1024)) {
      toast.error('Each file must be under 10MB.');
      return;
    }
    if (
      files.some(f => !f.type.startsWith('image/') && !f.type.startsWith('video/'))
    ) {
      toast.error('Only image and video files are allowed.');
      return;
    }
    setMedia(files);
    setProgress(0);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!category) {
      toast.error('Please select an activity category.');
      return;
    }
    if (media.length === 0) {
      toast.error('Please upload at least one media file.');
      return;
    }

    const form = new FormData();
    form.append('uid', uid);
    form.append('description', description);
    form.append('category', category);
    form.append('points', points);
    form.append('location', JSON.stringify(location));
    media.forEach(f => form.append('media', f));

    setUploading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/activity/create-log',
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: e => setProgress(Math.round((e.loaded * 100) / e.total))
        }
      );
      toast.success('Activity logged successfully!');
      setDescription('');
      setCategory('');
      setPoints(0);
      setMedia([]);
      fetchLogs();
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message;
      toast.error(msg || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isVideo = url => /\.(mp4|mov)$/i.test(url);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">📝 Log New Activity</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <select
          className="w-full border text-black border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-green-300 text-lg"
          value={category}
          onChange={handleCategoryChange}
          required
        >
          <option value="" disabled>
            Select Activity Category
          </option>
          {activityOptions.map(o => (
            <option key={o.value} value={o.value}>
              {o.label} (+{o.points} pts)
            </option>
          ))}
        </select>

        <textarea
          className="w-full border text-black border-gray-300 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-green-300 resize-y h-32 text-lg"
          placeholder="What did you do today?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />

        <div>
          <label className="block mb-2 font-medium text-gray-700">Select Media</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
            disabled={uploading}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-green-100 file:text-green-700
              hover:file:bg-green-200"
          />
        </div>

        {media.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {media.map((f, idx) => {
              const url = URL.createObjectURL(f);
              return (
                <div key={idx} className="relative group">
                  {f.type.startsWith('video/') ? (
                    <video src={url} className="w-full h-32 object-cover rounded-xl" />
                  ) : (
                    <img src={url} className="w-full h-32 object-cover rounded-xl" />
                  )}
                  <button
                    type="button"
                    onClick={() => setMedia(media.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 bg-red-500 bg-opacity-80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-width"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || media.length === 0}
          className={`w-full py-4 rounded-2xl text-xl font-bold text-white shadow-md transform transition
            ${uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 hover:scale-105'}
          `}
        >
          {uploading ? `Uploading ${progress}%…` : 'Log Activity'}
        </button>
      </form>

      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4 text-green-700">📜 Past Logs</h3>
        {logs.length > 0 ? (
          [...logs].reverse().map(log => (
            <div key={log._id} className="bg-green-50 border text-black border-green-200 rounded-xl p-6 mb-6 shadow-sm">
              <p className="text-lg"><strong>Category:</strong> {log.category}</p>
              <p className="text-lg"><strong>Description:</strong> {log.description}</p>
              <p className="text-gray-600"><strong>Points:</strong> {log.points}</p>
              <p className="text-gray-500 text-sm"><strong>When:</strong> {log.logTime}</p>
              {log.media?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {log.media.map((url, idx) =>
                    isVideo(url) ? (
                      <video key={idx} src={url} controls className="w-full h-32 object-cover rounded-xl" />
                    ) : (
                      <img
                        key={idx}
                        src={url}
                        alt="activity media"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    )
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">No logs yet.</p>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
