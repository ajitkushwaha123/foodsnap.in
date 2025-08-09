"use client";

import {
  BadgeCheck,
  Crown,
  Phone,
  Search,
  Download,
  Zap,
  ArrowUpRight,
  Menu,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/store/hooks/useUser";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardHeader({ isMobile = false, onMenuToggle }) {
  const { user, loading, fetchUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading || !user) return null;

  const {
    phone,
    credits,
    isAdmin,
    subscription = {},
    totalSearches,
    totalImagesDownloaded,
  } = user;

  const isSubscribed = subscription?.isActive;
  const plan = subscription?.plan || "free";
  const expiresAt = subscription?.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString()
    : "N/A";

  const showUpgrade = !isSubscribed || plan === "free";

  return (
    <Card className="w-full px-6 py-5 mb-6 rounded-xl bg-white dark:bg-gray-900 shadow-sm border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={onMenuToggle}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Welcome, <Phone size={18} className="text-gray-500" />{" "}
              {phone || "-"}
              {isAdmin && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <Crown size={12} className="mr-1" />
                  Admin
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Plan:{" "}
              <span className="capitalize font-medium text-gray-700 dark:text-white">
                {plan}
              </span>{" "}
              {isSubscribed ? (
                <span className="text-green-600 ml-2 inline-flex items-center gap-1">
                  <BadgeCheck size={14} /> Active
                </span>
              ) : (
                <span className="text-red-500 ml-2">Expired</span>
              )}
              {plan !== "free" && isSubscribed && (
                <span className="text-xs text-gray-400 ml-3">
                  (expires on {expiresAt})
                </span>
              )}
            </p>

            {showUpgrade && (
              <Button
                size="sm"
                className="mt-3 bg-[#0025cc] hover:bg-[#1c3eff] text-white text-xs font-medium"
                onClick={() => router.push("/pricing")}
              >
                <ArrowUpRight size={14} className="mr-1" />
                Upgrade Plan
              </Button>
            )}
          </div>
        </div>

        <div className="lg:grid hidden grid-cols-2 sm:grid-cols-3 gap-4 w-full sm:w-auto">
          <StatItem icon={<Zap size={16} />} label="Credits" value={credits} />
          <StatItem
            icon={<Search size={16} />}
            label="Searches"
            value={totalSearches}
          />
          <StatItem
            icon={<Download size={16} />}
            label="Downloads"
            value={totalImagesDownloaded}
          />
        </div>
      </div>
    </Card>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm flex items-center gap-3">
      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div className="font-semibold text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  );
}
