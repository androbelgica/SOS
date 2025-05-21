import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      // For Laravel Sanctum, we need to get CSRF cookie first
      await apiClient.get('/sanctum/csrf-cookie');
      
      // Then login
      const response = await apiClient.post('/login', { email, password });
      
      // Store the token
      if (response.data.token) {
        await AsyncStorage.setItem('auth_token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Register user
  register: async (userData) => {
    try {
      await apiClient.get('/sanctum/csrf-cookie');
      const response = await apiClient.post('/register', userData);
      
      if (response.data.token) {
        await AsyncStorage.setItem('auth_token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Login with Google
  loginWithGoogle: async (token) => {
    try {
      const response = await apiClient.post('/auth/google/callback', { token });
      
      if (response.data.token) {
        await AsyncStorage.setItem('auth_token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/logout');
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      // Still remove the token even if the API call fails
      await AsyncStorage.removeItem('auth_token');
      throw error;
    }
  },
  
  // Get current user profile
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/user');
    return response.data;
  },
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },
  
  // Reset password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/forgot-password', { email });
    return response.data;
  },
  
  // Reset password with token
  resetPassword: async (data) => {
    const response = await apiClient.post('/reset-password', data);
    return response.data;
  },
};

export default authService;
