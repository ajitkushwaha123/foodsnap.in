import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAIResponse = createAsyncThunk(
  "studio/fetchAIResponse",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/ai-studio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.error || data.raw?.error?.message || "Request failed"
        );
      }

      if (data.error) {
        return rejectWithValue(
          data.error || data.raw?.error?.message || "AI Error occurred"
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const studioSlice = createSlice({
  name: "studio",
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  reducers: {
    resetStudio: (state) => {
      state.loading = false;
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
      })
      .addCase(fetchAIResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchAIResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { resetStudio } = studioSlice.actions;
export default studioSlice.reducer;
