import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const authResponse = await axios.get(
          'http://localhost:5000/api/faculties/auth-check',
          { withCredentials: true }
        );
        
        if (authResponse.data.isAuthenticated) {
          // Get user info from backend
          const userResponse = await axios.get(
            'http://localhost:5000/api/faculties/user',
            { withCredentials: true }
          );
          
          setUser({
            authenticated: true,
            role: userResponse.data.role
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;