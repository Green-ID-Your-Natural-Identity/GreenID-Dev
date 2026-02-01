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
      {/* 📱 Mobile Restricted Overlay */}
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 md:hidden text-white">
        <h1 className="text-xl font-medium mb-3">Desktop View Only</h1>
        <p className="text-sm opacity-80 font-light">
          Please access GreenID on a computer for the best experience.
        </p>
      </div>

      <Routes>
        {/* 🌱 User Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/form" element={<ProfileForm />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/activity-log" element={<ActivityLogPage />} />
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
