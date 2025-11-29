import { useDispatch, useSelector } from "react-redux";

import { useCallback } from "react";
import { fetchAIResponse, resetStudio } from "../slice/studioSlice";

export const useStudio = () => {
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector((state) => state.studio);

  const generateAI = useCallback(
    (formData) => {
      dispatch(fetchAIResponse(formData));
    },
    [dispatch]
  );

  const reset = useCallback(() => {
    dispatch(resetStudio());
  }, [dispatch]);

  return {
    loading,
    data,
    error,
    generateAI,
    reset,
  };
};
