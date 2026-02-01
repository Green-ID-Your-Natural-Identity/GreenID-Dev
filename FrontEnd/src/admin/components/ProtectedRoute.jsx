import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/check-auth`, { withCredentials: true });
        console.log("Auth check response:", res.data); // 🪵 debug log
        setIsAuth(res.data.isAuthenticated);
      } catch(err) {
        console.error("Auth check failed:", err);
        setIsAuth(false);
      }
    }
    checkAuth();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  return isAuth ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
