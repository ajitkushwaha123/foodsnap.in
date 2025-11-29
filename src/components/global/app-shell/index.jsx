"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "@/store";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import Notification from "../notification";
import StudioSidebar from "../ai-studio/StudioSidebar";
import { useSearch } from "@/store/hooks/useSearch";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const AUTH_ROUTES = ["/sign-in", "/sign-up"];
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  return (
    <Provider store={store}>
      <InnerAppShell isAuthPage={isAuthPage}>{children}</InnerAppShell>
    </Provider>
  );
}

function InnerAppShell({ isAuthPage, children }) {
  const { openStudio } = useSearch();

  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar variant="inset" />

        <SidebarInset className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <SiteHeader />
          <div className="hidden md:block">
            <Notification />
          </div>
          <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
        </SidebarInset>

        {openStudio && (
          <div className="h-full hidden md:block sticky right-0 top-0">
            <StudioSidebar />
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
