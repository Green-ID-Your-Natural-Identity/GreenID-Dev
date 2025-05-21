import { Routes, Route, Router } from 'react-router-dom'
import Login from './pages/login'
import Signup from './pages/signup'
import ProfileForm from './pages/ProfileForm'
import ProfilePage from './pages/ProfilePage'
import ActivityLogPage from './pages/ActivityLogPage'
import './App.css'

function App() {
  
  return (
    <>
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/form" element={<ProfileForm />} />
        <Route path="/profile" element={<ProfilePage /> } />
        <Route path="/activity-log" element={<ActivityLogPage /> } />
        
      </Routes>
    </>
  )
}

export default App
