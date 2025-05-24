// src/services/gdService.js
import { get, post } from './api';

/**
 * Generate discussion points for AI agents
 * @param {string} topic - Discussion topic
 * @returns {Promise<Object>} - Generated points for each agent
 */
export const generateAgentPoints = async (topic, apiKey) => {
  try {
    const response = await post('/gd/generate-points', { topic, apiKey });
    return { success: true, points: response.points };
  } catch (error) {
    console.error('Error generating agent points:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate discussion points' 
    };
  }
};

/**
 * Generate AI response for the discussion
 * @param {string} prompt - System prompt for the AI
 * @param {Array} messages - Previous messages in the discussion
 * @returns {Promise<Object>} - AI response
 */
export const generateAIResponse = async (prompt, messages, apiKey) => {
  try {
    const response = await post('/gd/generate-response', { 
      prompt, 
      apiKey,
      messages: messages.map(msg => ({
        role: msg.participant.role,
        text: msg.text
      }))
    });
    
    return { success: true, response: response.text };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate AI response' 
    };
  }
};

/**
 * Generate participation report for the user
 * @param {string} topic - Discussion topic
 * @param {Array} messages - All messages in the discussion
 * @returns {Promise<Object>} - User participation report
 */
export const generateUserReport = async (topic, messages, apiKey) => {
  try {
    const response = await post('/gd/generate-report', { 
      topic,
      apiKey,
      messages: messages.map(msg => ({
        speaker: msg.participant.name,
        text: msg.text,
        timestamp: msg.timestamp
      }))
    });
    
    return { success: true, report: response.report };
  } catch (error) {
    console.error('Error generating user report:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate user report' 
    };
  }
};

/**
 * Save discussion results to candidate profile
 * @param {string} candidateId - Candidate ID
 * @param {Object} reportData - Report data to save
 * @returns {Promise<Object>} - Save result
 */
export const saveDiscussionResults = async (candidateId, reportData) => {
  try {
    const response = await post(`/candidates/${candidateId}/assessment/soft-skills`, reportData);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error saving discussion results:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save discussion results' 
    };
  }
};