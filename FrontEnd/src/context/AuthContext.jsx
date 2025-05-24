import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  

  // Wrapped setUser to sync with localStorage
  const setUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
    setUserState(userData);
  };

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('user');
    const auth = getAuth();
    if (stored) setUserState(JSON.parse(stored));

    // Listen to Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const fresh = {
          uid: fbUser.uid,
          email: fbUser.email,
          fullName: fbUser.displayName || ''
        };
        setUser(fresh);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);