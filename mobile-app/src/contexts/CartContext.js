import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import { useAuth } from './AuthContext';

const CartContext = createContext({});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      clearCart();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    calculateCartTotals();
  }, [cartItems]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      
      if (isAuthenticated) {
        // Load cart from API for authenticated users
        const response = await apiService.getCart();
        setCartItems(response.data || []);
      } else {
        // Load cart from local storage for guest users
        const localCart = await AsyncStorage.getItem('guest_cart');
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to local storage
      const localCart = await AsyncStorage.getItem('guest_cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveCartLocally = async (items) => {
    try {
      await AsyncStorage.setItem('guest_cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart locally:', error);
    }
  };

  const calculateCartTotals = () => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const total = cartItems.reduce((total, item) => {
      return total + (parseFloat(item.product.price) * item.quantity);
    }, 0);
    
    setCartItemsCount(count);
    setCartTotal(total);
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      if (isAuthenticated) {
        // Add to cart via API
        const response = await apiService.addToCart({
          product_id: productId,
          quantity: quantity,
        });
        
        if (response.success) {
          await loadCart(); // Reload cart from server
          return { success: true };
        }
      } else {
        // Add to local cart for guest users
        const existingItemIndex = cartItems.findIndex(
          item => item.product.id === productId
        );
        
        let updatedCart;
        if (existingItemIndex >= 0) {
          // Update existing item
          updatedCart = [...cartItems];
          updatedCart[existingItemIndex].quantity += quantity;
        } else {
          // Add new item (you'd need to fetch product details)
          // This is a simplified version
          const newItem = {
            id: Date.now(), // Temporary ID
            product_id: productId,
            quantity: quantity,
            product: { id: productId }, // You'd fetch full product details
          };
          updatedCart = [...cartItems, newItem];
        }
        
        setCartItems(updatedCart);
        await saveCartLocally(updatedCart);
        return { success: true };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        error: error.message || 'Failed to add item to cart',
      };
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        return await removeFromCart(productId);
      }

      if (isAuthenticated) {
        // Update via API
        const response = await apiService.updateCartItem(productId, quantity);
        
        if (response.success) {
          await loadCart(); // Reload cart from server
          return { success: true };
        }
      } else {
        // Update local cart
        const updatedCart = cartItems.map(item => {
          if (item.product.id === productId) {
            return { ...item, quantity: quantity };
          }
          return item;
        });
        
        setCartItems(updatedCart);
        await saveCartLocally(updatedCart);
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        error: error.message || 'Failed to update cart item',
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (isAuthenticated) {
        // Remove via API
        const response = await apiService.removeFromCart(productId);
        
        if (response.success) {
          await loadCart(); // Reload cart from server
          return { success: true };
        }
      } else {
        // Remove from local cart
        const updatedCart = cartItems.filter(
          item => item.product.id !== productId
        );
        
        setCartItems(updatedCart);
        await saveCartLocally(updatedCart);
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove item from cart',
      };
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        // Clear via API
        await apiService.clearCart();
      }
      
      // Clear local cart
      setCartItems([]);
      await AsyncStorage.removeItem('guest_cart');
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Clear local cart even if API fails
      setCartItems([]);
      await AsyncStorage.removeItem('guest_cart');
      
      return {
        success: false,
        error: error.message || 'Failed to clear cart',
      };
    }
  };

  const syncCartWithServer = async () => {
    try {
      if (!isAuthenticated) return;
      
      // Get local cart
      const localCart = await AsyncStorage.getItem('guest_cart');
      if (localCart) {
        const localItems = JSON.parse(localCart);
        
        // Sync each item with server
        for (const item of localItems) {
          await apiService.addToCart({
            product_id: item.product.id,
            quantity: item.quantity,
          });
        }
        
        // Clear local cart after sync
        await AsyncStorage.removeItem('guest_cart');
        
        // Reload cart from server
        await loadCart();
      }
    } catch (error) {
      console.error('Error syncing cart with server:', error);
    }
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.product.id === productId);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.product.id === productId);
  };

  const value = {
    cartItems,
    cartItemsCount,
    cartTotal,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    syncCartWithServer,
    getCartItem,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
