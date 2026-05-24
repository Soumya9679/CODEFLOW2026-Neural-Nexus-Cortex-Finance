import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
// Resolve backend URL pointing to the deployed production endpoint
export const API_BASE_URL = 'https://codeflow2026-neural-nexus-cortex-finance-production.up.railway.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically inject JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('user_jwt_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to retrieve JWT token from SecureStore', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors (like unauthorized status)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - clearing token');
      try {
        await SecureStore.deleteItemAsync('user_jwt_token');
      } catch (e) {
        // Ignore
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
