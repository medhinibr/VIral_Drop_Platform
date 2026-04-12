import axios from 'axios';
import { auth } from '../firebase-config';

// Base URL is an empty string so axios points to the exact same origin the frontend is hosted on!
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Firebase auth token into headers dynamically
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const apiService = {
  // Campaign
  getActiveCampaign: async () => {
    try {
      const response = await api.get('/active-campaign');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  createCampaign: async (campaignData) => {
    try {
      const response = await api.post('/create-campaign', campaignData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  claimSlot: async (claimData) => {
    try {
      const response = await api.post('/claim', claimData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload
  uploadImage: async (formData) => {
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;
