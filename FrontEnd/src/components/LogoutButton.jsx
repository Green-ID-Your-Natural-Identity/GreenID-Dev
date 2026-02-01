import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null); // clears context & localStorage
      navigate('/login');
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 z-50"
    >
      Logout
    </button>
  );
};

export default LogoutButton;