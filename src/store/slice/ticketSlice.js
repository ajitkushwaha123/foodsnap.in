import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { addNotification } from "./notificationSlice";

export const createTicket = createAsyncThunk(
  "tickets/create",
  async (ticketData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post("/api/tickets", ticketData, {
        withCredentials: true,
      });

      dispatch(
        addNotification({
          type: "success",
          message: res.data?.message || "Ticket created successfully!",
          duration: 3000,
        })
      );

      return res.data.ticket;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to create ticket";

      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
          action: {
            redirect: err.response?.data?.action?.redirect || "/support",
            buttonText:
              err.response?.data?.action?.buttonText || "Contact Support",
          },
          duration: 4000,
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchTickets = createAsyncThunk(
  "tickets/fetchAll",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get("/api/tickets", {
        withCredentials: true,
      });

      return res.data.tickets || [];
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to load tickets";

      dispatch(
        addNotification({
          type: "error",
          message: errorMessage,
          action: {
            redirect: "/support",
            buttonText: "Help Desk",
          },
          duration: 4000,
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

const ticketSlice = createSlice({
  name: "tickets",

  initialState: {
    tickets: [],
    loading: false,
    creating: false,
    error: null,
  },

  reducers: {
    clearTickets: (state) => {
      state.tickets = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createTicket.pending, (state) => {
        state.creating = true;
        state.error = null;
      })

      .addCase(createTicket.fulfilled, (state, action) => {
        state.creating = false;
        state.tickets.unshift(action.payload);
      })

      .addCase(createTicket.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })

      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Failed to fetch tickets";
      });
  },
});

export const { clearTickets } = ticketSlice.actions;
export default ticketSlice.reducer;
