"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowUpRight, AlertTriangle, Menu } from "lucide-react";
import UserSection from "../user/userButton";
import { Button } from "@/components/ui/button";
import axios from "axios";
import StatusBar from "@/components/notification";
import { UserButton } from "@clerk/nextjs";

export default function DashboardHeader({ title, toggleSidebar }) {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [credits, setCredits] = useState(10);

  const getSubscription = async () => {
    try {
      const res = await axios.get("/api/user/subscription");
      setSubscription(res.data.subscription);
    } catch (err) {
      console.error("Subscription fetch error:", err);
    }
  };

  const getCredits = async () => {
    try {
      const res = await axios.get("/api/user/credits");
      setCredits(res.data.credits);
    } catch (err) {
      console.error("Credits fetch error:", err);
      setCredits(0);
    }
  };

  useEffect(() => {
    getSubscription();
    getCredits();
  }, []);

  const renderSubscriptionBadge = () => {
    if (!subscription) return null;

    const { plan, isActive } = subscription;
    const isFree = plan === "free";

    return (
      <Badge
        className={`ml-2 text-xs ${
          !isActive
            ? "bg-zinc-500/60 line-through"
            : isFree
            ? "bg-yellow-500/80 text-black"
            : "bg-blue-600/90 text-white"
        }`}
      >
        {plan} {!isActive && "(Inactive)"}
      </Badge>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full px-6 py-3 flex items-center justify-between border-b border-muted bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md sticky top-0"
      >
        <div className="flex items-center gap-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          <div className="md:hidden">
            <Menu onClick={toggleSidebar} />
          </div>
          <span>{title}</span>
          {renderSubscriptionBadge()}
        </div>

        <div className="flex items-center gap-4">
          {subscription &&
            (!subscription.isActive || subscription.plan === "free") && (
              <Button
                onClick={() => router.push("/pricing")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-md hover:scale-105 hover:brightness-110 transition-all flex items-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4 animate-bounce" />
                Upgrade Plan
              </Button>
            )}
          <div className="hidden md:block">
            <UserSection />
          </div>
          <div className="md:hidden">
            <UserButton />
          </div>
        </div>
      </motion.div>

      {credits === 0 && (
        <StatusBar
          message="You’ve run out of credits!"
          icon={
            <AlertTriangle className="h-5 w-5 animate-pulse text-red-600 dark:text-red-300" />
          }
          redirectPath="/pricing"
          buttonText="Upgrade Now"
          variant="error"
        />
      )}
    </>
  );
}
