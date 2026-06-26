"use client";

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
  BookOpen,
  Target,
  Star,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { icon: Building2, label: "Company Explorer", desc: "Browse company intelligence", href: "/companies", color: "text-brand-400", bg: "bg-brand-500/10" },
  { icon: Code2, label: "Question Bank", desc: "50K+ indexed questions", href: "/questions", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Upload, label: "Analyze Resume", desc: "Get ATS score instantly", href: "/resume", color: "text-amber-400", bg: "bg-amber-500/10" },
  { icon: Mic, label: "Mock Interview", desc: "AI-powered practice", href: "/mock-interview", color: "text-rose-400", bg: "bg-rose-500/10" },
  { icon: Map, label: "Study Planner", desc: "Personalized roadmap", href: "/planner", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: FileText, label: "Reports", desc: "Real interview experiences", href: "/reports", color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

const TRENDING_TOPICS = [
  { name: "Dynamic Programming", count: 1243, color: "badge-brand" },
  { name: "System Design", count: 987, color: "badge-violet" },
  { name: "Trees & Graphs", count: 876, color: "badge-emerald" },
  { name: "Arrays & Strings", count: 1456, color: "badge-amber" },
  { name: "Behavioral", count: 654, color: "badge-rose" },
  { name: "LLD/OOD", count: 432, color: "badge-brand" },
];

const RECENT_ACTIVITY = [
  { action: "New report added", company: "Google", role: "SDE-2", time: "2 hours ago" },
  { action: "10 new questions", company: "Amazon", role: "SDE-1", time: "5 hours ago" },
  { action: "New report added", company: "Microsoft", role: "Software Engineer", time: "1 day ago" },
  { action: "Company updated", company: "Flipkart", role: "Backend Engineer", time: "2 days ago" },
];

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-white">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-slate-400 mt-1">
            Your interview intelligence hub — everything you need to prepare smarter.
          </p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Companies", value: "500+", icon: Building2, color: "text-brand-400" },
          { label: "Questions", value: "50K+", icon: Code2, color: "text-violet-400" },
          { label: "Reports", value: "12K+", icon: FileText, color: "text-emerald-400" },
          { label: "Your Score", value: "—", icon: Target, color: "text-amber-400" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="text-2xl font-bold font-display text-white">{stat.value}</div>
              <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-display text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <Link
                  href={action.href}
                  className="glass-card-hover p-5 flex items-start gap-4 group"
                >
                  <div className={cn("p-2.5 rounded-xl flex-shrink-0", action.bg)}>
                    <Icon className={cn("w-5 h-5", action.color)} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm group-hover:text-brand-300 transition-colors">
                      {action.label}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 flex-shrink-0 mt-0.5 transition-all group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold font-display text-white">🔥 Trending Topics</h3>
            <TrendingUp className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-3">
            {TRENDING_TOPICS.map((topic, i) => (
              <div key={topic.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-xs w-4">{i + 1}</span>
                  <span className="text-slate-300 text-sm">{topic.name}</span>
                </div>
                <span className={cn("badge text-xs", topic.color)}>{topic.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold font-display text-white">Recent Activity</h3>
            <Link href="/reports" className="text-brand-400 text-xs hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-dark-800/50 border border-white/[0.04]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{item.action}</span>
                    <span className="badge badge-brand text-xs">{item.company}</span>
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">{item.role} • {item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Recommendation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative gradient-border p-6 overflow-hidden"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-500/10 to-violet-500/10" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <div className="flex-1">
            <div className="text-white font-bold">AI Recommendation</div>
            <p className="text-slate-400 text-sm mt-0.5">
              Based on current trends, <span className="text-white font-medium">Dynamic Programming</span> and{" "}
              <span className="text-white font-medium">System Design</span> are the most important topics for your target companies.
            </p>
          </div>
          <Link href="/planner" className="btn-brand text-sm py-2 px-4 flex-shrink-0">
            Generate Plan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
