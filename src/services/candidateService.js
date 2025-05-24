// src/services/candidateService.js
import { get, post, put, patch, del } from './api';

export const createCandidate = async (candidateData) => {
  try {
    const response = await post('/candidates', candidateData);
    return { success: true, candidate: response };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to create candidate' };
  }
};

export const getCandidates = async (filters = {}) => {
  try {
    const response = await get('/candidates', filters);
    return { success: true, ...response };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to fetch candidates' };
  }
};

export const getCandidateById = async (id) => {
  try {
    const response = await get(`/candidates/${id}`);
    return { success: true, candidate: response };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to fetch candidate' };
  }
};

export const updateCandidate = async (id, candidateData) => {
  try {
    const response = await put(`/candidates/${id}`, candidateData);
    return { success: true, candidate: response };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to update candidate' };
  }
};

export const deleteCandidate = async (id) => {
  try {
    await del(`/candidates/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to delete candidate' };
  }
};

export const addCandidateApplication = async (candidateId, jobId) => {
  try {
    const response = await post(`/candidates/${candidateId}/applications`, { jobId });
    return { success: true, candidate: response };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to add job application' };
  }
};

export const updateApplicationStatus = async (candidateId, applicationId, status) => {
  try {
    const response = await patch(`/candidates/${candidateId}/applications/${applicationId}`, { status });
    return { success: true, candidate: response };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to update application status' };
  }
};

export const addCandidateNote = async (candidateId, content) => {
  try {
    const response = await post(`/candidates/${candidateId}/notes`, { content });
    return { success: true, candidate: response };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to add note' };
  }
};

export const updateTechnicalAssessment = async (candidateId, assessmentData) => {
  try {
    const response = await patch(`/candidates/${candidateId}/assessment/technical`, assessmentData);
    return { success: true, candidate: response };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to update technical assessment' };
  }
};

export const updateSoftSkillsAssessment = async (candidateId, assessmentData) => {
  try {
    const response = await patch(`/candidates/${candidateId}/assessment/soft-skills`, assessmentData);
    return { success: true, candidate: response };
  } catch (error) {
    return { success: false, error: error.message || 'Failed to update soft skills assessment' };
  }
};