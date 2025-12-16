import React, { useState } from 'react';
import axios from 'axios';

export default function UserProfiles() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserLogs, setSelectedUserLogs] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState('');

  // Fetch users based on search query
  async function fetchUsers() {
    try {
      setError('');
      setLoadingUsers(true);
      const response = await axios.get('http://localhost:5000/api/admin/users', {
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
      const response = await axios.get(`http://localhost:5000/api/admin/users/${userId}/logs`, {
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
    fetchUsers();
    setSelectedUserId(null);
    setSelectedUserLogs([]);
  };

  // When user is selected
  const handleUserSelect = userId => {
    setSelectedUserId(userId);
    fetchUserLogs(userId);
  };

  return (
    <div className="p-6 text-black">
      <h1 className="text-2xl font-bold mb-4">User Profiles</h1>

      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          placeholder="Search by username or user ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loadingUsers ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="flex gap-6">
          {/* Users List */}
          <div className="w-1/3 border rounded p-4 max-h-[600px] overflow-y-auto">
            <h2 className="font-semibold mb-2">Users</h2>
            <ul>
              {users.map(user => (
                <li
                  key={user._id}
                  className={`cursor-pointer p-2 rounded ${
                    selectedUserId === user._id
                      ? 'bg-blue-200 font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleUserSelect(user._id)}
                >
                  <p>{user.username || user._id}</p>
                  <p className="text-sm text-gray-600">
                    Points: {user.totalPoints || 0}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Selected User Logs */}
          <div className="flex-1 border rounded p-4 max-h-[600px] overflow-y-auto">
            <h2 className="font-semibold mb-2">Activity Logs</h2>

            {!selectedUserId ? (
              <p>Select a user to see their activity logs.</p>
            ) : loadingLogs ? (
              <p>Loading logs...</p>
            ) : selectedUserLogs.length === 0 ? (
              <p>No logs found for this user.</p>
            ) : (
              selectedUserLogs.map(log => (
                <div
                  key={log._id}
                  className="border-b py-3 last:border-b-0"
                >
                  <p>
                    <strong>Category:</strong> {log.category}
                  </p>
                  <p>
                    <strong>Description:</strong> {log.description}
                  </p>
                  <p>
                    <strong>Status:</strong> {log.Status}
                  </p>
                  <p>
                    <strong>Points:</strong> {log.points} / {log.maxPoints}
                  </p>
                  <p>
                    <strong>Logged At:</strong>{' '}
                    {new Date(log.logTime).toLocaleString()}
                  </p>

                  {/* Media */}
                  {log.media && log.media.length > 0 && (
                    <div className="flex space-x-2 overflow-x-auto mt-2">
                      {log.media.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt="activity media"
                          className="h-20 w-20 object-cover rounded cursor-pointer"
                          onClick={() => window.open(url, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
