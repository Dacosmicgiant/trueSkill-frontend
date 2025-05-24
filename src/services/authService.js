// src/services/authService.js - Fixed version
import { post, get, put } from './api';

export const login = async (email, password) => {
  try {
    const response = await post('/auth/login', { email, password });
    
    // Only store actual JWT tokens, not placeholder strings
    if (response.token && response.token !== 'logged_in') {
      localStorage.setItem('auth_token', response.token);
    } else {
      // If using HTTP-only cookies, don't store anything in localStorage
      // The cookie will be sent automatically
      localStorage.setItem('auth_status', 'authenticated');
    }
    
    return { 
      success: true, 
      user: response 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.message || 'Authentication failed. Please check your credentials.' 
    };
  }
};

export const register = async (name, email, password, company, position) => {
  try {
    const response = await post('/auth/register', { 
      name, 
      email, 
      password,
      company,
      position
    });
    
    // Same logic as login
    if (response.token && response.token !== 'logged_in') {
      localStorage.setItem('auth_token', response.token);
    } else {
      localStorage.setItem('auth_status', 'authenticated');
    }
    
    return { success: true, user: response };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      error: error.message || 'Registration failed. Please try again.' 
    };
  }
};

export const logout = async () => {
  try {
    await post('/auth/logout');
    // Clear both possible auth indicators
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_status');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear the auth state even if API call fails
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_status');
    return { success: true };
  }
};

export const getUserProfile = async () => {
  try {
    const response = await get('/auth/profile');
    return { success: true, user: response };
  } catch (error) {
    console.error('Get profile error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get user profile' 
    };
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await put('/auth/profile', userData);
    return { success: true, user: response };
  } catch (error) {
    console.error('Update profile error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update profile' 
    };
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const authStatus = localStorage.getItem('auth_status');
  return !!(token || authStatus === 'authenticated');
};