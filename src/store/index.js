import { configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "./slice/wishlistSlice";

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
  },
});
