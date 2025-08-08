"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const InsufficientCredits = () => {
  const router = useRouter();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/pricing");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#121212] border border-red-500/30 rounded-2xl p-6 text-center w-full max-w-sm"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="flex justify-center mb-4"
        >
          <AlertTriangle className="text-red-500 w-12 h-12" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Insufficient Credits
        </h2>
        <p className="text-zinc-400 text-sm mb-6 px-2">
          You’re out of credits. Redirecting you to the pricing page...
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/pricing")}
          className="bg-red-600 hover:bg-red-700 transition text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          Go to Pricing Now
        </motion.button>
      </motion.div>
    </div>
  );
};

export default InsufficientCredits;
