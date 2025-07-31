"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../Sidebar";
import { motion } from "framer-motion";
import { LayoutDashboard, Home, Users, Settings } from "lucide-react";
import DashboardHeader from "../DashboardHeader";

export default function AppShell({ children }) {
  const pathname = usePathname();

  const isSidebarVisible = ![
    "/sign-in",
    "/sign-up",
    "/library",
    "/admin",
    "/pricing",
  ].some((path) => pathname.startsWith(path));

  const isHeaderVisible = ![
    "/sign-in",
    "/sign-up",
    "/library",
    "/admin",
    "/pricing",
  ].some((path) => pathname.startsWith(path));

  const pageTitle = getPageTitle(pathname);
  const dummyCredits = 120;

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0a0a1a] transition-colors duration-300 ease-in-out">
      {isSidebarVisible && <Sidebar navItems={navItems} />}

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`flex-1 ${isSidebarVisible ? "ml-64" : ""}`}
      >
        {isHeaderVisible && (
          <DashboardHeader title={pageTitle} credits={dummyCredits} />
        )}
        {children}
      </motion.main>
    </div>
  );
}

function getPageTitle(pathname) {
  const nav = navItems.find((item) => pathname.startsWith(item.href));
  return nav?.label || "Dashboard";
}

export const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Users", icon: Users, href: "/users" },
  { label: "Settings", icon: Settings, href: "/settings" },
];
