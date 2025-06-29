import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes for recipes

const recipeService = {
  // Get all recipes with optional filtering
  getRecipes: async (params = {}) => {
    try {
      // Check if we have cached data and it's not expired
      const cachedData = await AsyncStorage.getItem('cached_recipes');
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
        
        if (!isExpired) {
          return data;
        }
      }
      
      // Fetch fresh data
      const response = await apiClient.get('/api/recipes', { params });
      
      // Cache the data with timestamp
      await AsyncStorage.setItem('cached_recipes', JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));
      
      return response.data;
    } catch (error) {
      // If offline and we have cached data, return it regardless of expiry
      if (error.message === 'No internet connection') {
        const cachedData = await AsyncStorage.getItem('cached_recipes');
        if (cachedData) {
          return JSON.parse(cachedData).data;
        }
      }
      throw error;
    }
  },
  
  // Get a single recipe by ID
  getRecipe: async (id) => {
    try {
      // Check if we have cached data
      const cachedData = await AsyncStorage.getItem(`cached_recipe_${id}`);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
        
        if (!isExpired) {
          return data;
        }
      }
      
      // Fetch fresh data
      const response = await apiClient.get(`/api/recipes/${id}`);
      
      // Cache the data with timestamp
      await AsyncStorage.setItem(`cached_recipe_${id}`, JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));
      
      return response.data;
    } catch (error) {
      // If offline and we have cached data, return it regardless of expiry
      if (error.message === 'No internet connection') {
        const cachedData = await AsyncStorage.getItem(`cached_recipe_${id}`);
        if (cachedData) {
          return JSON.parse(cachedData).data;
        }
      }
      throw error;
    }
  },
  
  // Save a recipe to favorites
  saveRecipe: async (id) => {
    const response = await apiClient.post(`/api/recipes/${id}/save`);
    return response.data;
  },
  
  // Remove a recipe from favorites
  unsaveRecipe: async (id) => {
    const response = await apiClient.delete(`/api/recipes/${id}/save`);
    return response.data;
  },
  
  // Get saved/favorite recipes
  getSavedRecipes: async () => {
    const response = await apiClient.get('/api/recipes/saved');
    return response.data;
  },
  
  // Rate and review a recipe
  rateRecipe: async (id, rating, comment) => {
    const response = await apiClient.post(`/api/recipes/${id}/reviews`, { 
      rating, 
      comment 
    });
    return response.data;
  },
  
  // Get recipes by category/difficulty
  getRecipesByFilter: async (filter) => {
    const response = await apiClient.get('/api/recipes', { params: filter });
    return response.data;
  },
  
  // Search recipes
  searchRecipes: async (query) => {
    const response = await apiClient.get('/api/recipes/search', { params: { query } });
    return response.data;
  },
  
  // Clear recipe cache
  clearCache: async () => {
    const keys = await AsyncStorage.getAllKeys();
    const recipeCacheKeys = keys.filter(key => 
      key === 'cached_recipes' || key.startsWith('cached_recipe_')
    );
    await AsyncStorage.multiRemove(recipeCacheKeys);
  }
};

export default recipeService;
