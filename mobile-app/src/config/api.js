/**
 * API Configuration for SeaBasket Mobile App
 * 
 * This file contains configuration for connecting to the Laravel backend API
 */

import Constants from 'expo-constants';

// API Base URLs for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 10000,
  },
  staging: {
    baseURL: 'https://staging-api.seabasket.com/api/v1',
    timeout: 15000,
  },
  production: {
    baseURL: 'https://api.seabasket.com/api/v1',
    timeout: 15000,
  }
};

// Get current environment
const environment = __DEV__ ? 'development' : 'production';
const config = API_CONFIG[environment];

// API Base URL
export const API_BASE_URL = config.baseURL;
export const API_TIMEOUT = config.timeout;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    GOOGLE: '/auth/google',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  
  // User Profile
  USER: {
    PROFILE: '/user',
    UPDATE_PROFILE: '/user',
    UPDATE_PASSWORD: '/user/password',
    ADDRESSES: '/user/address',
  },
  
  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id}`,
    SEARCH: (query) => `/products/search/${query}`,
    CATEGORIES: '/products/categories',
  },
  
  // Recipes
  RECIPES: {
    LIST: '/recipes',
    DETAIL: (id) => `/recipes/${id}`,
    SEARCH: (query) => `/recipes/search/${query}`,
    CATEGORIES: '/recipes/categories',
    REVIEWS: (id) => `/recipes/${id}/reviews`,
    FAVORITES: '/recipes/favorites',
    FAVORITE: (id) => `/recipes/${id}/favorite`,
    UNFAVORITE: (id) => `/recipes/${id}/unfavorite`,
  },
  
  // Cart & Orders
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (productId) => `/cart/update/${productId}`,
    REMOVE: (productId) => `/cart/remove/${productId}`,
    CLEAR: '/cart/clear',
  },
  
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id) => `/orders/${id}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    VERIFY: (orderId, productId) => `/orders/${orderId}/verify/${productId}`,
  },
  
  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    ADD: (productId) => `/wishlist/add/${productId}`,
    REMOVE: (productId) => `/wishlist/remove/${productId}`,
  },
  
  // Health Check
  HEALTH: '/health',
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// App Configuration
export const APP_CONFIG = {
  // Google OAuth
  GOOGLE_CLIENT_ID: '741212996994-vk4id964qvk07r14gvce24p95tbi5tc6.apps.googleusercontent.com',
  
  // App Settings
  DEFAULT_LANGUAGE: 'en',
  CURRENCY: 'PHP',
  CURRENCY_SYMBOL: '₱',
  
  // Pagination
  ITEMS_PER_PAGE: 10,
  MAX_CART_ITEMS: 99,
  
  // Cache Settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Image Settings
  DEFAULT_PRODUCT_IMAGE: require('../../assets/default-product.png'),
  DEFAULT_RECIPE_IMAGE: require('../../assets/default-recipe.png'),
  IMAGE_QUALITY: 0.8,
  
  // Notification Settings
  NOTIFICATION_SOUND: true,
  NOTIFICATION_VIBRATION: true,
  
  // Location Settings
  LOCATION_ACCURACY: 6, // High accuracy
  LOCATION_TIMEOUT: 10000, // 10 seconds
  
  // QR Code Settings
  QR_CODE_SIZE: 200,
  QR_CODE_COLOR: '#000000',
  QR_CODE_BACKGROUND: '#FFFFFF',
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_GOOGLE_AUTH: true,
  ENABLE_CART_PERSISTENCE: true,
  ENABLE_WISHLIST: true,
  ENABLE_RECIPE_REVIEWS: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_LOCATION_SERVICES: true,
  ENABLE_QR_SCANNER: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_DARK_MODE: true,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error - please check your connection',
  UNAUTHORIZED: 'Please log in to continue',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'Server error - please try again later',
  VALIDATION_ERROR: 'Please check your input and try again',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  CART_ADDED: 'Item added to cart',
  CART_UPDATED: 'Cart updated',
  CART_REMOVED: 'Item removed from cart',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_CANCELLED: 'Order cancelled',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_UPDATED: 'Password updated successfully',
  REVIEW_ADDED: 'Review added successfully',
  WISHLIST_ADDED: 'Added to wishlist',
  WISHLIST_REMOVED: 'Removed from wishlist',
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_ENDPOINTS,
  DEFAULT_HEADERS,
  buildApiUrl,
  APP_CONFIG,
  FEATURE_FLAGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
