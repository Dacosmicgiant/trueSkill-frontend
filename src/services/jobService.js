// src/services/jobService.js
import { get, post, put, patch, del } from './api';

export const createJob = async (jobData) => {
  try {
    const response = await post('/jobs', jobData);
    return { success: true, job: response };
  } catch (error) {
    console.error('Create job error:', error);
    return { success: false, error: error.message || 'Failed to create job' };
  }
};

export const getJobs = async (params = {}) => {
  try {
    const response = await get('/jobs', params);
    return { 
      success: true, 
      jobs: response.jobs || [],
      pagination: response.pagination || null 
    };
  } catch (error) {
    console.error('Get jobs error:', error);
    return { success: false, error: error.message || 'Failed to fetch jobs' };
  }
};

export const getJobById = async (id) => {
  try {
    const response = await get(`/jobs/${id}`);
    return { success: true, job: response };
  } catch (error) {
    console.error('Get job error:', error);
    return { success: false, error: error.message || 'Failed to fetch job' };
  }
};

export const updateJob = async (id, jobData) => {
  try {
    const response = await put(`/jobs/${id}`, jobData);
    return { success: true, job: response };
  } catch (error) {
    console.error('Update job error:', error);
    return { success: false, error: error.message || 'Failed to update job' };
  }
};

export const deleteJob = async (id) => {
  try {
    await del(`/jobs/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Delete job error:', error);
    return { success: false, error: error.message || 'Failed to delete job' };
  }
};

export const updateJobStatus = async (id, status) => {
  try {
    const response = await patch(`/jobs/${id}/status`, { status });
    return { success: true, job: response };
  } catch (error) {
    console.error('Update job status error:', error);
    return { success: false, error: error.message || 'Failed to update job status' };
  }
};