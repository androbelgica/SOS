import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Base URL of your Laravel API - update this with your actual API URL
const API_URL = 'http://127.0.0.1:8000'; // Default for Android emulator connecting to localhost

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding the auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return Promise.reject(new Error('No internet connection'));
    }

    // Add auth token if available
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
      });
    }
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear token
      await AsyncStorage.removeItem('auth_token');
      
      // You'll need to implement navigation to login screen here
      // This will be handled by the auth state in Redux
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
