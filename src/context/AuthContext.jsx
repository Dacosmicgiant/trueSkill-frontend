// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          // Validate token with backend
          const { success, user: userData, error } = await getUserProfile();
          
          if (success && userData) {
            setUser(userData);
          } else {
            console.error('Authentication error:', error);
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('auth_token');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null); // Clear previous errors
    
    try {
      const result = await apiLogin(email, password);
      
      if (result.success) {
        setUser(result.user);
      } else {
        setAuthError(result.error || 'Login failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password, company, position) => {
    setAuthError(null); // Clear previous errors
    
    try {
      const result = await apiRegister(name, email, password, company, position);
      
      if (result.success) {
        setUser(result.user);
      } else {
        setAuthError(result.error || 'Registration failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user state even if API call fails
      setUser(null);
      return { success: true };
    }
  };

  const updateUserData = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      updateUserData,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};