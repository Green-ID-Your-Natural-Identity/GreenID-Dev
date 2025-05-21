// Import the functions you need from Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider } from "firebase/auth"; // Import Authentication module

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDmOEiuqI0-DCdIVEIK6SBAwt-LoHz7cU",
  authDomain: "greenid-55129.firebaseapp.com",
  projectId: "greenid-55129",
  storageBucket: "greenid-55129.firebasestorage.app",
  messagingSenderId: "137946932441",
  appId: "1:137946932441:web:4930c8a8e5ed1f6c29cac8",
  measurementId: "G-85642QCRR6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// Initialize Google Auth provider and export it
export const googleProvider = new GoogleAuthProvider();
