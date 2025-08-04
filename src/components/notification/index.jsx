"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const variantStyles = {
  error: {
    bg: "bg-red-100 dark:bg-red-900/60",
    text: "text-red-800 dark:text-red-100",
    button: "bg-red-600 hover:bg-red-700",
  },
  success: {
    bg: "bg-green-100 dark:bg-green-900/60",
    text: "text-green-800 dark:text-green-100",
    button: "bg-green-600 hover:bg-green-700",
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/60",
    text: "text-blue-800 dark:text-blue-100",
    button: "bg-blue-600 hover:bg-blue-700",
  },
};

const StatusBar = ({
  message,
  icon,
  showButton = true,
  redirectPath = "/pricing",
  buttonText = "Go Now",
  variant = "error",
}) => {
  const router = useRouter();
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full ${styles.bg} rounded-md ${styles.text} px-6 py-3 flex items-center justify-between shadow-md`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {message}
      </div>
      {showButton && (
        <Button
          variant="outline"
          className={`text-sm ${styles.button} text-white`}
          onClick={() => router.push(redirectPath)}
        >
          {buttonText}
        </Button>
      )}
    </motion.div>
  );
};

export default StatusBar;
