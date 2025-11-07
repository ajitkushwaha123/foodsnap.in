"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlans } from "../slice/planSlice";

export const usePlan = () => {
  const dispatch = useDispatch();
  const { plans, loading, error } = useSelector((state) => state.plans);

  const getAllActivePlans = async () => {
    await dispatch(fetchPlans());
  };

  return {
    plans,
    loading,
    error,
    getAllActivePlans,
  };
};
