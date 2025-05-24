// src/context/AuthContext.jsx - Fixed version
import { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUserProfile, isAuthenticated } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // First check if we have any auth indicators
        if (!isAuthenticated()) {
          setIsLoading(false);
          return;
        }

        // Try to get user profile to validate authentication
        const { success, user: userData, error } = await getUserProfile();
        
        if (success && userData) {
          setUser(userData);
        } else {
          console.error('Authentication validation failed:', error);
          // Clear auth state but don't show error - user just needs to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_status');
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        // Clear auth state on any error
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_status');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    setIsLoading(true);
    
    try {
      const result = await apiLogin(email, password);
      
      if (result.success) {
        setUser(result.user);
        setAuthError(null);
      } else {
        setAuthError(result.error || 'Login failed');
        setUser(null);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      setUser(null);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, company, position) => {
    setAuthError(null);
    setIsLoading(true);
    
    try {
      const result = await apiRegister(name, email, password, company, position);
      
      if (result.success) {
        setUser(result.user);
        setAuthError(null);
      } else {
        setAuthError(result.error || 'Registration failed');
        setUser(null);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setAuthError(errorMessage);
      setUser(null);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setAuthError(null);
    }
    
    return { success: true };
  };

  const updateUserData = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  // Clear auth error when user starts typing/interacting
  const clearAuthError = () => {
    setAuthError(null);
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
      authError,
      clearAuthError
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