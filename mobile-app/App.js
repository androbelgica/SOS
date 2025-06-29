import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/store';
import { syncCart } from './src/store/slices/cartSlice';

// Define the theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0066cc',
    accent: '#f1c40f',
  },
};

const App = () => {
  // Set up network status monitoring
  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        // When the device comes back online, sync the cart
        store.dispatch(syncCart());
      }
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <StoreProvider store={store}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AppNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </StoreProvider>
  );
};

export default App;
