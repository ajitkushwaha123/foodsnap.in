import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";
import planReducer from "./slice/planSlice";
import searchReducer from "./slice/searchSlice";
import notificationReducer from "./slice/notificationSlice";
import imageReducer from "./slice/imageSlice";
import ticketReducer from "./slice/ticketSlice";
import studioReducer from "./slice/studioSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    plans: planReducer,
    search: searchReducer,
    notifications: notificationReducer,
    image: imageReducer,
    tickets: ticketReducer,
    studio: studioReducer,
  },
});
