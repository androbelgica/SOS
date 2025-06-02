import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipeService from '../../api/recipeService';

// Async thunks
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await recipeService.getRecipes(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchRecipe = createAsyncThunk(
  'recipes/fetchRecipe',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recipeService.getRecipe(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const saveRecipe = createAsyncThunk(
  'recipes/saveRecipe',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recipeService.saveRecipe(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const unsaveRecipe = createAsyncThunk(
  'recipes/unsaveRecipe',
  async (id, { rejectWithValue }) => {
    try {
      const response = await recipeService.unsaveRecipe(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchSavedRecipes = createAsyncThunk(
  'recipes/fetchSavedRecipes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recipeService.getSavedRecipes();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const rateRecipe = createAsyncThunk(
  'recipes/rateRecipe',
  async ({ id, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await recipeService.rateRecipe(id, rating, comment);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const searchRecipes = createAsyncThunk(
  'recipes/searchRecipes',
  async (query, { rejectWithValue }) => {
    try {
      const response = await recipeService.searchRecipes(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  recipes: [],
  recipe: null,
  savedRecipes: [],
  searchResults: [],
  isLoading: false,
  error: null,
  filters: {
    difficulty: null,
    cookingTime: null,
    sortBy: null,
  },
  ratingStatus: null,
};

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        difficulty: null,
        cookingTime: null,
        sortBy: null,
      };
    },
    clearRecipe: (state) => {
      state.recipe = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearRatingStatus: (state) => {
      state.ratingStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch recipes
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload.data || action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch recipes';
      })
      
      // Fetch single recipe
      .addCase(fetchRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipe = action.payload.data || action.payload;
      })
      .addCase(fetchRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch recipe';
      })
      
      // Save recipe
      .addCase(saveRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update the saved status in the current recipe if it's loaded
        if (state.recipe && state.recipe.id === action.meta.arg) {
          state.recipe.is_saved = true;
        }
        
        // Update the saved status in the recipes list
        const recipeIndex = state.recipes.findIndex(recipe => recipe.id === action.meta.arg);
        if (recipeIndex >= 0) {
          state.recipes[recipeIndex].is_saved = true;
        }
      })
      .addCase(saveRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to save recipe';
      })
      
      // Unsave recipe
      .addCase(unsaveRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unsaveRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update the saved status in the current recipe if it's loaded
        if (state.recipe && state.recipe.id === action.meta.arg) {
          state.recipe.is_saved = false;
        }
        
        // Update the saved status in the recipes list
        const recipeIndex = state.recipes.findIndex(recipe => recipe.id === action.meta.arg);
        if (recipeIndex >= 0) {
          state.recipes[recipeIndex].is_saved = false;
        }
        
        // Remove from saved recipes list
        state.savedRecipes = state.savedRecipes.filter(recipe => recipe.id !== action.meta.arg);
      })
      .addCase(unsaveRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to unsave recipe';
      })
      
      // Fetch saved recipes
      .addCase(fetchSavedRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSavedRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedRecipes = action.payload.data || action.payload;
      })
      .addCase(fetchSavedRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch saved recipes';
      })
      
      // Rate recipe
      .addCase(rateRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.ratingStatus = 'pending';
      })
      .addCase(rateRecipe.fulfilled, (state) => {
        state.isLoading = false;
        state.ratingStatus = 'success';
      })
      .addCase(rateRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to rate recipe';
        state.ratingStatus = 'failed';
      })
      
      // Search recipes
      .addCase(searchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data || action.payload;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to search recipes';
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  clearRecipe, 
  clearSearchResults,
  clearRatingStatus
} = recipeSlice.actions;

export default recipeSlice.reducer;
