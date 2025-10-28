import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  isAuthenticated, 
  getStoredUserData, 
  clearAuthData,
  loginTechnician as apiLogin,
  logoutTechnician as apiLogout
} from '../services/Api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const authenticated = await isAuthenticated();
      
      if (authenticated) {
        const userData = await getStoredUserData();
        setIsLoggedIn(true);
        setUser(userData);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    try {
      setLoading(true);
      const result = await apiLogin(phone, password);
      
      if (result.success) {
        setIsLoggedIn(true);
        setUser(result.data.user);
        return { success: true, message: result.message };
      } else {
        return { 
          success: false, 
          message: result.message,
          errors: result.errors 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'خطا در ورود به سیستم' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      setIsLoggedIn(false);
      setUser(null);
      return { success: true, message: 'خروج با موفقیت انجام شد' };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local data
      await clearAuthData();
      setIsLoggedIn(false);
      setUser(null);
      return { success: true, message: 'خروج با موفقیت انجام شد' };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};