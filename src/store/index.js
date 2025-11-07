import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";
import planReducer from "./slice/planSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    plans: planReducer,
  },
});
