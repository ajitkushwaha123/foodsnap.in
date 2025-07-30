"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import UserSection from "../user/userButton";
import { motion } from "framer-motion";

export default function Sidebar({ navItems = [] }) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <motion.aside
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-64 h-screen fixed top-0 left-0 z-40 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-r border-zinc-200 dark:border-zinc-800 shadow-lg flex flex-col"
    >
      <div className="flex items-center justify-center px-4 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl  font-bold tracking-tight">
          FoodSnap<span className="text-green-500">.in</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform duration-200" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-4">
        {isSignedIn && <UserSection />}
      </div>
    </motion.aside>
  );
}
