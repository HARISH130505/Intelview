import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty?.toUpperCase()) {
    case "EASY": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "MEDIUM": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "HARD": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    case "VERY_HARD": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
}

export function getTierColor(tier: string): string {
  switch (tier?.toUpperCase()) {
    case "FAANG": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "TIER1": return "text-brand-400 bg-brand-500/10 border-brand-500/30";
    case "TIER2": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    case "STARTUP": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    case "MNC": return "text-violet-400 bg-violet-500/10 border-violet-500/30";
    default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  }
}

export function getOfferStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case "ACCEPTED": return "text-emerald-400 bg-emerald-500/10";
    case "REJECTED": return "text-rose-400 bg-rose-500/10";
    case "PENDING": return "text-amber-400 bg-amber-500/10";
    default: return "text-slate-400 bg-slate-500/10";
  }
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function truncate(str: string, length = 100): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
