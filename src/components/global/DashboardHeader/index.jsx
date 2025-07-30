"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import UserSection from "../user/userButton";

export default function DashboardHeader({ title, credits }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full px-6 py-2.5 flex items-center justify-between border-b border-muted bg-white/50 dark:bg-black/30 backdrop-blur-md sticky top-0 z-40"
    >
      <div className="flex items-center gap-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
        <Sparkles className="text-yellow-500 animate-pulse w-5 h-5" />
        <span>{title}</span>
      </div>

      <div className="flex items-center space-x-4">
        <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold rounded-md shadow-lg hover:bg-emerald-700 transition-colors duration-200 border-none">
          {credits} Credits
        </Badge>
        <UserSection />
      </div>
    </motion.div>
  );
}
