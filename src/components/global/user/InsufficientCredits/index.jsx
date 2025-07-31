"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const InsufficientCredits = () => {
  const router = useRouter();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/pricing");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#161622] border border-red-500/30 rounded-2xl p-8 shadow-2xl text-center w-full max-w-md"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex justify-center mb-4"
        >
          <AlertCircle className="text-red-500 w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Insufficient Credits
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          You need more credits to perform this action. Redirecting to the
          pricing page...
        </p>

        <button
          onClick={() => router.push("/pricing")}
          className="bg-red-600 hover:bg-red-700 transition-all duration-300 text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-md"
        >
          Go to Pricing Now
        </button>
      </motion.div>
    </div>
  );
};

export default InsufficientCredits;
