// src/utils/discussionLinkGenerator.js
import { nanoid } from 'nanoid';

/**
 * Generate a unique session ID for a discussion
 * @returns {string} Unique session ID
 */
export function generateSessionId() {
  return nanoid(10); // Creates a 10-character unique ID
}

/**
 * Create a shareable discussion link
 * @param {Object} discussionConfig - Discussion configuration
 * @returns {string} Shareable URL
 */
export function createShareableLink(discussionConfig) {
  const sessionId = generateSessionId();
  
  // Create configuration object
  const config = {
    id: sessionId,
    topic: discussionConfig.topic,
    createdAt: new Date().toISOString(),
    createdBy: discussionConfig.createdBy || null,
    apiKey: discussionConfig.apiKey,
    timeLimit: discussionConfig.timeLimit || 120, // Default 2 minutes
    candidateName: discussionConfig.candidateName || 'Candidate'
  };
  
  // Encode the configuration as base64
  const encodedConfig = btoa(JSON.stringify(config));
  
  // Create the URL with the encoded configuration
  const baseUrl = window.location.origin;
  return `${baseUrl}/public/discussion/${encodedConfig}`;
}

/**
 * Parse a discussion configuration from a shareable link
 * @param {string} encodedConfig - Base64 encoded configuration
 * @returns {Object} Discussion configuration
 */
export function parseDiscussionConfig(encodedConfig) {
  try {
    const decodedConfig = JSON.parse(atob(encodedConfig));
    return decodedConfig;
  } catch (error) {
    console.error('Error parsing discussion config:', error);
    return null;
  }
}