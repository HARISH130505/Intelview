"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  UserButton,
  Show,
} from "@clerk/nextjs";
import {
  Search,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Companies", href: "/companies" },
  { label: "Questions", href: "/questions" },
  { label: "Reports", href: "/reports" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 h-16"
    >
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xl border-b border-white/[0.06]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display font-bold text-xl text-white">
            Intel<span className="gradient-text">view</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                (link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href))
                  ? "text-white bg-white/[0.08]"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
          >
            <Search className="w-4 h-4" />
          </Link>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="hidden sm:flex btn-ghost text-sm py-2 px-4"
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
            <Link href="/sign-in" className="btn-ghost text-sm py-2 px-4">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-brand text-sm py-2 px-4">
              Get Started <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Show>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-16 left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-b border-white/[0.06] p-4 md:hidden"
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  (link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href))
                    ? "text-white bg-brand-500/15 border border-brand-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
