"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Provider } from "react-redux";
import { store } from "@/store";
import Sidebar from "../Sidebar";
import DashboardHeader from "../DashboardHeader";
import { Toaster } from "react-hot-toast";
import { Home, Users, Settings, Heart } from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Users", icon: Users, href: "/users" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Wishlist", icon: Heart, href: "/wishlist" },
];

function getPageTitle(pathname) {
  const nav = navItems.find((item) =>
    pathname === "/" ? item.href === "/" : pathname.startsWith(item.href)
  );
  return nav?.label || "Dashboard";
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const isSidebarVisible = ![
    "/sign-in",
    "/sign-up",
    "/library",
    "/admin",
    "/pricing",
    "/payment",
  ].some((path) => pathname.startsWith(path));

  const isHeaderVisible =
    !["/sign-in", "/sign-up", "/library", "/admin", "/pricing"].some((path) =>
      pathname.startsWith(path)
    ) && !isMobile;

  const pageTitle = getPageTitle(pathname);
  const dummyCredits = 120;

  return (
    <Provider store={store}>
      <div className="flex bg-white dark:bg-[#0a0a1a] text-black dark:text-white min-h-screen h-screen">
        {isSidebarVisible && !isMobile && (
          <div className="fixed top-0 left-0 h-full z-40">
            <Sidebar navItems={navItems} />
          </div>
        )}

        <AnimatePresence>
          {isSidebarVisible && isMobile && isSidebarOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex"
            >
              <div
                className="absolute inset-0 bg-black/30"
                onClick={toggleSidebar}
              />
              <Sidebar navItems={navItems} />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`flex-1 ml-0 ${
            isSidebarVisible && !isMobile ? "ml-[250px]" : ""
          } flex flex-col h-screen overflow-hidden`}
        >
          <Toaster position="top-right" />
          {isHeaderVisible && (
            <DashboardHeader
              title={pageTitle}
              credits={dummyCredits}
              toggleSidebar={toggleSidebar}
            />
          )}
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 overflow-y-auto"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </Provider>
  );
}
