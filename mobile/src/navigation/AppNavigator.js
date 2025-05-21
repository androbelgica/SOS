import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main screens
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/products/ProductsScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import RecipesScreen from '../screens/recipes/RecipesScreen';
import RecipeDetailScreen from '../screens/recipes/RecipeDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
    </Stack.Navigator>
  );
};

const ProductsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductsList" component={ProductsScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
    </Stack.Navigator>
  );
};

const RecipesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="RecipesList" component={RecipesScreen} options={{ title: 'Recipes' }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Recipe Details' }} />
    </Stack.Navigator>
  );
};

const CartStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartItems" component={CartScreen} options={{ title: 'My Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Products') {
            iconName = 'fish';
          } else if (route.name === 'Recipes') {
            iconName = 'food-variant';
          } else if (route.name === 'Cart') {
            iconName = 'cart';
          } else if (route.name === 'Profile') {
            iconName = 'account';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Products" component={ProductsStack} />
      <Tab.Screen name="Recipes" component={RecipesStack} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await dispatch(getCurrentUser());
      } finally {
        setInitializing(false);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  if (initializing || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
