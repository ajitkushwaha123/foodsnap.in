import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { addNotification } from "./notificationSlice";

export const fetchSearchResults = createAsyncThunk(
  "search/fetchResults",
  async ({ query, page, limit = 12 }, { dispatch, rejectWithValue }) => {
    try {
      // dispatch(
      //   addNotification({
      //     type: "info",
      //     message: `Searching for "${query}"...`,
      //     duration: 2000,
      //   })
      // );

      const res = await axios.get("/api/library/search", {
        params: { search: query, page, limit },
        withCredentials: true,
      });

      dispatch(
        addNotification({
          type: "info",
          message: res.data.message || `Search results for "${query}" loaded!`,
          duration: 3000,
          notification_type: "image-request",
        })
      );

      return res.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Search failed";

      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
          action: {
            redirect: err.response?.data?.action?.redirect || "/",
            buttonText: err.response?.data?.action?.buttonText || "",
          },
          duration: 4000,
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchLatestResults = createAsyncThunk(
  "search/fetchLatest",
  async ({ page = 1, limit = 12, seed }, { dispatch, rejectWithValue }) => {
    try {
      // dispatch(
      //   addNotification({
      //     type: "info",
      //     message: "Fetching latest images...",
      //     duration: 2000,
      //   })
      // );

      const res = await axios.get("/api/library/latest", {
        params: { page, limit, seed },
        withCredentials: true,
        validateStatus: () => true,
      });

      if (res.status !== 200) {
        const errorMessage = res.data?.error || "Failed to load latest images";

        dispatch(
          addNotification({
            type: "error",
            message: errorMessage,
            action: {
              redirect: res.data?.action?.redirect || "/",
              buttonText: res.data?.action?.buttonText || "",
            },
            duration: 4000,
          })
        );

        return rejectWithValue(errorMessage);
      }

      // dispatch(
      //   addNotification({
      //     type: "success",
      //     message: res.data.message || "Latest images loaded successfully!",
      //     duration: 3000,
      //   })
      // );

      return res.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred";

      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
          action: {
            redirect: "/support",
            buttonText: "Contact Support",
          },
          duration: 4000,
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",
    page: 1,
    limit: 12,
    seed: null,
    results: [],
    pagination: null,
    loading: false,
    error: null,
  },

  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    setSeed: (state, action) => {
      state.seed = action.payload;
    },
    clearSearch: (state) => {
      state.page = 1;
      state.results = [];
      state.pagination = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        const { results = [], pagination = null } = action.payload;

        if (pagination?.page === 1) {
          state.results = results;
        } else {
          state.results = [...state.results, ...results];
        }

        state.pagination = pagination;
        state.loading = false;
      })

      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Failed to load";
      })

      .addCase(fetchLatestResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchLatestResults.fulfilled, (state, action) => {
        const { results = [], pagination = null, seed = null } = action.payload;

        state.results = [...state.results, ...results];
        state.pagination = pagination;
        state.seed = seed;
        state.page = 1;
        state.loading = false;
      })

      .addCase(fetchLatestResults.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to load latest images";
      });
  },
});

export const { setQuery, setPage, setLimit, setSeed, clearSearch } =
  searchSlice.actions;

export default searchSlice.reducer;
