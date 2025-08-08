"use client";

import {
  LogOut,
  ArrowUpRight,
  BadgeQuestionMark,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FaServicestack } from "react-icons/fa";
import { useUser } from "@/store/hooks/useUser";

const tabs = [
  {
    label: "Upgrade Plan",
    href: "/pricing",
    icon: ArrowUpRight,
  },
  {
    label: "Support",
    href: "/support",
    icon: BadgeQuestionMark,
  },
  {
    label: "Request Services",
    href: "/request-services",
    icon: FaServicestack,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, loading } = useUser();

  return (
    <aside className="h-screen w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 p-6 flex flex-col justify-between shadow-sm">
      <div>
        <Link href="/" className="flex items-center gap-2 mb-6">
          <img src="/logo.png" alt="Logo" />
        </Link>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-4" />

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center h-10 gap-3 px-4 py-2 text-sm rounded-md transition-all",
                  isActive
                    ? "bg-[#0025cc] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-gray-500"}
                />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={logout}
        disabled={loading}
        className="flex h-10 items-center gap-3 px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 dark:hover:bg-red-800 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
