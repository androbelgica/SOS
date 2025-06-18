/**
 * API Service for Cart & Cook Mobile App
 * 
 * This service handles all HTTP requests to the Laravel backend API
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['auth_token', 'user']);
      // You might want to navigate to login screen here
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  // Generic HTTP methods
  async get(endpoint, params = {}) {
    try {
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint) {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.token) {
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  async register(userData) {
    const response = await this.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    if (response.token) {
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  async logout() {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      await AsyncStorage.multiRemove(['auth_token', 'user']);
    }
  }

  async googleLogin(token) {
    const response = await this.post(API_ENDPOINTS.AUTH.GOOGLE, { token });
    if (response.token) {
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  // Products methods
  async getProducts(params = {}) {
    return this.get(API_ENDPOINTS.PRODUCTS.LIST, params);
  }

  async getProduct(id) {
    return this.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  }

  async searchProducts(query) {
    return this.get(API_ENDPOINTS.PRODUCTS.SEARCH(query));
  }

  async getProductCategories() {
    return this.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
  }

  // Recipes methods
  async getRecipes(params = {}) {
    return this.get(API_ENDPOINTS.RECIPES.LIST, params);
  }

  async getRecipe(id) {
    return this.get(API_ENDPOINTS.RECIPES.DETAIL(id));
  }

  async searchRecipes(query) {
    return this.get(API_ENDPOINTS.RECIPES.SEARCH(query));
  }

  async addRecipeReview(recipeId, review) {
    return this.post(API_ENDPOINTS.RECIPES.REVIEWS(recipeId), review);
  }

  async toggleRecipeFavorite(recipeId) {
    return this.post(API_ENDPOINTS.RECIPES.FAVORITE(recipeId));
  }

  async getFavoriteRecipes() {
    return this.get(API_ENDPOINTS.RECIPES.FAVORITES);
  }

  // Cart methods
  async getCart() {
    return this.get(API_ENDPOINTS.CART.GET);
  }

  async addToCart(productData) {
    return this.post(API_ENDPOINTS.CART.ADD, productData);
  }

  async updateCartItem(productId, quantity) {
    return this.put(API_ENDPOINTS.CART.UPDATE(productId), { quantity });
  }

  async removeFromCart(productId) {
    return this.delete(API_ENDPOINTS.CART.REMOVE(productId));
  }

  async clearCart() {
    return this.delete(API_ENDPOINTS.CART.CLEAR);
  }

  // Orders methods
  async getOrders() {
    return this.get(API_ENDPOINTS.ORDERS.LIST);
  }

  async createOrder(orderData) {
    return this.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
  }

  async getOrder(id) {
    return this.get(API_ENDPOINTS.ORDERS.DETAIL(id));
  }

  async cancelOrder(id) {
    return this.post(API_ENDPOINTS.ORDERS.CANCEL(id));
  }

  async verifyOrder(orderId, productId) {
    return this.post(API_ENDPOINTS.ORDERS.VERIFY(orderId, productId));
  }

  // User profile methods
  async getProfile() {
    return this.get(API_ENDPOINTS.USER.PROFILE);
  }

  async updateProfile(profileData) {
    return this.put(API_ENDPOINTS.USER.UPDATE_PROFILE, profileData);
  }

  async updatePassword(passwordData) {
    return this.put(API_ENDPOINTS.USER.UPDATE_PASSWORD, passwordData);
  }

  async updateAddress(addressData) {
    return this.put(API_ENDPOINTS.USER.ADDRESSES, addressData);
  }

  // Wishlist methods
  async getWishlist() {
    return this.get(API_ENDPOINTS.WISHLIST.GET);
  }

  async addToWishlist(productId) {
    return this.post(API_ENDPOINTS.WISHLIST.ADD(productId));
  }

  async removeFromWishlist(productId) {
    return this.delete(API_ENDPOINTS.WISHLIST.REMOVE(productId));
  }

  // Health check
  async healthCheck() {
    return this.get(API_ENDPOINTS.HEALTH);
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
        data: null,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
        data: null,
      };
    }
  }
}

// Export singleton instance
export default new ApiService();
