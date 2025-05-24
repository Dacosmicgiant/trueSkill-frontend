// src/services/authService.js
import { post, get, put } from './api';

export const login = async (email, password) => {
  try {
    const response = await post('/auth/login', { email, password });
    
    // The backend should handle setting the HTTP-only cookie for the token
    // We'll just store a flag to indicate the user is logged in
    localStorage.setItem('auth_token', response.token || 'logged_in');
    
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
    
    localStorage.setItem('auth_token', response.token || 'logged_in');
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
    localStorage.removeItem('auth_token');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the API call fails, we should still remove the token
    localStorage.removeItem('auth_token');
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