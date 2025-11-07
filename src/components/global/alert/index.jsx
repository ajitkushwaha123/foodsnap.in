"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const variantStyles = {
  error: {
    bg: "bg-red-100 dark:bg-red-900/60",
    text: "text-red-800 dark:text-red-100",
    button: "bg-red-600 hover:bg-red-700",
    defaultIcon: <AlertTriangle size={18} />,
  },
  success: {
    bg: "bg-green-100 dark:bg-green-900/60",
    text: "text-green-800 dark:text-green-100",
    button: "bg-green-600 hover:bg-green-700",
    defaultIcon: <CheckCircle2 size={18} />,
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/60",
    text: "text-blue-800 dark:text-blue-100",
    button: "bg-blue-600 hover:bg-blue-700",
    defaultIcon: <Info size={18} />,
  },
};

export default function Alert({
  message,
  icon,
  showButton = true,
  redirectPath = "/pricing",
  buttonText = "Go Now",
  variant = "error",
}) {
  const router = useRouter();
  const styles = variantStyles[variant] || variantStyles.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full ${styles.bg} rounded-xl ${styles.text} 
        px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center 
        justify-between gap-3 sm:gap-4 shadow-md`}
      role="alert"
    >
      <div className=" md:hidden">
        <img src="./assets/low-balance-alert.png" />
      </div>
      <div className="flex items-start sm:items-center gap-2 text-sm sm:text-base font-medium leading-tight">
        <span className="shrink-0 mt-0.5 sm:mt-0">
          {icon || styles.defaultIcon}
        </span>
        <span className="break-words">{message}</span>
      </div>

      {showButton && (
        <Button
          type="button"
          variant="outline"
          className={`w-full sm:w-auto text-sm sm:text-base ${styles.button} text-white font-medium 
            rounded-lg transition-all duration-300`}
          onClick={() => router.push(redirectPath)}
        >
          {buttonText}
        </Button>
      )}
    </motion.div>
  );
}
