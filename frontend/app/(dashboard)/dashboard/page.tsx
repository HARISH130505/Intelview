"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Code2,
  FileText,
  TrendingUp,
  ArrowRight,
  Mic,
  Upload,
  Map,
  Target,
  Users,
  Loader2,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { analyticsAPI } from "@/lib/api";

const QUICK_ACTIONS = [
  { icon: Building2, label: "Company Explorer", desc: "Browse real tech companies", href: "/companies", color: "text-brand-400", bg: "bg-brand-500/10" },
  { icon: Code2, label: "Question Bank", desc: "Real interview questions", href: "/questions", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Upload, label: "Resume Analyzer", desc: "Instant ATS score & skill gap", href: "/resume", color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: Map, label: "Study Planner", desc: "Personalized AI roadmap", href: "/planner", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Mic, label: "Mock Interview", desc: "Simulated technical interview", href: "/mock-interview", color: "text-rose-400", bg: "bg-rose-500/10" },
  { icon: FileText, label: "Interview Reports", desc: "Community experiences", href: "/reports", color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

const TOPIC_BADGE_COLORS = [
  "badge-brand", "badge-violet", "badge-emerald", "badge-amber", "badge-rose", "badge-brand"
];

const DEFAULT_TOPICS = [
  { name: "Dynamic Programming", count: "30+" },
  { name: "System Design", count: "25+" },
  { name: "Trees & Graphs", count: "20+" },
  { name: "Arrays & Strings", count: "40+" },
  { name: "Behavioral & STAR", count: "15+" },
  { name: "Low Level Design", count: "10+" },
];

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  const [stats, setStats] = useState<{
    totalCompanies: number;
    totalQuestions: number;
    totalReports: number;
    totalUsers: number;
  }>({
    totalCompanies: 27,
    totalQuestions: 59,
    totalReports: 0,
    totalUsers: 1,
  });
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<{ name: string; count: string | number }[]>(DEFAULT_TOPICS);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [overviewRes, trendingRes] = await Promise.all([
          analyticsAPI.getOverview().catch(() => null),
          analyticsAPI.getTrending().catch(() => null),
        ]);

        if (overviewRes?.stats) {
          setStats(overviewRes.stats);
        }

        if (trendingRes?.data?.topTopics?.length > 0) {
          setTopics(
            trendingRes.data.topTopics.slice(0, 6).map((t: any) => ({
              name: t.name,
              count: t._count?.questionTopics || 0,
            }))
          );
        }

        if (trendingRes?.data?.topCompanies?.length > 0) {
          setTopCompanies(trendingRes.data.topCompanies);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1.5"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
          Everything you need to master your next technical interview in one place.
        </p>
      </motion.div>

      {/* Stats Cards Row (2 col on mobile, 4 col on desktop) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {[
          { label: "Companies", value: `${stats.totalCompanies}`, icon: Building2, color: "text-brand-400" },
          { label: "Questions", value: `${stats.totalQuestions}`, icon: Code2, color: "text-violet-400" },
          { label: "Reports", value: `${stats.totalReports}`, icon: FileText, color: "text-emerald-400" },
          { label: "Members", value: `${stats.totalUsers}`, icon: Users, color: "text-amber-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.color)} />
              </div>
              {loading ? (
                <div className="h-7 sm:h-8 bg-white/[0.08] rounded-lg w-16 animate-pulse my-1" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold font-display text-white">{stat.value}</div>
              )}
              <div className="text-slate-500 text-[11px] sm:text-xs mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Quick Actions (1 col on mobile, 2 col on tablet, 3 col on desktop) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <h2 className="text-base sm:text-lg font-bold font-display text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
              >
                <Link
                  href={action.href}
                  className="glass-card-hover p-4 sm:p-5 flex items-center gap-3.5 group h-full block"
                >
                  <div className={cn("p-2.5 rounded-xl flex-shrink-0", action.bg)}>
                    <Icon className={cn("w-5 h-5", action.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm sm:text-base group-hover:text-brand-300 transition-colors">
                      {action.label}
                    </div>
                    <div className="text-slate-500 text-xs truncate mt-0.5">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 flex-shrink-0 transition-all group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom Grid (1 col on mobile/tablet, 2 col on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Trending Topics — live from DB via /api/analytics/trending */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold font-display text-white text-sm sm:text-base">🔥 Top Interview Topics</h3>
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          <div className="space-y-2.5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-7 bg-white/[0.04] rounded-lg animate-pulse" />
              ))
            ) : (
              topics.map((topic, i) => (
                <div key={topic.name} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-slate-600 text-xs w-4">{i + 1}</span>
                    <span className="text-slate-300 truncate">{topic.name}</span>
                  </div>
                  <span className={cn("badge text-[11px] flex-shrink-0", TOPIC_BADGE_COLORS[i % TOPIC_BADGE_COLORS.length])}>
                    {topic.count} questions
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Live Top Companies from DB */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold font-display text-white text-sm sm:text-base">🏢 Tracked Tech Companies</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-2.5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/[0.04] rounded-xl animate-pulse" />
              ))
            ) : topCompanies.length > 0 ? (
              topCompanies.slice(0, 5).map((comp: any, i: number) => (
                <Link
                  key={comp.id || i}
                  href={`/companies/${comp.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-dark-800/40 border border-white/[0.04] hover:border-brand-500/20 transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-white text-xs sm:text-sm font-medium group-hover:text-brand-300 transition-colors">
                      {comp.name}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{comp.industry || "Technology"} • {comp.tier}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors flex-shrink-0" />
                </Link>
              ))
            ) : (
              <div className="space-y-2">
                {[
                  { name: "Google", desc: "Technology • FAANG", slug: "google" },
                  { name: "Amazon", desc: "E-Commerce & Cloud • FAANG", slug: "amazon" },
                  { name: "Microsoft", desc: "Technology • FAANG", slug: "microsoft" },
                  { name: "Meta", desc: "Social Media • FAANG", slug: "meta" },
                ].map((c) => (
                  <Link
                    key={c.slug}
                    href={`/companies/${c.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-dark-800/40 border border-white/[0.04] hover:border-brand-500/20 transition-all group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-white text-xs sm:text-sm font-medium group-hover:text-brand-300 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{c.desc}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
