import { configureStore } from "@reduxjs/toolkit";
import wishlistReducer from "./slice/wishlistSlice";
import userReducer from "./slice/userSlice";

export const store = configureStore({
  reducer: {
    wishlist: wishlistReducer,
    user: userReducer,
  },
});
