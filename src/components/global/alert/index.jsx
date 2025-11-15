"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useNotification } from "@/store/hooks/useNotification";

const variantStyles = {
  error: {
    ring: "ring-red-400/40",
    bg: "bg-red-50/70 dark:bg-red-900/40 backdrop-blur-xl",
    text: "text-red-800 dark:text-red-100",
    button: "bg-red-600 hover:bg-red-700",
    defaultIcon: <AlertTriangle size={20} className="text-red-600" />,
  },
  success: {
    ring: "ring-green-400/40",
    bg: "bg-green-50/70 dark:bg-green-900/40 backdrop-blur-xl",
    text: "text-green-800 dark:text-green-100",
    button: "bg-green-600 hover:bg-green-700",
    defaultIcon: <CheckCircle2 size={20} className="text-green-600" />,
  },
  info: {
    ring: "ring-blue-400/40",
    bg: "bg-blue-50/70 dark:bg-blue-900/40 backdrop-blur-xl",
    text: "text-blue-800 dark:text-blue-100",
    button: "bg-blue-600 hover:bg-blue-700",
    defaultIcon: <Info size={20} className="text-blue-600" />,
  },
};

export default function Alert({
  message,
  icon,
  action = {},
  variant = "error",
}) {
  const router = useRouter();
  const styles = variantStyles[variant] || variantStyles.error;

  const { removeNotification } = useNotification();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`w-full rounded-md p-4 sm:p-5 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.08)] 
        ring-1 ${styles.ring} ${styles.bg} ${styles.text} flex flex-row 
        gap-4 items-start sm:items-center justify-between`}
      role="alert"
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <div className="p-2 rounded-md bg-white/70 dark:bg-black/30 shadow-sm flex items-center justify-center">
          {icon || styles.defaultIcon}
        </div>

        <p className="text-sm sm:text-base font-semibold leading-relaxed max-w-[90%] truncate">
          {message}
        </p>
      </div>

      {action && action?.redirect && action?.buttonText && (
        <Button
          type="button"
          variant="outline"
          className={`sm:w-auto text-sm sm:text-base ${styles.button} text-white font-medium 
            rounded-md px-4 py-2 shadow hover:shadow-md transition-all duration-300`}
          onClick={() => router.push(action.redirect || "/pricing")}
        >
          {action.buttonText}
        </Button>
      )}

      <div
        onClick={removeNotification}
        className="p-2 rounded-md bg-white/70 dark:bg-black/30 shadow-sm flex items-center justify-center"
      >
        <X size={16} className="text-gray-600" />
      </div>
    </motion.div>
  );
}
