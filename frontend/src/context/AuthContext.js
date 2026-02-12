import React, { createContext, useState, useEffect, useCallback } from 'react'; // <-- Import useCallback
import jwtDecode from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // --- UPDATED with useCallback ---
  const fetchUserDetails = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user details', error);
      logout();
    }
  }, []); // This function is now stable

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (isExpired) {
          logout();
        } else {
          setUser({ id: decodedToken.id, role: decodedToken.role }); 
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          fetchUserDetails(); // Fetch full details
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  }, [token, fetchUserDetails]); // <-- 'fetchUserDetails' is added

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;