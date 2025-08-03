"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import UserSection from "../user/userButton";

export default function Sidebar({ navItems = [] }) {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <aside
      className="w-72 h-screen fixed top-0 left-0 z-100
     border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#10101a] shadow-lg dark:shadow-black/20 transition-colors flex flex-col"
    >
      <div className="flex items-center justify-center px-4 py-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white">
          FoodSnap<span className="text-green-500">.in</span>
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 font-medium",
                isActive
                  ? "bg-green-100 text-green-600 dark:bg-green-600 dark:text-green-200 shadow-sm"
                  : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-200 dark:border-zinc-800 px-4 py-5">
        {isSignedIn && <UserSection />}
      </div>
    </aside>
  );
}
