"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowUpRight, AlertTriangle } from "lucide-react";
import UserSection from "../user/userButton";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function DashboardHeader({ title, credits }) {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);

  const getSubscription = async () => {
    try {
      const response = await axios.get("/api/user/subscription");
      const { subscription } = response.data;
      setSubscription(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  useEffect(() => {
    getSubscription();
  }, []);

  useEffect(() => {
    if (credits === 0) {
      const timer = setTimeout(() => {
        router.push("/pricing");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [credits, router]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full px-6 py-2.5 flex items-center justify-between border-b border-muted bg-white/50 dark:bg-black/30 backdrop-blur-md sticky top-0 z-40"
      >
        <div className="flex items-center gap-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          <Sparkles className="text-yellow-500 animate-pulse w-5 h-5" />
          <span>{title}</span>
          {subscription?.plan && (
            <Badge className="ml-2 text-xs bg-blue-600/90">
              {subscription.plan}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.push("/pricing")}
            className="bg-green-500 text-white font-medium shadow-lg hover:scale-105 transition-transform duration-300"
          >
            <ArrowUpRight className="mr-1.5 h-4 w-4 animate-bounce" />
            Upgrade Plan
          </Button>
          <UserSection />
        </div>
      </motion.div>

      {credits === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-shake text-red-600 dark:text-red-300" />
            <p className="text-sm font-medium">You’ve run out of credits!</p>
          </div>
          <Button
            onClick={() => router.push("/pricing")}
            className="bg-red-500 text-white hover:bg-red-600 hover:scale-105 transition-all"
          >
            Upgrade Now
          </Button>
        </motion.div>
      )}
    </>
  );
}
