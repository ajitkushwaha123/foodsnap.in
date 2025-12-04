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
import AiStudio from "../ai-studio";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const AUTH_ROUTES = ["/sign-in", "/sign-up"];
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    const handleContext = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContext);
    return () => document.removeEventListener("contextmenu", handleContext);
  }, []);

  useEffect(() => {
    const preventDrag = (e) => {
      if (e.target.tagName === "IMG") e.preventDefault();
    };

    document.addEventListener("dragstart", preventDrag);
    return () => document.removeEventListener("dragstart", preventDrag);
  }, []);

  useEffect(() => {
    const blockLongPress = (e) => {
      if (e.target.tagName === "IMG") e.preventDefault();
    };

    document.addEventListener("touchstart", blockLongPress, { passive: false });
    document.addEventListener("touchend", blockLongPress, { passive: false });

    return () => {
      document.removeEventListener("touchstart", blockLongPress);
      document.removeEventListener("touchend", blockLongPress);
    };
  }, []);

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

        {/* {openStudio && (

          <div className="h-full hidden md:block sticky right-0 top-0">
            <AiStudio />

          <div className="h-full hidden sticky right-0 top-0">
            <StudioSidebar />
          </div>
        )} */}
      </div>
    </SidebarProvider>
  );
}
