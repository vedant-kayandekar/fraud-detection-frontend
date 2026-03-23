import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 120000, // 2 minute timeout for large files
});

/**
 * Upload CSV for full fraud analysis.
 * @param {File} file - CSV file to upload
 * @param {string|null} userId - Optional user ID for history
 * @param {function} onProgress - Progress callback
 * @returns {Promise<object>} Analysis results
 */
export async function analyzeCSV(file, userId = null, onProgress = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (userId) {
    formData.append('user_id', userId);
  }

  const response = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        onProgress(pct);
      }
    },
  });
  return response.data;
}

/**
 * Predict fraud for a single transaction.
 * @param {object} transaction - Transaction fields
 * @returns {Promise<object>} Prediction result
 */
export async function predictSingle(transaction) {
  const response = await api.post('/predict-single', transaction);
  return response.data;
}

/**
 * Get analysis history for a user.
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} History entries
 */
export async function getHistory(userId) {
  const response = await api.get(`/history/${userId}`);
  return response.data.history;
}

export default api;
