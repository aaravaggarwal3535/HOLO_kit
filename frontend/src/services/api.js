import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for transcript processing
});

/**
 * Analyze a creator's YouTube or GitHub profile
 * @param {string} url - YouTube or GitHub URL
 * @returns {Promise} Analysis result
 */
export const analyzeCreator = async (url) => {
  try {
    const response = await api.post('/analyze', { url });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('API Error:', error);
    
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to analyze URL',
    };
  }
};

/**
 * Check backend health status
 * @returns {Promise} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return null;
  }
};

export default api;
