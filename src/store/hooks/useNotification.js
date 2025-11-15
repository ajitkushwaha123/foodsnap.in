import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  removeNotification,
} from "@/store/slice/notificationSlice";

export const useNotification = () => {
  const dispatch = useDispatch();

  const { notifications } = useSelector((state) => state.notifications);

  const notify = useCallback(
    (type, message, duration = 3000) => {
      dispatch(
        addNotification({
          type,
          message,
          duration,
        })
      );
    },
    [dispatch]
  );

  return {
    success: (msg, duration) => notify("success", msg, duration),
    error: (msg, duration) => notify("error", msg, duration),
    warning: (msg, duration) => notify("warning", msg, duration),
    info: (msg, duration) => notify("info", msg, duration),
    custom: ({ type, message, duration }) => notify(type, message, duration),
    notifications,
    removeNotification: () => dispatch(removeNotification()),
  };
};
