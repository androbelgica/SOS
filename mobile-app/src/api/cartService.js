import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cartService = {
  // Get cart contents
  getCart: async () => {
    try {
      const response = await apiClient.get('/api/cart');
      return response.data;
    } catch (error) {
      // If offline, return local cart
      if (error.message === 'No internet connection') {
        return await cartService.getLocalCart();
      }
      throw error;
    }
  },
  
  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await apiClient.post('/api/cart/add', { 
        product_id: productId, 
        quantity 
      });
      
      // Update local cart
      await cartService.updateLocalCart();
      
      return response.data;
    } catch (error) {
      // If offline, add to local cart
      if (error.message === 'No internet connection') {
        return await cartService.addToLocalCart(productId, quantity);
      }
      throw error;
    }
  },
  
  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    try {
      const response = await apiClient.patch(`/api/cart/${productId}/update`, { quantity });
      
      // Update local cart
      await cartService.updateLocalCart();
      
      return response.data;
    } catch (error) {
      // If offline, update local cart
      if (error.message === 'No internet connection') {
        return await cartService.updateLocalCartItem(productId, quantity);
      }
      throw error;
    }
  },
  
  // Remove item from cart
  removeFromCart: async (productId) => {
    try {
      const response = await apiClient.delete(`/api/cart/${productId}`);
      
      // Update local cart
      await cartService.updateLocalCart();
      
      return response.data;
    } catch (error) {
      // If offline, remove from local cart
      if (error.message === 'No internet connection') {
        return await cartService.removeFromLocalCart(productId);
      }
      throw error;
    }
  },
  
  // Clear cart
  clearCart: async () => {
    try {
      const response = await apiClient.post('/api/cart/clear');
      
      // Clear local cart
      await AsyncStorage.removeItem('local_cart');
      
      return response.data;
    } catch (error) {
      // If offline, clear local cart
      if (error.message === 'No internet connection') {
        await AsyncStorage.removeItem('local_cart');
        return { success: true };
      }
      throw error;
    }
  },
  
  // Checkout
  checkout: async (checkoutData) => {
    const response = await apiClient.post('/api/orders', checkoutData);
    
    // Clear local cart after successful checkout
    await AsyncStorage.removeItem('local_cart');
    
    return response.data;
  },
  
  // Local cart operations for offline support
  getLocalCart: async () => {
    const localCart = await AsyncStorage.getItem('local_cart');
    return localCart ? JSON.parse(localCart) : { items: [] };
  },
  
  updateLocalCart: async () => {
    try {
      const response = await apiClient.get('/api/cart');
      await AsyncStorage.setItem('local_cart', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  addToLocalCart: async (productId, quantity) => {
    const localCart = await cartService.getLocalCart();
    
    // Check if product already exists in cart
    const existingItemIndex = localCart.items.findIndex(item => item.product_id === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      localCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      localCart.items.push({
        product_id: productId,
        quantity
      });
    }
    
    await AsyncStorage.setItem('local_cart', JSON.stringify(localCart));
    return localCart;
  },
  
  updateLocalCartItem: async (productId, quantity) => {
    const localCart = await cartService.getLocalCart();
    
    const existingItemIndex = localCart.items.findIndex(item => item.product_id === productId);
    
    if (existingItemIndex >= 0) {
      localCart.items[existingItemIndex].quantity = quantity;
    }
    
    await AsyncStorage.setItem('local_cart', JSON.stringify(localCart));
    return localCart;
  },
  
  removeFromLocalCart: async (productId) => {
    const localCart = await cartService.getLocalCart();
    
    localCart.items = localCart.items.filter(item => item.product_id !== productId);
    
    await AsyncStorage.setItem('local_cart', JSON.stringify(localCart));
    return localCart;
  },
  
  // Sync local cart with server when back online
  syncCart: async () => {
    const localCart = await cartService.getLocalCart();
    
    if (localCart.items.length > 0) {
      const response = await apiClient.post('/api/cart/sync', localCart);
      return response.data;
    }
    
    return { success: true };
  }
};

export default cartService;
