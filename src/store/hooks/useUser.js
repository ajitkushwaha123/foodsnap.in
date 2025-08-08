"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  loginUser,
  logoutUser,
  loadUser,
  clearError,
  resetUser,
  registerUser,
} from "../slice/userSlice";

export const useUser = () => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated, error } = useSelector(
    (state) => state.user
  );

  const register = (userData) => dispatch(registerUser(userData));
  const login = (credentials) => dispatch(loginUser(credentials));
  const logout = () => dispatch(logoutUser());
  const fetchUser = () => dispatch(loadUser());
  const clearUserError = () => dispatch(clearError());
  const reset = () => dispatch(resetUser());

  return {
    user,
    loading,
    isAuthenticated,
    error,
    register,
    login,
    logout,
    fetchUser,
    clearUserError,
    reset,
  };
};
