"use client";

import { useUser } from "@/store/hooks/useUser";
import { motion } from "framer-motion";

export default function UserSection() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-zinc-900 shadow-md rounded-lg border border-zinc-200 dark:border-zinc-700"
    >
      <img
        src={user.avatar}
        alt={user.fullName}
        className="w-10 h-10 rounded-full border-2 border-zinc-300 dark:border-zinc-600 hover:scale-105 transition-transform duration-200"
      />

      <div className="flex flex-col justify-center">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {user.phone || "Your Account"}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]">
          {user.email || "No email"}
        </span>
      </div>
    </motion.div>
  );
}
