import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import apiService from '../services/apiService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      
      // Check for stored auth token
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Verify token is still valid by making a test API call
        try {
          const profile = await apiService.getProfile();
          setUser(profile.data);
        } catch (error) {
          // Token is invalid, clear auth state
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      if (response.token && response.user) {
        // Store token securely
        await SecureStore.setItemAsync('auth_token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      
      if (response.token && response.user) {
        // Store token securely
        await SecureStore.setItemAsync('auth_token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
      };
    }
  };

  const googleLogin = async (googleToken) => {
    try {
      const response = await apiService.googleLogin(googleToken);
      
      if (response.token && response.user) {
        // Store token securely
        await SecureStore.setItemAsync('auth_token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error.message || 'Google login failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      await apiService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage
      await SecureStore.deleteItemAsync('auth_token');
      await AsyncStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      
      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        
        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile. Please try again.',
      };
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      await apiService.updatePassword(passwordData);
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update password. Please try again.',
      };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.data) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    updatePassword,
    refreshUser,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
