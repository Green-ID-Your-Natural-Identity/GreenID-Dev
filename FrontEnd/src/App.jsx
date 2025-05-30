import { Routes, Route, Router } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProfileForm from './pages/ProfileForm'
import ProfilePage from './pages/ProfilePage'
import ActivityLogPage from './pages/ActivityLogPage'
import HariBabaChat from './pages/ChatBot'
import ChatBot from './pages/ChatBot'
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
        <Route path="/activity-log" element={<><ActivityLogPage /> <HariBabaChat/></>} />
        <Route path="/chatbot" element={<ChatBot /> } />
        
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
