// src/services/api.js - Resolved version
import axios from 'axios';

// Environment-aware base URL
const getBaseUrl = () => {
  // Check if we're in production mode
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use production URL if in production, otherwise use local dev server
  return isProduction 
    ? 'https://trueskill-backend.onrender.com/api' // Include /api for consistency
    : '/api'; // This will use the proxy in development
};

// Create an Axios instance with dynamic config
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // To handle cookies for JWT
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response.data, // Return the data directly
  (error) => {
    console.error('API Error Response:', error);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401 && !window.location.pathname.includes('/login')) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return Promise.reject({
        message: 'Authentication required. Please log in.'
      });
    }
    
    // For network errors when the server is down
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        message: 'Network error - please check your connection or the server may be down'
      });
    }
    
    // Return a rejected promise with the error info from the response if available
    return Promise.reject(error.response?.data || {
      message: error.message || 'An unexpected error occurred'
    });
  }
);

// Helper methods for API calls
export const get = async (url, params = {}) => {
  try {
    return await api.get(url, { params });
  } catch (error) {
    throw error;
  }
};

export const post = async (url, data = {}) => {
  try {
    return await api.post(url, data);
  } catch (error) {
    throw error;
  }
};

export const put = async (url, data = {}) => {
  try {
    return await api.put(url, data);
  } catch (error) {
    throw error;
  }
};

export const patch = async (url, data = {}) => {
  try {
    return await api.patch(url, data);
  } catch (error) {
    throw error;
  }
};

export const del = async (url) => {
  try {
    return await api.delete(url);
  } catch (error) {
    throw error;
  }
};

export default api;