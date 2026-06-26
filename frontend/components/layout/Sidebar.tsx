"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const sidebarItems = [
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

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-16 bottom-0 z-40 flex flex-col bg-dark-950/80 backdrop-blur-xl border-r border-white/[0.06] overflow-hidden"
    >
      {/* Logo area / collapse toggle */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-md text-white">Intelview</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6 no-scrollbar">
        {sidebarItems.map((section) => (
          <div key={section.section}>
            {!collapsed && (
              <p className="px-4 mb-1 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {section.section}
              </p>
            )}
            <div className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]",
                      collapsed && "justify-center"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-brand-400")} />
                    {!collapsed && <span>{item.label}</span>}
                    {isActive && !collapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-400"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </motion.aside>
  );
}
