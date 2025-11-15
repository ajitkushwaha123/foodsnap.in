import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { addNotification } from "./notificationSlice";

export const downloadImage = createAsyncThunk(
  "image/download",
  async ({ imageId }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(
        addNotification({
          type: "info",
          message: "Preparing your download...",
          duration: 2000,
        })
      );

      const res = await axios.get("/api/library/download", {
        params: { imageId },
        responseType: "blob",
        withCredentials: true,
        validateStatus: () => true,
      });

      if (res.status !== 200) {
        const errorJson = await res.data.text().then(JSON.parse);

        dispatch(
          addNotification({
            type: "error",
            message: errorJson.error,
            action: {
              redirect: errorJson.action?.redirect || "/",
              buttonText: errorJson.action?.buttonText || "",
            },
            duration: 4000,
          })
        );

        return rejectWithValue(errorJson.error);
      }

      const contentDisposition = res.headers["content-disposition"];
      let fileName = "image.jpg";

      console.log("Content-Disposition:", contentDisposition);

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      dispatch(
        addNotification({
          type: "success",
          message: "Image downloaded successfully!",
          duration: 3000,
        })
      );

      return true;
    } catch (err) {
      dispatch(
        addNotification({
          type: "error",
          message: "Unexpected error occurred.",
          action: {
            redirect: "/support",
            buttonText: "Contact Support",
          },
          duration: 4000,
        })
      );

      return rejectWithValue("Unexpected error occurred");
    }
  }
);

const imageSlice = createSlice({
  name: "image",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(downloadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(downloadImage.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(downloadImage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Download failed";
      });
  },
});

export default imageSlice.reducer;
