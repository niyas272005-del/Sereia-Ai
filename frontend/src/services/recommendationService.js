/**
 * recommendationService.js
 * Tracks smart action card impressions, clicks, and completions.
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const recommendationService = {
  logRecommendation: async (module, item) => {
    const userId = parseInt(localStorage.getItem('user_id') || '1', 10);
    try {
      const res = await apiClient.post('/recommendations', {
        user_id: userId,
        recommended_module: module,
        recommended_item: item
      });
      return res.data.id; 
    } catch (err) {
      console.warn('Failed to log recommendation:', err);
      return null;
    }
  },

  markClicked: async (recId) => {
    if (!recId) return;
    try {
      await apiClient.patch(`/recommendations/${recId}/click`);
    } catch (err) {
      console.warn('Failed to mark recommendation clicked:', err);
    }
  },

  markCompleted: async (recId) => {
    if (!recId) return;
    try {
      await apiClient.patch(`/recommendations/${recId}/complete`);
    } catch (err) {
      console.warn('Failed to mark recommendation completed:', err);
    }
  },

  recordExerciseCompletion: async (exerciseTitle) => {
    const userId = parseInt(localStorage.getItem('user_id') || '1', 10);
    try {
      const res = await apiClient.post('/recommendations', {
        user_id: userId,
        recommended_module: 'exercise',
        recommended_item: exerciseTitle
      });
      if (res.data && res.data.id) {
        await apiClient.patch(`/recommendations/${res.data.id}/complete`);
      }
    } catch (err) {
      console.warn('Failed to record exercise completion:', err);
    }
  }
};
