"use client";

import React from "react";
import Alert from "./alert";
import { useNotification } from "@/store/hooks/useNotification";

const Notification = () => {
  const { notifications } = useNotification();

  if (!notifications || notifications.length === 0) return null;

  const note = notifications[0];

  console.log("Notification Note:", note);

  return (
    <div>
      {notifications?.length > 0 && note.type === "error" && (
        <Alert
          message={note.message}
          variant={note.type}
          icon={note.icon}
          action={note.action}
        />
      )}
    </div>
  );
};

export default Notification;
