import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRY = 1000 * 60 * 15; // 15 minutes

const productService = {
  // Get all products with optional filtering
  getProducts: async (params = {}) => {
    try {
      // Check if we have cached data and it's not expired
      const cachedData = await AsyncStorage.getItem('cached_products');
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
        
        if (!isExpired) {
          return data;
        }
      }
      
      // Fetch fresh data
      const response = await apiClient.get('/api/products', { params });
      
      // Cache the data with timestamp
      await AsyncStorage.setItem('cached_products', JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));
      
      return response.data;
    } catch (error) {
      // If offline and we have cached data, return it regardless of expiry
      if (error.message === 'No internet connection') {
        const cachedData = await AsyncStorage.getItem('cached_products');
        if (cachedData) {
          return JSON.parse(cachedData).data;
        }
      }
      throw error;
    }
  },
  
  // Get a single product by ID
  getProduct: async (id) => {
    try {
      // Check if we have cached data
      const cachedData = await AsyncStorage.getItem(`cached_product_${id}`);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
        
        if (!isExpired) {
          return data;
        }
      }
      
      // Fetch fresh data
      const response = await apiClient.get(`/api/products/${id}`);
      
      // Cache the data with timestamp
      await AsyncStorage.setItem(`cached_product_${id}`, JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));
      
      return response.data;
    } catch (error) {
      // If offline and we have cached data, return it regardless of expiry
      if (error.message === 'No internet connection') {
        const cachedData = await AsyncStorage.getItem(`cached_product_${id}`);
        if (cachedData) {
          return JSON.parse(cachedData).data;
        }
      }
      throw error;
    }
  },
  
  // Search products
  searchProducts: async (query) => {
    const response = await apiClient.get('/api/products/search', { params: { query } });
    return response.data;
  },
  
  // Get products by category
  getProductsByCategory: async (category) => {
    const response = await apiClient.get('/api/products', { params: { category } });
    return response.data;
  },
  
  // Clear product cache
  clearCache: async () => {
    const keys = await AsyncStorage.getAllKeys();
    const productCacheKeys = keys.filter(key => 
      key === 'cached_products' || key.startsWith('cached_product_')
    );
    await AsyncStorage.multiRemove(productCacheKeys);
  }
};

export default productService;
