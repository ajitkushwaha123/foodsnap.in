"use client";

import { useState } from "react";
import { LogOut, ArrowUpRight, CircleHelp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FaServicestack } from "react-icons/fa";
import { useUser } from "@/store/hooks/useUser";
import { toast } from "react-hot-toast";

const tabs = [
  { label: "Upgrade Plan", href: "/pricing", icon: ArrowUpRight },
  { label: "Support", href: "/support", icon: CircleHelp },
  {
    label: "Request Services",
    href: "/request-services",
    icon: FaServicestack,
  },
];

export default function Sidebar({ isMobile = false, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, loading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Logged out successfully");
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) onClose();
  };

  return (
    <>
      {isMobile && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "flex flex-col justify-between shadow-lg border-r bg-white dark:bg-gray-900 dark:border-gray-800 z-50",
          "h-screen fixed top-0 left-0 transition-transform duration-300 ease-in-out",
          isMobile ? "w-[70%] p-4 rounded-r-2xl" : "w-72 p-6 relative"
        )}
      >
        <div>
          <Link
            href="/"
            className="flex items-center gap-3 mb-6"
            onClick={handleLinkClick}
          >
            <img src="/logo.png" alt="Logo" className="w-full object-contain" />
          </Link>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-4" />

          {/* Nav */}
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg transition-all",
                    "px-4 py-3 text-base",
                    isActive
                      ? "bg-[#0025cc] text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-white" : "text-gray-500"}
                  />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              handleLogout();
              handleLinkClick();
            }}
            disabled={loading || isLoggingOut}
            aria-label="Logout"
            className="flex items-center gap-3 w-full px-4 py-3 text-base rounded-lg text-white bg-red-500 hover:bg-red-600 dark:hover:bg-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={20} />
            {loading || isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
