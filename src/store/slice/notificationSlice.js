import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: {
      reducer(state, action) {
        state.notifications = [action.payload];
      },
      prepare({ type = "info", message, duration = 3000, action = {} }) {
        return {
          payload: {
            id: nanoid(),
            type,
            message,
            duration,
            action,
          },
        };
      },
    },

    removeNotification(state, action) {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification } =
  notificationSlice.actions;

export default notificationSlice.reducer;
