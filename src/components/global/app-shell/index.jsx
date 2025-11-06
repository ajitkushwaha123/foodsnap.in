"use client";

import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "@/store";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import { Toaster } from "react-hot-toast";

export default function AppShell({ children }) {
  const pathname = usePathname();

  const AUTH_ROUTES = ["/sign-in", "/sign-up"];
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  return (
    <Provider store={store}>
      {isAuthPage ? (
        <main className="min-h-screen w-full">{children}</main>
      ) : (
        <SidebarProvider
          style={{
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          }}
        >
          <div className="flex min-h-screen w-full">
            <AppSidebar variant="inset" />
            <SidebarInset className="flex flex-1 flex-col min-w-0">
              <SiteHeader />
              <Toaster
                position="top-center"
                reverseOrder={true}
                toastOptions={{
                  style: {
                    background: "#fff",
                    color: "#000",
                    borderRadius: "8px",
                    padding: "12px 16px",
                  },
                }}
              />
              <main className="flex-1 min-w-0">{children}</main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      )}
    </Provider>
  );
}
