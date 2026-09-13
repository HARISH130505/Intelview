"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Code2,
  Sparkles,
  User,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Questions", href: "/questions", icon: Code2 },
  { label: "AI Tools", href: "/planner", icon: Sparkles },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/90 backdrop-blur-xl border-t border-white/[0.08] px-2 py-1.5 safe-area-bottom">
      <nav className="flex items-center justify-around">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === "/planner" &&
              (pathname.startsWith("/resume") ||
                pathname.startsWith("/mock-interview") ||
                pathname.startsWith("/planner"))) ||
            (item.href !== "/" &&
              item.href !== "/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all duration-150 relative min-w-[56px]",
                isActive
                  ? "text-brand-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-brand-400 -translate-y-1.5" />
              )}
              <Icon className={cn("w-5 h-5 mb-0.5 transition-transform", isActive && "scale-110 text-brand-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
