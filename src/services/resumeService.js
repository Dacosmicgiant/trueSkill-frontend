// src/services/resumeService.js
import axios from 'axios';

// Base URL for the Flask server
const API_BASE_URL = 'http://localhost:5000'; // Adjust this to your Flask server's host and port

// Create an axios instance with default configurations
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Parse resume by uploading a file and optionally matching against job IDs
export const parseResume = async (file, jobIds = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Append job IDs if provided
    if (jobIds && Array.isArray(jobIds) && jobIds.length > 0) {
      jobIds.forEach((jobId) => {
        formData.append('job_ids[]', jobId);
      });
    }

    const response = await apiClient.post('/upload', formData);
    console.log('Response from resume parsing:', response.data);
    if (response.data.error) {
      return { success: false, error: response.data.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error parsing resume:', error);
    return { success: false, error: error.response?.data?.error || 'Failed to parse resume' };
  }
};

// Analyze GitHub repositories for a given username
export const analyzeGitHubRepositories = async (username) => {
  try {
    const response = await apiClient.get(`/github/${username}`);
    
    if (response.data.error) {
      return { success: false, error: response.data.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error analyzing GitHub repositories:', error);
    return { success: false, error: error.response?.data?.error || 'Failed to analyze GitHub repositories' };
  }
};

// Match resume to jobs
export const matchResumeToJobs = async (file, candidateId = null, jobIds = null) => {
  try {
    const formData = new FormData();
    
    if (file) {
      formData.append('file', file);
    } else if (candidateId) {
      // Note: The Flask server doesn't currently support candidateId-based matching.
      // If you want to support this, you'll need to modify the Flask /match endpoint.
      throw new Error('Candidate ID-based matching is not supported yet.');
    } else {
      throw new Error('Either a file or candidate ID must be provided.');
    }

    // Append job IDs if provided
    if (jobIds && Array.isArray(jobIds) && jobIds.length > 0) {
      jobIds.forEach((jobId) => {
        formData.append('job_ids[]', jobId);
      });
    }

    const response = await apiClient.post('/match', formData);
    
    if (response.data.error) {
      return { success: false, error: response.data.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error matching resume to jobs:', error);
    return { success: false, error: error.response?.data?.error || 'Failed to match resume to jobs' };
  }
};

// Optional: Fetch available jobs for the JobSelectionControl component
export const fetchJobs = async () => {
  try {
    const response = await apiClient.get('/jobs');
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch jobs');
  }
};