/**
 * API Configuration for SeaBasket Web Frontend
 * 
 * This file contains configuration for connecting to the Laravel backend API
 */

// API Base URLs for different environments
const API_CONFIG = {
    development: {
        baseURL: 'http://localhost:8000',
        apiURL: 'http://localhost:8000/api/v1',
        timeout: 10000,
    },
    production: {
        baseURL: process.env.VITE_API_BASE_URL || 'https://api.seabasket.com',
        apiURL: process.env.VITE_API_URL || 'https://api.seabasket.com/api/v1',
        timeout: 15000,
    }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';
const config = API_CONFIG[environment];

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

// Export configuration
export const API_BASE_URL = config.baseURL;
export const API_URL = config.apiURL;
export const API_TIMEOUT = config.timeout;

// Default headers for API requests
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
    return `${API_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return token ? {
        ...DEFAULT_HEADERS,
        'Authorization': `Bearer ${token}`,
    } : DEFAULT_HEADERS;
};

export default {
    API_BASE_URL,
    API_URL,
    API_TIMEOUT,
    API_ENDPOINTS,
    DEFAULT_HEADERS,
    buildApiUrl,
    getAuthHeaders,
};
