"use client";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlistThunk,
  fetchWishlistThunk,
  removeFromWishlistThunk,
} from "../slice/wishlistSlice";

export const useWishlist = () => {
  const dispatch = useDispatch();

  const {
    items,
    addingLoading,
    addingError,
    fetchLoading,
    fetchError,
    removingLoading,
    removingError,
  } = useSelector((state) => state.wishlist);

  const getWishlist = async () => {
    try {
      await dispatch(fetchWishlistThunk()).unwrap();
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const addToWishlist = async (imageId) => {
    try {
      await dispatch(addToWishlistThunk(imageId)).unwrap();
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
    }
  };

  const removeFromWishlist = async (imageId) => {
    try {
      await dispatch(removeFromWishlistThunk(imageId)).unwrap();
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  return {
    items,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    addingLoading,
    addingError,
    fetchLoading,
    fetchError,
    removingLoading,
    removingError,
  };
};
