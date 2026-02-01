import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfileForm from './pages/ProfileForm'
import ProfilePage from './pages/ProfilePage'
import ActivityLogPage from './pages/ActivityLogPage'
import HariBabaChat from './pages/ChatBot'
import ChatBot from './pages/ChatBot'
import { ToastContainer } from 'react-toastify'
import './App.css'

// Admin pages
import AdminLogin from './admin/pages/AdminLogin'
import Dashboard from './admin/pages/Dashboard'
import LogsPage from './admin/pages/LogsPage'
import UserProfiles from './admin/pages/UserProfiles'
import ProtectedRoute from './admin/components/ProtectedRoute'
import AdminLayout from './admin/pages/Adminlayout'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <>
      <Routes>
        {/* 🌱 User Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/form" element={<ProfileForm />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/activity-log" element={<><ActivityLogPage /><HariBabaChat /></>} />
        <Route path="/chatbot" element={<ChatBot />} />

        {/* 🛡 Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="users" element={<UserProfiles />} />
        </Route>
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        toastStyle={{
          fontSize: '0.875rem',
          minWidth: '350px',
          minHeight: '25px',
          borderRadius: '10px',
          padding: '12px 16px',
        }}
        theme="colored"
      />
    </>
  )
}

export default App
