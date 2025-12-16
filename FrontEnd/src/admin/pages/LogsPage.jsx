import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch pending logs from backend
  async function fetchLogs() {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/logs/pending-logs', { withCredentials: true });
      setLogs(response.data.logs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  // Approve or Reject log
  async function verifyLog(id, status) {
    try {
      await axios.patch(`http://localhost:5000/api/admin/logs/${id}/verify`, { status }, { withCredentials: true });
      // Optimistic UI update: filter out the log or update status
      setLogs(prevLogs => prevLogs.filter(log => log._id !== id));
    } catch (error) {
      console.error('Error verifying log:', error);
    }
  }

  // Filter logs based on search input
  const filteredLogs = logs.filter(log => 
    log.uid.toLowerCase().includes(search.toLowerCase()) ||
    log.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-4">Pending Activity Logs</h1>

      <input
        type="text"
        placeholder="Search by User ID or Description..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      {loading ? (
        <p>Loading...</p>
      ) : filteredLogs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map(log => (
            <div key={log._id} className="border p-4 rounded shadow">
              <p><strong>User ID:</strong> {log.uid}</p>
              <p><strong>Category:</strong> {log.category}</p>
              <p><strong>Description:</strong> {log.description}</p>
              <p><strong>Status:</strong> {log.Status}</p>
              <p><strong>Points:</strong> {log.points} / {log.maxPoints}</p>
              {log.confidenceScore !== null && <p><strong>Confidence:</strong> {log.confidenceScore}%</p>}

              {/* Media thumbnails */}
              {log.media && log.media.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto mt-2">
                  {log.media.map((url, idx) => (
                    <img key={idx} src={url} alt="activity media" className="h-24 w-24 object-cover rounded cursor-pointer" onClick={() => window.open(url, '_blank')} />
                  ))}
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => verifyLog(log._id, 'Approved')}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => verifyLog(log._id, 'Rejected')}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
