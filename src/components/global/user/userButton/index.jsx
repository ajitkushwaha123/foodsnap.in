import { UserButton, useUser } from "@clerk/nextjs";
import { useRef } from "react";

export default function UserSection() {
  const { user, isSignedIn } = useUser();
  const userBtnRef = useRef(null);

  const triggerUserDropdown = () => {
    const btn = userBtnRef.current?.querySelector("button");
    btn?.click();
  };

  if (!isSignedIn) return null;

  return (
    <div className="px-4 py-2 border-zinc-200 dark:border-zinc-800 rounded-md">
      <div className="flex items-center gap-3">
        <div
          ref={userBtnRef}
          className="transition-transform duration-150 hover:scale-105 active:scale-100"
        >
          <UserButton />
        </div>

        <div
          onClick={triggerUserDropdown}
          className="flex flex-col cursor-pointer group"
        >
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100 group-hover:underline">
            {user.fullName || "Your Account"}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[160px]">
            {user.primaryEmailAddress?.emailAddress || "No email"}
          </span>
        </div>
      </div>
    </div>
  );
}
