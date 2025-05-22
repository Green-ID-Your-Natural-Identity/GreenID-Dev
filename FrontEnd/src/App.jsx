import { Routes, Route, Router } from 'react-router-dom'
import Login from './pages/login'
import Signup from './pages/signup'
import ProfileForm from './pages/ProfileForm'
import ProfilePage from './pages/ProfilePage'
import ActivityLogPage from './pages/ActivityLogPage'
import { ToastContainer } from 'react-toastify'
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
          minHeight : '25px' ,
          borderRadius: '10px',
          padding: '12px 16px',
          // background : 'green' ,
        }}
        theme="colored"
      />
    </>
  )
}

export default App
