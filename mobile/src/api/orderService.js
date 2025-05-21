import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const orderService = {
  // Get all orders for the current user
  getOrders: async () => {
    try {
      const response = await apiClient.get('/api/orders');
      
      // Cache orders for offline access
      await AsyncStorage.setItem('cached_orders', JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));
      
      return response.data;
    } catch (error) {
      // If offline, return cached orders
      if (error.message === 'No internet connection') {
        const cachedData = await AsyncStorage.getItem('cached_orders');
        if (cachedData) {
          return JSON.parse(cachedData).data;
        }
      }
      throw error;
    }
  },
  
  // Get a single order by ID
  getOrder: async (id) => {
    try {
      const response = await apiClient.get(`/api/orders/${id}`);
      
      // Cache the order
      await AsyncStorage.setItem(`cached_order_${id}`, JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));
      
      return response.data;
    } catch (error) {
      // If offline, return cached order
      if (error.message === 'No internet connection') {
        const cachedData = await AsyncStorage.getItem(`cached_order_${id}`);
        if (cachedData) {
          return JSON.parse(cachedData).data;
        }
      }
      throw error;
    }
  },
  
  // Create a new order (checkout)
  createOrder: async (orderData) => {
    const response = await apiClient.post('/api/orders', orderData);
    return response.data;
  },
  
  // Cancel an order
  cancelOrder: async (id) => {
    const response = await apiClient.post(`/api/orders/${id}/cancel`);
    
    // Update cached order
    const cachedData = await AsyncStorage.getItem(`cached_order_${id}`);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      parsedData.data.status = 'cancelled';
      await AsyncStorage.setItem(`cached_order_${id}`, JSON.stringify(parsedData));
    }
    
    // Update cached orders list
    const cachedOrders = await AsyncStorage.getItem('cached_orders');
    if (cachedOrders) {
      const parsedOrders = JSON.parse(cachedOrders);
      const orderIndex = parsedOrders.data.findIndex(order => order.id === id);
      if (orderIndex >= 0) {
        parsedOrders.data[orderIndex].status = 'cancelled';
        await AsyncStorage.setItem('cached_orders', JSON.stringify(parsedOrders));
      }
    }
    
    return response.data;
  },
  
  // Reorder (create a new order based on a previous one)
  reorder: async (id) => {
    const response = await apiClient.post(`/api/cart/reorder`, { order_id: id });
    return response.data;
  },
  
  // Track order status
  trackOrder: async (id) => {
    const response = await apiClient.get(`/api/orders/${id}/track`);
    return response.data;
  },
  
  // Clear order cache
  clearCache: async () => {
    const keys = await AsyncStorage.getAllKeys();
    const orderCacheKeys = keys.filter(key => 
      key === 'cached_orders' || key.startsWith('cached_order_')
    );
    await AsyncStorage.multiRemove(orderCacheKeys);
  }
};

export default orderService;
