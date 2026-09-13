"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col text-slate-100 antialiased overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar
        showMobileSidebarToggle
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      {/* Sidebar (Desktop docked + Mobile slide-out drawer) */}
      <Sidebar
        collapsed={desktopCollapsed}
        onToggleCollapse={() => setDesktopCollapsed(!desktopCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 pt-16 min-h-screen transition-all duration-300 w-full min-w-0 overflow-x-hidden",
          // Small & Tablet: no left padding, add bottom padding for mobile BottomNav
          "pl-0 pb-24 md:pb-12",
          // Desktop: dynamic left padding matching sidebar state
          desktopCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <BottomNav />
    </div>
  );
}
