import React from 'react'
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"; // Import necessary Firebase functions
import { auth, googleProvider } from "../services/firebase"; // Import the Firebase auth and Google provider
import { useNavigate } from "react-router-dom"; // For navigation
import { toast , ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast

const Login = () => {

    const [email, setEmail] = useState(""); // For storing email
    const [password, setPassword] = useState(""); // For storing password
    const [error, setError] = useState(""); // For displaying error messages
    const navigate = useNavigate(); // For navigation after successful login

    // Handle email/password login
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent page reload

        try {
            // Sign in with email and password
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Login Successful - Showing Toast");
            // Show success toast
            toast.success("Login Successful! Redirecting...", {
                position: "top-right", // Where the toast will appear
                autoClose: 5000, // Duration (5 seconds)
                hideProgressBar: true, // Optionally hide the progress bar
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Redirect to dashboard or home page after successful login
            navigate("/profile"); // Replace with your actual dashboard route
        } catch (error) {
            setError(error.message); // Show error if something goes wrong
        }
    };

    // Handle Google login
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider); // Sign in with Google
            const user = result.user;

            toast.success("Google Login Successful! Redirecting...", {
                position: "top-right", // Where the toast will appear
                autoClose: 5000, // Duration (5 seconds)
                hideProgressBar: true, // Optionally hide the progress bar
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });

        // Redirect to dashboard or home page after successful login
            navigate("/profile"); // Replace with your actual dashboard route
        } catch (error) {
            setError(error.message); // Show error if something goes wrong
        }
    };

  return (
    <div>
      <div className="flex justify-center items-center h-[90vh] text-black rounded w-2xl bg-green-100">
      <div className="bg-white p-8 rounded shadow-md ">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">DARShan Login</h2>

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <input 
                type="email"
                placeholder="Email" 
                className="border p-2 rounded" 
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
            />
            <input 
                type="password" 
                placeholder="Password" 
                className="border p-2 rounded" 
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
            />
            <button type="submit" className="bg-green-500 text-white py-2 rounded hover:bg-green-600">
                Log In
            </button>
        </form>

        <div className="text-center my-4">
          <button
            onClick={handleGoogleLogin}
            className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600"
          >
            Log In with Google
          </button>
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>} {/* Display error message */}
        
        <p className="text-center mt-4">
            Don't have an account? <a href="/signup" className="text-green-500 font-semibold hover:underline">Sign Up</a>
        </p>
      </div>
      {/* ToastContainer renders the notification */}
     
      
    </div>
    </div>
  )
}

export default Login
