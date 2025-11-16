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

export const reportImage = createAsyncThunk(
  "image/report",
  async ({ imageId, reason }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(
        addNotification({
          type: "info",
          message: "Reporting Image...",
          duration: 2000,
        })
      );

      const res = await axios.post(
        "/api/image/report",
        { imageId },
        {
          withCredentials: true,
          validateStatus: () => true,
        }
      );

      if (!res.data || res.status >= 400) {
        const errorMsg = res.data?.error || "Something went wrong.";
        const action = res.data?.action;

        dispatch(
          addNotification({
            type: "error",
            message: errorMsg,
            action: action || null,
            duration: 4000,
          })
        );

        return rejectWithValue(errorMsg);
      }

      dispatch(
        addNotification({
          type: "success",
          message: "Report submitted successfully.",
          duration: 3000,
        })
      );

      return res.data;
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

export const fetchDownloadedImages = createAsyncThunk(
  "image/fetchDownloadedImages",
  async ({ page = 1, limit = 10 }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(
        addNotification({
          type: "info",
          message: "Fetching your downloads...",
          duration: 2000,
        })
      );

      const res = await axios.get("/api/library/download/all", {
        params: { page, limit },
        withCredentials: true,
        validateStatus: () => true,
      });

      if (res.status >= 400) {
        const errorMsg =
          res.data?.error || "Something went wrong while fetching downloads.";

        dispatch(
          addNotification({
            type: "error",
            message: errorMsg,
            action: res.data?.action,
            duration: 4000,
          })
        );

        return rejectWithValue(errorMsg);
      }

      dispatch(
        addNotification({
          type: "success",
          message: "Downloads fetched successfully.",
          duration: 3000,
        })
      );

      return res.data; // contains { downloads, pagination }
    } catch (err) {
      dispatch(
        addNotification({
          type: "error",
          message: "Unexpected error occurred.",
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
    downloadedImages: [],
    pagination: {},
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
      })
      .addCase(reportImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(reportImage.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(reportImage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Report submission failed";
      })
      .addCase(fetchDownloadedImages.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchDownloadedImages.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.downloadedImages = action.payload.downloads || [];
        state.pagination = action.payload.pagination || {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 1,
        };
      })

      .addCase(fetchDownloadedImages.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          "Fetching downloads failed";
      });
  },
});

export default imageSlice.reducer;
