"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Code2,
  FileText,
  Upload,
  Map,
  Mic,
  Bookmark,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const sidebarSections = [
  {
    section: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Search, label: "Search", href: "/search" },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { icon: Building2, label: "Companies", href: "/companies" },
      { icon: Code2, label: "Questions", href: "/questions" },
      { icon: FileText, label: "Reports", href: "/reports" },
    ],
  },
  {
    section: "AI Tools",
    items: [
      { icon: Upload, label: "Resume Analyzer", href: "/resume" },
      { icon: Map, label: "Study Planner", href: "/planner" },
      { icon: Mic, label: "Mock Interview", href: "/mock-interview" },
    ],
  },
  {
    section: "Personal",
    items: [
      { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
      { icon: User, label: "Profile", href: "/profile" },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ============================================================ */}
      {/* 📱 MOBILE / TABLET DRAWER OVERLAY (< lg) */}
      {/* ============================================================ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />

            {/* Mobile Slide-in Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-dark-950/95 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
                <Link
                  href="/"
                  onClick={onCloseMobile}
                  className="flex items-center gap-2"
                >
                  <span className="font-display font-bold text-lg text-white">
                    Intel<span className="gradient-text">view</span>
                  </span>
                </Link>
                <button
                  onClick={onCloseMobile}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-5 no-scrollbar">
                {sidebarSections.map((section) => (
                  <div key={section.section}>
                    <p className="px-3 mb-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {section.section}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          pathname === item.href ||
                          (item.href !== "/" &&
                            item.href !== "/dashboard" &&
                            pathname?.startsWith(item.href));

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onCloseMobile}
                            className={cn(
                              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                              isActive
                                ? "bg-brand-500/15 text-brand-400 border border-brand-500/20 shadow-sm"
                                : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-4 h-4 flex-shrink-0",
                                isActive ? "text-brand-400" : "text-slate-400"
                              )}
                            />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Mobile Footer Info */}
              <div className="p-4 border-t border-white/[0.08] text-xs text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" /> AI Intelligence
                </span>
                <span>v1.0</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 💻 DESKTOP DOCKED SIDEBAR (≥ lg) */}
      {/* ============================================================ */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-16 bottom-0 z-30 flex-col bg-dark-950/80 backdrop-blur-xl border-r border-white/[0.06] transition-all duration-300 overflow-hidden",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Collapse toggle */}
        <div className="flex items-center justify-between p-3.5 border-b border-white/[0.06]">
          {!collapsed && (
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">
              Workspace
            </span>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={cn(
                "p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors",
                collapsed && "mx-auto"
              )}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5 no-scrollbar">
          {sidebarSections.map((section) => (
            <div key={section.section}>
              {!collapsed && (
                <p className="px-3 mb-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  {section.section}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" &&
                      item.href !== "/dashboard" &&
                      pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                        isActive
                          ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          isActive ? "text-brand-400" : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                      {isActive && !collapsed && (
                        <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
