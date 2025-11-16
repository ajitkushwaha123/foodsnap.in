import { useDispatch, useSelector } from "react-redux";
import {
  createTicket,
  fetchTickets,
  clearTickets,
} from "@/store/slice/ticketSlice";

export const useTicket = () => {
  const dispatch = useDispatch();

  const { tickets, loading, creating, error } = useSelector(
    (state) => state.tickets
  );

  const handleCreateTicket = (data) => {
    return dispatch(createTicket(data));
  };

  const loadTickets = () => {
    return dispatch(fetchTickets());
  };

  const resetTickets = () => {
    dispatch(clearTickets());
  };

  return {
    tickets,
    loading,
    creating,
    error,

    handleCreateTicket,
    loadTickets,
    resetTickets,
  };
};
