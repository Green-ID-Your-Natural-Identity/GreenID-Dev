import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin session
    axios.get('http://localhost:5000/api/admin/check-auth', { withCredentials: true })
      .then(() => {
        fetchStats();
      })
      .catch(() => {
        navigate('/admin/login');
      });
  }, []);

  const fetchStats = async () => {
    try {
      const pendingRes = await axios.get('http://localhost:5000/api/admin/logs/pending', { withCredentials: true });
      const usersRes = await axios.get('http://localhost:5000/api/admin/users/count', { withCredentials: true });

      setPendingCount(pendingRes.data.count);
      setUserCount(usersRes.data.count);
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    }
  };

  const handleLogout = async () => {
    await axios.post('http://localhost:5000/api/admin/logout', {}, { withCredentials: true });
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🌿 Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-100 p-6 rounded shadow">
          <h2 className="text-xl font-semibold">Pending Activity Logs</h2>
          <p className="text-3xl mt-2">{pendingCount}</p>
        </div>
        <div className="bg-gray-100 p-6 rounded shadow">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-3xl mt-2">{userCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
