"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  FileText,
  Mic,
  Target,
  Bookmark,
  Map,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Play,
  ChevronRight,
} from "lucide-react";
import { profileAPI } from "@/lib/api";
import { getInitials, formatDate, cn } from "@/lib/utils";

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f43f5e";
  const label =
    score >= 85
      ? "Strong Hire"
      : score >= 75
      ? "Hire"
      : score >= 60
      ? "Lean Hire"
      : "No Hire";

  return (
    <div className="flex flex-col items-center">
      <div
        className="text-2xl font-black font-display"
        style={{ color }}
      >
        {score}
      </div>
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileAPI
      .getStats()
      .then((d) => setStats(d.stats))
      .catch(() => {
        // Fallback demo data
        setStats({
          reportsSubmitted: 3,
          bookmarks: 12,
          mockSessions: 8,
          avgMockScore: 74,
          studyPlans: [
            { title: "Google SDE-1 Preparation Roadmap", progress: 45 },
            { title: "Amazon Backend Engineer Roadmap", progress: 12 },
          ],
          recentMockSessions: [
            {
              totalScore: 82,
              status: "COMPLETED",
              createdAt: new Date().toISOString(),
            },
            {
              totalScore: 65,
              status: "COMPLETED",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              totalScore: 78,
              status: "COMPLETED",
              createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const recentSessions = stats?.recentMockSessions || [];
  const studyPlans = stats?.studyPlans || [];

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="avatar"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-brand-500/30 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold font-display flex-shrink-0">
              {getInitials(user?.fullName || "User")}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white truncate">
              {user?.fullName || "Your Profile"}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm truncate mt-0.5">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2.5">
              <span className="badge badge-brand text-[11px]">Member</span>
              <span className="text-slate-500 text-[11px]">
                Joined {formatDate(user?.createdAt || new Date())}
              </span>
            </div>
          </div>

          {/* CTA: Start Mock */}
          <Link
            href="/mock-interview"
            className="btn-brand text-xs py-2 px-4 self-center sm:self-start inline-flex items-center gap-1.5 flex-shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Mock Interview
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {[
          {
            icon: FileText,
            label: "Reports Shared",
            value: stats?.reportsSubmitted ?? "—",
            color: "text-brand-400",
            bg: "bg-brand-500/10",
            href: "/reports",
          },
          {
            icon: Bookmark,
            label: "Bookmarks",
            value: stats?.bookmarks ?? "—",
            color: "text-violet-400",
            bg: "bg-violet-500/10",
            href: "/bookmarks",
          },
          {
            icon: Mic,
            label: "Mock Sessions",
            value: stats?.mockSessions ?? "—",
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            href: "/mock-interview",
          },
          {
            icon: Target,
            label: "Avg Mock Score",
            value:
              stats?.avgMockScore && stats.avgMockScore > 0
                ? `${stats.avgMockScore}`
                : "—",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            href: "/mock-interview",
          },
        ].map(({ icon: Icon, label, value, color, bg, href }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
          >
            <Link href={href} className="glass-card p-4 sm:p-5 block group hover:border-white/[0.12] transition-all">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              {loading ? (
                <div className="h-7 bg-white/[0.08] rounded-lg w-12 animate-pulse mb-1" />
              ) : (
                <div className="text-xl sm:text-2xl font-bold font-display text-white">
                  {value}
                </div>
              )}
              <div className="text-slate-500 text-[11px] sm:text-xs mt-0.5">{label}</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Mock Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold font-display text-sm flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-400" />
              Recent Mock Sessions
            </h3>
            <Link
              href="/mock-interview"
              className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              New Session <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <Mic className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-400 text-xs">No mock sessions yet</p>
              <Link
                href="/mock-interview"
                className="text-brand-400 text-xs hover:underline mt-1 block"
              >
                Start your first interview →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentSessions.map((session: any, i: number) => {
                const score = session.totalScore ?? 0;
                const scoreColor =
                  score >= 80
                    ? "text-emerald-400"
                    : score >= 60
                    ? "text-amber-400"
                    : "text-rose-400";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.04 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold",
                          score >= 80
                            ? "bg-emerald-500/20 text-emerald-400"
                            : score >= 60
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-rose-500/20 text-rose-400"
                        )}
                      >
                        {score > 0 ? score : "—"}
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">
                          {session.status === "COMPLETED"
                            ? "Completed Session"
                            : "In Progress"}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          {formatDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {score >= 75 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          Hire
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Active Study Plans */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold font-display text-sm flex items-center gap-2">
              <Map className="w-4 h-4 text-brand-400" />
              Study Plans
            </h3>
            <Link
              href="/planner"
              className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              New Plan <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-white/[0.04] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : studyPlans.length === 0 ? (
            <div className="text-center py-8">
              <Map className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-400 text-xs">No study plans yet</p>
              <Link
                href="/planner"
                className="text-brand-400 text-xs hover:underline mt-1 block"
              >
                Generate your first roadmap →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {studyPlans.map((plan: any, i: number) => {
                const prog = plan.progress || 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    <Link
                      href="/planner"
                      className="block p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-500/20 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <p className="text-white text-xs sm:text-sm font-semibold group-hover:text-brand-300 transition-colors line-clamp-2 flex-1">
                          {plan.title}
                        </p>
                        <span className="text-brand-400 text-xs font-bold flex-shrink-0">
                          {prog}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prog}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                          className={cn(
                            "h-full rounded-full",
                            prog >= 80
                              ? "bg-emerald-500"
                              : prog >= 40
                              ? "bg-brand-500"
                              : "bg-amber-500"
                          )}
                        />
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1.5">
                        {prog === 0
                          ? "Not started yet"
                          : prog >= 100
                          ? "Completed ✓"
                          : `${prog}% complete`}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-5 sm:p-6"
      >
        <h3 className="text-white font-bold font-display text-sm flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: Mic,
              label: "AI Mock Interview",
              desc: "Simulate a real interview loop",
              href: "/mock-interview",
              color: "text-rose-400",
              bg: "bg-rose-500/10",
            },
            {
              icon: Map,
              label: "Generate Study Plan",
              desc: "Get a personalized roadmap",
              href: "/planner",
              color: "text-brand-400",
              bg: "bg-brand-500/10",
            },
            {
              icon: TrendingUp,
              label: "Explore Companies",
              desc: "Real interview intelligence",
              href: "/companies",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
              >
                <div className={cn("p-2 rounded-xl flex-shrink-0", action.bg)}>
                  <Icon className={cn("w-4 h-4", action.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold group-hover:text-brand-300 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-slate-500 text-[11px] truncate">{action.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 ml-auto flex-shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
