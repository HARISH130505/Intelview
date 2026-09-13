"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserButton,
  Show,
} from "@clerk/nextjs";
import {
  Search,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Companies", href: "/companies" },
  { label: "Questions", href: "/questions" },
  { label: "Reports", href: "/reports" },
];

interface NavbarProps {
  onOpenMobileSidebar?: () => void;
  showMobileSidebarToggle?: boolean;
}

export function Navbar({
  onOpenMobileSidebar,
  showMobileSidebarToggle = false,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-dark-950/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-full flex items-center justify-between gap-2">
        {/* Left: Mobile Sidebar Trigger + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showMobileSidebarToggle && onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display font-bold text-lg sm:text-xl text-white tracking-tight">
              Intel<span className="gradient-text">view</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links (Hidden on mobile/tablet) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-md sm:text-sm font-medium transition-all duration-150",
                  isActive
                    ? "text-white bg-white/[0.08]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Search + Auth */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/search"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-2 text-sm"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline text-xs text-slate-500 font-normal">Search...</span>
          </Link>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex btn-ghost text-xs py-1.5 px-3.5"
            >
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-2 ring-brand-500/30",
                },
              }}
            />
          </Show>

          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="btn-ghost text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-4"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="btn-brand text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4"
            >
              <span>Get Started</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
            </Link>
          </Show>

          {/* Mobile Main Menu Toggle (when not showing mobile sidebar toggle) */}
          {!showMobileSidebarToggle && (
            <button
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Main Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && !showMobileSidebarToggle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-950/95 backdrop-blur-2xl border-b border-white/[0.08] overflow-hidden"
          >
            <nav className="p-4 space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "text-white bg-brand-500/15 border border-brand-500/20"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-white/[0.08]">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-brand-400 bg-brand-500/10 border border-brand-500/20"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
