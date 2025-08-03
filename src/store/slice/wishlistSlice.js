import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// --- THUNKS ---

export const addToWishlistThunk = createAsyncThunk(
  "wishlist/addToWishlistThunk",
  async (imageId, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/user/wishlist", { imageId });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to add to wishlist"
      );
    }
  }
);

export const fetchWishlistThunk = createAsyncThunk(
  "wishlist/fetchWishlistThunk",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/user/wishlist");
      return res.data?.wishlist || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  }
);

export const removeFromWishlistThunk = createAsyncThunk(
  "wishlist/removeFromWishlistThunk",
  async (imageId, { rejectWithValue }) => {
    try {
      await axios.delete("/api/user/wishlist", {
        data: { imageId },
      });
      return { _id: imageId };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to remove from wishlist"
      );
    }
  }
);

// --- INITIAL STATE ---

const initialState = {
  items: [],
  addingLoading: false,
  addingError: null,
  fetchLoading: false,
  fetchError: null,
  removingLoading: false,
  removingError: null,
};

// --- SLICE ---

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlistLocal: (state, action) => {
      state.items.push(action.payload);
    },
    removeFromWishlistLocal: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      // Add to Wishlist
      .addCase(addToWishlistThunk.pending, (state) => {
        state.addingLoading = true;
        state.addingError = null;
      })
      .addCase(addToWishlistThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.addingLoading = false;
      })
      .addCase(addToWishlistThunk.rejected, (state, action) => {
        state.addingError = action.payload;
        state.addingLoading = false;
      })

      // Fetch Wishlist
      .addCase(fetchWishlistThunk.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchWishlistThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.fetchLoading = false;
      })
      .addCase(fetchWishlistThunk.rejected, (state, action) => {
        state.fetchError = action.payload;
        state.fetchLoading = false;
      })

      // Remove from Wishlist
      .addCase(removeFromWishlistThunk.pending, (state) => {
        state.removingLoading = true;
        state.removingError = null;
      })
      .addCase(removeFromWishlistThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item._id !== action.payload._id
        );
        state.removingLoading = false;
      })
      .addCase(removeFromWishlistThunk.rejected, (state, action) => {
        state.removingError = action.payload;
        state.removingLoading = false;
      });
  },
});

export const {
  addToWishlistLocal,
  removeFromWishlistLocal,
  setWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
