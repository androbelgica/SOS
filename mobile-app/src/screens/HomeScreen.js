import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Searchbar,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { cartItemsCount } = useCart();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load featured products, recipes, and categories in parallel
      const [productsResponse, recipesResponse, categoriesResponse] = await Promise.all([
        apiService.getProducts({ featured: true, limit: 6 }),
        apiService.getRecipes({ featured: true, limit: 4 }),
        apiService.getProductCategories(),
      ]);

      setFeaturedProducts(productsResponse.data || []);
      setFeaturedRecipes(recipesResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error loading home data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load home data. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Products', { searchQuery: searchQuery.trim() });
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('Products', { category: category.id });
  };

  const handleAddToCart = async (product) => {
    try {
      await apiService.addToCart({
        product_id: product.id,
        quantity: 1,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add item to cart. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading SeaBasket...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              Welcome{user ? `, ${user.name}` : ''}!
            </Text>
            <Text style={styles.subtitleText}>
              Fresh seafood delivered to your door
            </Text>
          </View>
          <View style={styles.cartBadge}>
            <Ionicons name="cart-outline" size={24} color="#0ea5e9" />
            {cartItemsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemsCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search for seafood, recipes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          icon="magnify"
          clearIcon="close"
        />

        {/* Categories */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Categories</Title>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  mode="outlined"
                  onPress={() => handleCategoryPress(category)}
                  style={styles.categoryChip}
                >
                  {category.name}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Featured Products</Title>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Products')}
              compact
            >
              View All
            </Button>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.productsContainer}>
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => handleProductPress(product)}
                >
                  <Card.Cover
                    source={{ uri: product.image_url }}
                    style={styles.productImage}
                  />
                  <Card.Content style={styles.productContent}>
                    <Title numberOfLines={2} style={styles.productTitle}>
                      {product.name}
                    </Title>
                    <Paragraph style={styles.productPrice}>
                      ₱{product.price}
                    </Paragraph>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      mode="contained"
                      compact
                      onPress={() => handleAddToCart(product)}
                      disabled={!product.is_available}
                    >
                      Add to Cart
                    </Button>
                  </Card.Actions>
                </Card>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Recipes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Featured Recipes</Title>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Recipes')}
              compact
            >
              View All
            </Button>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.recipesContainer}>
              {featuredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => handleRecipePress(recipe)}
                >
                  <Card.Cover
                    source={{ uri: recipe.image_url }}
                    style={styles.recipeImage}
                  />
                  <Card.Content style={styles.recipeContent}>
                    <Title numberOfLines={2} style={styles.recipeTitle}>
                      {recipe.title}
                    </Title>
                    <Paragraph style={styles.recipeDescription}>
                      {recipe.description}
                    </Paragraph>
                    <View style={styles.recipeStats}>
                      <View style={styles.recipeStat}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.recipeStatText}>
                          {recipe.cooking_time} min
                        </Text>
                      </View>
                      <View style={styles.recipeStat}>
                        <Ionicons name="star" size={16} color="#ffd700" />
                        <Text style={styles.recipeStatText}>
                          {recipe.average_rating || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cartBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  productsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  productCard: {
    width: 200,
    marginRight: 12,
  },
  productImage: {
    height: 120,
  },
  productContent: {
    paddingBottom: 8,
  },
  productTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  recipesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  recipeCard: {
    width: 250,
    marginRight: 12,
  },
  recipeImage: {
    height: 140,
  },
  recipeContent: {
    paddingBottom: 8,
  },
  recipeTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    numberOfLines: 2,
  },
  recipeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  recipeStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeStatText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
});

export default HomeScreen;
