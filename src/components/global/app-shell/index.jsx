"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "react-hot-toast";
import Sidebar from "../sidebar";
import DashboardHeader from "../dashboard-header";

const excludedSidebarPaths = [
  "/sign-in",
  "/sign-up",
  "/library",
  "/admin",
  "/pricing",
  "/payment",
];

const excludedHeaderPaths = [
  "/sign-in",
  "/sign-up",
  "/library",
  "/admin",
  "/pricing",
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const isSidebarVisible = !excludedSidebarPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isHeaderVisible = !excludedHeaderPaths.some((path) =>
    pathname.startsWith(path)
  );

  return (
    <Provider store={store}>
      <div className="flex bg-white dark:bg-[#0a0a1a] text-black dark:text-white min-h-screen h-screen">
   
        {isSidebarVisible && !isMobile && (
          <div className="fixed top-0 left-0 h-full z-40">
            <Sidebar onLinkClick={closeSidebar} />
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
              role="dialog"
              aria-modal="true"
            >
              <button
                className="absolute inset-0"
                onClick={closeSidebar}
                aria-label="Close sidebar"
              />
              <Sidebar onLinkClick={closeSidebar} />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
            isSidebarVisible && !isMobile ? "ml-72" : "ml-0"
          }`}
        >
          <Toaster position="top-right" />

          {isHeaderVisible && (
            <DashboardHeader onMenuToggle={toggleSidebar} isMobile={isMobile} />
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
