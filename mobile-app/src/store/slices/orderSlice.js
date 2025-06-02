import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../api/orderService';

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrder(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(id);
      return { ...response, id };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const reorder = createAsyncThunk(
  'orders/reorder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.reorder(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const trackOrder = createAsyncThunk(
  'orders/trackOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await orderService.trackOrder(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  orders: [],
  order: null,
  isLoading: false,
  error: null,
  createOrderStatus: null,
  cancelOrderStatus: null,
  trackingInfo: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCreateOrderStatus: (state) => {
      state.createOrderStatus = null;
    },
    clearCancelOrderStatus: (state) => {
      state.cancelOrderStatus = null;
    },
    clearOrder: (state) => {
      state.order = null;
    },
    clearTrackingInfo: (state) => {
      state.trackingInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data || action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch orders';
      })
      
      // Fetch single order
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload.data || action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch order';
      })
      
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.createOrderStatus = 'pending';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.createOrderStatus = 'success';
        
        // Add the new order to the orders list
        const newOrder = action.payload.data || action.payload;
        state.orders = [newOrder, ...state.orders];
        
        // Set the current order to the newly created one
        state.order = newOrder;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create order';
        state.createOrderStatus = 'failed';
      })
      
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.cancelOrderStatus = 'pending';
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cancelOrderStatus = 'success';
        
        // Update the order status in the orders list
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex >= 0) {
          state.orders[orderIndex].status = 'cancelled';
        }
        
        // Update the current order if it's the one being cancelled
        if (state.order && state.order.id === action.payload.id) {
          state.order.status = 'cancelled';
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to cancel order';
        state.cancelOrderStatus = 'failed';
      })
      
      // Reorder
      .addCase(reorder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorder.fulfilled, (state) => {
        state.isLoading = false;
        // The cart will be updated by the cart slice
      })
      .addCase(reorder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to reorder';
      })
      
      // Track order
      .addCase(trackOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trackingInfo = action.payload.data || action.payload;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to track order';
      });
  },
});

export const { 
  clearError, 
  clearCreateOrderStatus, 
  clearCancelOrderStatus, 
  clearOrder,
  clearTrackingInfo
} = orderSlice.actions;

export default orderSlice.reducer;
