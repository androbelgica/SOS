/**
 * API Service for SeaBasket Web Frontend
 * 
 * This service handles all HTTP requests to the Laravel backend API
 */

import axios from 'axios';
import { API_URL, API_TIMEOUT, getAuthHeaders, buildApiUrl } from '../config/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
    (error) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
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
        const response = await this.post('/login', credentials);
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    }

    async register(userData) {
        const response = await this.post('/register', userData);
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    }

    async logout() {
        try {
            await this.post('/logout');
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    }

    async googleLogin(token) {
        const response = await this.post('/auth/google', { token });
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    }

    // Products methods
    async getProducts(params = {}) {
        return this.get('/products', params);
    }

    async getProduct(id) {
        return this.get(`/products/${id}`);
    }

    async searchProducts(query) {
        return this.get(`/products/search/${query}`);
    }

    async getProductCategories() {
        return this.get('/products/categories');
    }

    // Recipes methods
    async getRecipes(params = {}) {
        return this.get('/recipes', params);
    }

    async getRecipe(id) {
        return this.get(`/recipes/${id}`);
    }

    async searchRecipes(query) {
        return this.get(`/recipes/search/${query}`);
    }

    async addRecipeReview(recipeId, review) {
        return this.post(`/recipes/${recipeId}/reviews`, review);
    }

    // Cart methods
    async getCart() {
        return this.get('/cart');
    }

    async addToCart(productData) {
        return this.post('/cart/add', productData);
    }

    async updateCartItem(productId, quantity) {
        return this.put(`/cart/update/${productId}`, { quantity });
    }

    async removeFromCart(productId) {
        return this.delete(`/cart/remove/${productId}`);
    }

    async clearCart() {
        return this.delete('/cart/clear');
    }

    // Orders methods
    async getOrders() {
        return this.get('/orders');
    }

    async createOrder(orderData) {
        return this.post('/orders', orderData);
    }

    async getOrder(id) {
        return this.get(`/orders/${id}`);
    }

    async cancelOrder(id) {
        return this.post(`/orders/${id}/cancel`);
    }

    // User profile methods
    async getProfile() {
        return this.get('/user');
    }

    async updateProfile(profileData) {
        return this.put('/user', profileData);
    }

    async updatePassword(passwordData) {
        return this.put('/user/password', passwordData);
    }

    // Wishlist methods
    async getWishlist() {
        return this.get('/wishlist');
    }

    async addToWishlist(productId) {
        return this.post(`/wishlist/add/${productId}`);
    }

    async removeFromWishlist(productId) {
        return this.delete(`/wishlist/remove/${productId}`);
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
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
