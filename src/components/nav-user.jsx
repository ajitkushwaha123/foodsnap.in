"use client";

import React, { useEffect } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUser } from "@/store/hooks/useUser";
import { useRouter } from "next/navigation";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, loading, fetchUser, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const displayName = user?.name || `User-${user?.phone?.slice(-4) || "Guest"}`;
  const avatarFallback = displayName.charAt(0).toUpperCase();
  const plan = user?.subscription?.plan || "free";
  const credits = user?.credits ?? 0;

  const logoutUser = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {loading ? (
                <div className="flex items-center gap-2 w-full animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-gray-300" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-24 rounded bg-gray-300" />
                    <div className="h-2 w-32 rounded bg-gray-200" />
                  </div>
                  <div className="ml-auto h-4 w-4 rounded bg-gray-300" />
                </div>
              ) : (
                <>
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={
                        user?.avatar
                          ? `${process.env.NEXT_PUBLIC_BASE_URL}/${user.avatar}`
                          : ""
                      }
                      alt={displayName}
                    />
                    <AvatarFallback className="rounded-lg">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs">
                      {user?.phone || "No phone"}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {loading ? (
              <div className="p-4 space-y-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gray-300" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-24 rounded bg-gray-300" />
                    <div className="h-2 w-32 rounded bg-gray-200" />
                  </div>
                </div>
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                </div>
                <div className="h-4 w-full rounded bg-gray-200" />
              </div>
            ) : (
              <>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={
                          user?.avatar
                            ? `${process.env.NEXT_PUBLIC_BASE_URL}/${user.avatar}`
                            : ""
                        }
                        alt={displayName}
                      />
                      <AvatarFallback className="rounded-lg">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {displayName}
                      </span>
                      <span className="truncate text-xs">{user?.phone}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {plan} plan · {credits} credits
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logoutUser}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
