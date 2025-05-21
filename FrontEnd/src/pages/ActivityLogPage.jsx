import React, { useState, useEffect, useCallback } from 'react';

const ActivityLogPage = () => {
    const [description, setDescription] = useState('');
    const [logs, setLogs] = useState([]);
    const [media, setMedia] = useState([]);
    const [location, setLocation] = useState({ latitude: null, longitude: null });

    const storedUser = localStorage.getItem("userData");
    const { uid } = storedUser ? JSON.parse(storedUser) : {};

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        });
    }, []);

    const fetchLogs = useCallback(() => {
        fetch(`http://localhost:5000/api/users/get-user-profile?uid=${uid}`)
            .then(res => res.json())
            .then(data => setLogs(data.activityLogs))
            .catch(err => console.error("Error fetching logs:", err));
    }, [uid]);

    useEffect(() => {
        if (uid) fetchLogs();
    }, [fetchLogs, uid]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('uid', uid);
        formData.append('description', description);
        formData.append('location', JSON.stringify(location));

        // Append all selected media files
        media.forEach((file) => {
            formData.append('media', file);
        });

        try {
            const res = await fetch("http://localhost:5000/api/activity/create-log", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setDescription('');
                setMedia([]);
                fetchLogs();
            } else {
                console.error("Error:", data.message);
            }
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 4) {
            alert("Max 4 files allowed!");
            return;
        }
        setMedia(files);
    };

    const isVideo = (url) => url.match(/\.(mp4|mov)$/i);

    return (
        <div className="min-w-[100vh] mx-auto mt-10 px-6 py-10 rounded-xl bg-blue-300">
            <h2 className="text-2xl font-semibold mb-4 text-center">📝 Log New Activity</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
                <textarea
                    className="border border-gray-300 rounded-md p-3 resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="What did you do today?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input
                    className="bg-black p-4 rounded text-white"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaChange}
                />
                <button
                    type="submit"
                    className="bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                >
                    Log Activity
                </button>
            </form>

            <div className="border-t pt-4">
                <h3 className="text-xl  font-medium mb-4">📜 Past Logs</h3>

                {logs.length > 0 ? (
                    logs.map((log) => (
                        <div
                            key={log._id}
                            className="bg-white border rounded-lg shadow p-4 mb-4"
                        >
                            <p className="mb-2 text-black"><span className="font-semibold text-black">Description:</span> {log.description}</p>
                            <p className="text-sm text-gray-500 mb-2"><span className="font-medium">Logged at:</span> {log.logTime}</p>

                            {log.media?.length > 0 && (
                                <div className="flex gap-3 flex-wrap mt-3">
                                    {log.media.map((url, index) =>
                                        isVideo(url) ? (
                                            <video
                                                key={index}
                                                src={url}
                                                controls
                                                className="w-48 h-36 rounded border"
                                            />
                                        ) : (
                                            <img
                                                key={index}
                                                src={url}
                                                alt="activity media"
                                                className="w-24 h-24 object-cover rounded-md border"
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
