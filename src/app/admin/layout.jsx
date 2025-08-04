"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, Home, Users, Settings, Image } from "lucide-react";
import DashboardHeader from "@/components/global/DashboardHeader";
import Sidebar from "@/components/global/Sidebar";

export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Home", icon: Home, href: "/" },
  { label: "Users", icon: Users, href: "/users" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Photos", icon: Image, href: "/admin/photos" },
];

export default function Page({ children }) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0a0a1a]">
      <Sidebar navItems={navItems} />

      <main className="ml-72 relative z-10 overflow-y-auto h-screen">
        <DashboardHeader title="Photo Library" credits={42} />
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto px-4 py-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
