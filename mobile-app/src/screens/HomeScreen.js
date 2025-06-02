import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchRecipes } from '../store/slices/recipeSlice';
import { addToCart } from '../store/slices/cartSlice';
import FastImage from 'react-native-fast-image';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { products, isLoading: productsLoading } = useSelector((state) => state.products);
  const { recipes, isLoading: recipesLoading } = useSelector((state) => state.recipes);
  const { user } = useSelector((state) => state.auth);
  
  const [searchQuery, setSearchQuery] = React.useState('');
  
  useEffect(() => {
    dispatch(fetchProducts({ limit: 5 }));
    dispatch(fetchRecipes({ limit: 5 }));
  }, [dispatch]);
  
  const onChangeSearch = query => setSearchQuery(query);
  
  const handleSearch = () => {
    navigation.navigate('Search', { query: searchQuery });
  };
  
  const handleAddToCart = (productId) => {
    dispatch(addToCart({ productId, quantity: 1 }));
  };
  
  const renderProductItem = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
      <FastImage
        style={styles.cardImage}
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Card.Content>
        <Title numberOfLines={1}>{item.name}</Title>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
        <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => handleAddToCart(item.id)}>Add to Cart</Button>
      </Card.Actions>
    </Card>
  );
  
  const renderRecipeItem = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}>
      <FastImage
        style={styles.cardImage}
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Card.Content>
        <Title numberOfLines={1}>{item.title}</Title>
        <View style={styles.recipeInfo}>
          <Text>⏱️ {item.cooking_time} mins</Text>
          <Text>🔥 {item.difficulty_level}</Text>
        </View>
        <Paragraph numberOfLines={2}>{item.description}</Paragraph>
      </Card.Content>
    </Card>
  );
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'Guest'}!</Text>
        <Text style={styles.subGreeting}>What would you like to cook today?</Text>
      </View>
      
      <Searchbar
        placeholder="Search products or recipes"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
        onSubmitEditing={handleSearch}
      />
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {productsLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <FlatList
            data={products.slice(0, 5)}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Recipes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Recipes')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {recipesLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <FlatList
            data={recipes.slice(0, 5)}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#0066cc',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  searchBar: {
    margin: 15,
    elevation: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#0066cc',
  },
  listContent: {
    paddingHorizontal: 10,
  },
  card: {
    width: 200,
    marginHorizontal: 5,
    elevation: 2,
  },
  cardImage: {
    height: 120,
    width: '100%',
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
    color: '#0066cc',
  },
  recipeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  loader: {
    marginVertical: 20,
  },
});

export default HomeScreen;
