import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const AdminLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-green-700 text-white p-4">
        <h1 className="text-2xl font-bold mb-6">Green ID Admin</h1>
        <nav className="space-y-4">
          <button onClick={() => navigate('/admin/dashboard')} className="block">📊 Dashboard</button>
          <button onClick={() => navigate('/admin/logs')} className="block">📝 Activity Logs</button>
          <button onClick={() => navigate('/admin/users')} className="block">👥 Users</button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 h-full p-6 bg-gray-50 overflow-y-auto">
        <Outlet /> {/* Render nested admin pages */}
      </main>
    </div>
  );
};

export default AdminLayout;
