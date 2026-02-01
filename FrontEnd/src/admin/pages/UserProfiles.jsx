import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserProfiles() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserLogs, setSelectedUserLogs] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState('');

  // Fetch all users on mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Fetch all users
  async function fetchAllUsers() {
    try {
      setError('');
      setLoadingUsers(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        withCredentials: true,
      });
      setUsers(response.data.users || []);
      setLoadingUsers(false);
    } catch {
      setError('Failed to load users');
      setLoadingUsers(false);
    }
  }

  // Fetch users based on search query
  async function fetchUsers() {
    try {
      setError('');
      setLoadingUsers(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        params: { search },
        withCredentials: true,
      });
      setUsers(response.data.users || []);
      setLoadingUsers(false);
    } catch {
      setError('Failed to load users');
      setLoadingUsers(false);
    }
  }

  // Fetch logs for selected user
  async function fetchUserLogs(userId) {
    try {
      setError('');
      setLoadingLogs(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/logs`, {
        withCredentials: true,
      });
      setSelectedUserLogs(response.data.logs || []);
      setLoadingLogs(false);
    } catch {
      setError('Failed to load user logs');
      setLoadingLogs(false);
    }
  }

  // On search submit
  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) {
      fetchUsers();
    } else {
      fetchAllUsers();
    }
    setSelectedUser(null);
    setSelectedUserLogs([]);
  };

  // When user is selected
  const handleUserSelect = user => {
    setSelectedUser(user);
    fetchUserLogs(user.uid);
  };

  // Edit points for an activity
  const handleEditPoints = async (logId) => {
    const newPoints = prompt('Enter new points value:');
    if (newPoints === null) return; // User cancelled
    
    const points = parseInt(newPoints);
    if (isNaN(points) || points < 0) {
      alert('Please enter a valid positive number');
      return;
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/admin/logs/${logId}/edit-points`,
        { points },
        { withCredentials: true }
      );
      alert('Points updated successfully!');
      // Refresh the logs
      fetchUserLogs(selectedUser.uid);
    } catch (error) {
      alert('Failed to update points');
      console.error(error);
    }
  };

  // Delete an activity
  const handleDeleteActivity = async (logId) => {
    if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/logs/${logId}`,
        { withCredentials: true }
      );
      alert('Activity deleted successfully!');
      // Refresh the logs and user list
      fetchUserLogs(selectedUser.uid);
      fetchAllUsers();
    } catch (error) {
      alert('Failed to delete activity');
      console.error(error);
    }
  };


  return (
    <div className="max-w-[100vw] p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">View all registered users and their complete activity details</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Search by username, email, or user ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              fetchAllUsers();
              setSelectedUser(null);
              setSelectedUserLogs([]);
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Clear
          </button>
        )}
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Users List */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Users ({users.length})
              </h2>
            </div>
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {loadingUsers ? (
                <div className="p-8 text-center text-gray-500">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No users found</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {users.map(user => (
                    <div
                      key={user._id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedUser?._id === user._id
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="font-semibold text-gray-900">
                        {user.username || user.email?.split('@')[0] || 'No Username'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{user.email}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-green-600">
                          {user.totalPoints || 0} points
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {user._id.slice(-8)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Details & Activity Logs */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {!selectedUser ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-5xl mb-4">👈</div>
                <p className="text-lg">Select a user to view their details and activity logs</p>
              </div>
            ) : (
              <>
                {/* User Details Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedUser.username || selectedUser.email?.split('@')[0] || 'No Username'}
                      </h2>
                      <p className="text-gray-600 mt-1">{selectedUser.email}</p>
                      <p className="text-sm text-gray-500 mt-2 font-mono">
                        User ID: {selectedUser._id}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {selectedUser.totalPoints || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Points</div>
                      <div className="text-sm text-gray-500 mt-2">
                        {selectedUserLogs.length} Activities
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Logs */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Logs</h3>

                  {loadingLogs ? (
                    <div className="py-8 text-center text-gray-500">Loading activities...</div>
                  ) : selectedUserLogs.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      No activity logs found for this user
                    </div>
                  ) : (
                    <div className="max-h-[calc(100vh-450px)] overflow-y-auto space-y-4">
                      {selectedUserLogs.map(log => (
                        <div
                          key={log._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{log.category}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(log.logTime).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                log.Status === 'Approved' 
                                  ? 'bg-green-100 text-green-700' 
                                  : log.Status === 'Rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {log.Status}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                {log.points}/{log.maxPoints} pts
                              </span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEditPoints(log._id); }}
                                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold hover:bg-indigo-200"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteActivity(log._id); }}
                                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold hover:bg-red-100 hover:text-red-600"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-700 text-sm mb-3">{log.description}</p>

                          {/* Media */}
                          {log.media && log.media.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-3">
                              {log.media.map((url, idx) => {
                                const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                                return (
                                  <div key={idx} className="relative">
                                    {isVideo ? (
                                      <video
                                        src={url}
                                        className="w-full h-24 object-cover rounded border border-gray-200"
                                        controls
                                      />
                                    ) : (
                                      <img
                                        src={url}
                                        alt="activity media"
                                        className="w-full h-24 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80"
                                        onClick={() => window.open(url, '_blank')}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Additional Details */}
                          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                            {log.confidenceScore !== null && (
                              <div>
                                <span className="text-gray-600">Confidence Score:</span>
                                <span className="ml-2 font-semibold text-gray-900">
                                  {(log.confidenceScore * 100).toFixed(1)}%
                                </span>
                              </div>
                            )}
                            {log.source && (
                              <div>
                                <span className="text-gray-600">Verification:</span>
                                <span className="ml-2 font-semibold text-gray-900 uppercase">
                                  {log.source}
                                </span>
                              </div>
                            )}
                            {log.location && (
                              <div className="col-span-2">
                                <span className="text-gray-600">Location:</span>
                                <span className="ml-2 text-gray-900">
                                  {log.location.city || 'N/A'}, {log.location.state || 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
