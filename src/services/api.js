// src/services/api.js - Fixed version
import axios from 'axios';

// Environment-aware base URL
const getBaseUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction 
    ? 'https://trueskill-backend.onrender.com/api'
    : '/api';
};

// Create an Axios instance with dynamic config
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For HTTP-only cookies
  timeout: 15000,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('auth_token');
    
    // Only add Authorization header if we have a valid JWT token
    // Don't add it if token is just a placeholder string
    if (token && token !== 'logged_in' && token !== 'authenticated') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error Response:', error);
    
    // Handle authentication errors more carefully
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      
      // Don't redirect if already on login/register pages
      if (currentPath.includes('/login') || currentPath.includes('/register')) {
        return Promise.reject(error.response?.data || {
          message: error.message || 'Authentication failed'
        });
      }
      
      // Only clear auth and redirect for certain endpoints
      // Don't do it for endpoints that might legitimately return 401
      const url = error.config?.url || '';
      const authEndpoints = ['/auth/profile', '/auth/logout'];
      const isAuthEndpoint = authEndpoints.some(endpoint => url.includes(endpoint));
      
      if (isAuthEndpoint) {
        console.log('Authentication failed, clearing tokens and redirecting');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_status');
        
        // Small delay to prevent rapid redirects
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
      
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

// Helper methods for API calls with better error handling
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