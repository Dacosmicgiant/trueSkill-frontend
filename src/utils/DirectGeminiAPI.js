// src/utils/DirectGeminiAPI.js
/**
 * Call the Gemini API directly from the frontend
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Array} chatHistory - Optional chat history
 * @param {string} apiKey - The Gemini API key
 * @returns {Promise<string>} - The generated text
 */
export async function callGeminiAPI(prompt, chatHistory = null, apiKey) {
  if (!prompt.trim() || !apiKey.trim()) {
    throw new Error('Prompt and API key are required');
  }

  try {
    // Initialize contents with the prompt as a user message
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    };

    // Append chat history if provided
    if (chatHistory && chatHistory.length > 0) {
      const formattedMessages = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || '' }]
      }));
      
      requestBody.contents.push(...formattedMessages);
    }

    console.log('Sending Gemini API request:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || 'API call failed';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText?.trim()) {
      throw new Error('Received empty or invalid response from Gemini API');
    }
    
    console.log('Gemini API response:', responseText);
    return responseText;
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    throw error;
  }
}

/**
 * Extract JSON content from a string that might contain markdown formatting
 * @param {string} text - Text potentially containing JSON with markdown
 * @returns {any} - Parsed JSON object or array
 */
function extractJsonFromResponse(text) {
  // First try direct parsing
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Direct JSON parsing failed, attempting to extract JSON from markdown');
    
    // Try to extract JSON from markdown code block
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const codeBlockMatch = text.match(codeBlockRegex);
    
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch (e2) {
        console.error('Failed to parse JSON from code block', e2);
      }
    }
    
    // Try to find any JSON array or object in the text
    const jsonRegex = /(\[[\s\S]*?\]|\{[\s\S]*?\})/;
    const jsonMatch = text.match(jsonRegex);
    
    if (jsonMatch && jsonMatch[0]) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e3) {
        console.error('Failed to extract JSON using regex', e3);
      }
    }
    
    // All attempts failed
    throw new Error('Could not parse JSON from response');
  }
}

/**
 * Generate discussion points for AI agents directly
 * @param {string} topic - Discussion topic
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<Object>} - Generated points for each agent
 */
export async function generateAgentPoints(topic, apiKey) {
  const agents = ['AI1 (Analytical)', 'AI2 (Creative)', 'AI3 (Pragmatic)'];
  const agentPoints = {
    'AI1': [],
    'AI2': [],
    'AI3': []
  };
  
  try {
    // Generate points for each agent
    for (const agent of agents) {
      const agentKey = agent.split(' ')[0];
      
      const prompt = `
        You are ${agent} in a group discussion on the topic: "${topic}". 
        Generate exactly 10 concise points (each under 50 words) to discuss, focusing on your role:
        - AI1 (Analytical): Use data, facts, and logical reasoning.
        - AI2 (Creative): Provide innovative, out-of-the-box ideas.
        - AI3 (Pragmatic): Offer practical, actionable solutions.
        Return ONLY a JSON array of strings WITHOUT any markdown formatting, e.g., ["Point 1", "Point 2", ...].
      `;
      
      const response = await callGeminiAPI(prompt, null, apiKey);
      
      try {
        // Use the new function to handle markdown-formatted responses
        const points = extractJsonFromResponse(response);
        
        if (Array.isArray(points) && points.length > 0) {
          // Ensure we have exactly 10 points
          if (points.length < 10) {
            // If fewer than 10, duplicate some points
            while (points.length < 10) {
              points.push(points[points.length % points.length]);
            }
          }
          agentPoints[agentKey] = points.slice(0, 10);
        } else {
          throw new Error(`Invalid response format for ${agent}`);
        }
      } catch (e) {
        console.error(`Error parsing JSON response for ${agent}:`, e);
        
        // Fallback: Manually create points if all parsing attempts fail
        agentPoints[agentKey] = Array(10).fill().map((_, i) => 
          `Default point ${i+1} for ${agentKey} about ${topic}`
        );
      }
    }
    
    return { success: true, points: agentPoints };
  } catch (error) {
    console.error('Error generating points:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate discussion points' 
    };
  }
}

/**
 * Generate AI response for the discussion directly
 * @param {string} prompt - System prompt for the AI
 * @param {Array} messages - Previous messages in the discussion
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<Object>} - AI response
 */
export async function generateAIResponse(prompt, messages, apiKey) {
  try {
    const response = await callGeminiAPI(prompt, null, apiKey);
    return { success: true, response };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate AI response' 
    };
  }
}

/**
 * Generate participation report for the user directly
 * @param {string} topic - Discussion topic
 * @param {Array} messages - All messages in the discussion
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<Object>} - User participation report
 */
export async function generateUserReport(topic, messages, apiKey) {
  try {
    const discussionContext = messages.map(msg => 
      `${msg.participant.name}: ${msg.text}`
    ).join('\n\n');
    
    const reportPrompt = `
You are an expert communication coach analyzing a group discussion. Based on the following discussion, generate a report evaluating the user's performance in these areas:

1. Communication: Clarity of expression, articulation of ideas, active listening
2. Empathy: Understanding others' perspectives, showing emotional intelligence
3. Collaboration: Building on others' ideas, constructive feedback, teamwork
4. Adaptivity: Flexibility in thinking, responsiveness to new ideas

For each area, provide:
- A score from 1-10
- Key strengths (2-3 bullet points)
- Areas for improvement (1-2 bullet points)
- One actionable tip

Context:
Topic: ${topic}

Discussion:
${discussionContext}

Return ONLY the JSON object without any markdown formatting:
{
  "communication": {
    "score": number,
    "strengths": string[],
    "areasForImprovement": string[],
    "tip": string
  },
  "empathy": {
    "score": number,
    "strengths": string[],
    "areasForImprovement": string[],
    "tip": string
  },
  "collaboration": {
    "score": number,
    "strengths": string[],
    "areasForImprovement": string[],
    "tip": string
  },
  "adaptivity": {
    "score": number,
    "strengths": string[],
    "areasForImprovement": string[],
    "tip": string
  }
}
`;

    const response = await callGeminiAPI(reportPrompt, null, apiKey);
    
    try {
      // Use the new function to handle markdown-formatted responses
      const report = extractJsonFromResponse(response);
      return { success: true, report };
    } catch (error) {
      console.error('Error parsing JSON report:', error);
      return { 
        success: false, 
        error: 'Failed to parse report: ' + error.message
      };
    }
  } catch (error) {
    console.error('Error generating user report:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to generate user report' 
    };
  }
}