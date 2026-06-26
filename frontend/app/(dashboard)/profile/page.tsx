"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { User, Code2, FileText, Mic, Target, Bookmark, TrendingUp, Star, Calendar } from "lucide-react";
import { profileAPI } from "@/lib/api";
import { cn, getInitials, formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useUser();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    profileAPI.getStats().then(d => setStats(d.stats)).catch(() => {
      setStats({
        reportsSubmitted: 3,
        bookmarks: 12,
        mockSessions: 8,
        avgMockScore: 74,
        studyPlans: [{ title: "Google SWE Plan", progress: 45 }],
        recentMockSessions: [
          { totalScore: 78, status: "COMPLETED", createdAt: new Date().toISOString() },
          { totalScore: 65, status: "COMPLETED", createdAt: new Date(Date.now() - 86400000).toISOString() },
        ],
      });
    });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <div className="flex items-start gap-6">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="avatar" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500/30" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold font-display">
              {getInitials(user?.fullName || "User")}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display text-white">{user?.fullName || "Your Name"}</h1>
            <p className="text-slate-400 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="badge badge-brand">Member</span>
              <span className="text-slate-500 text-xs">Joined {formatDate(user?.createdAt || new Date())}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: "Reports Submitted", value: stats?.reportsSubmitted || 0, color: "text-brand-400" },
          { icon: Bookmark, label: "Bookmarks", value: stats?.bookmarks || 0, color: "text-violet-400" },
          { icon: Mic, label: "Mock Sessions", value: stats?.mockSessions || 0, color: "text-rose-400" },
          { icon: Target, label: "Avg Mock Score", value: stats?.avgMockScore ? `${stats.avgMockScore}%` : "—", color: "text-emerald-400" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <Icon className={cn("w-5 h-5 mb-3", color)} />
            <div className="text-2xl font-bold font-display text-white">{value}</div>
            <div className="text-slate-500 text-xs mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Study Plans Progress */}
      {stats?.studyPlans?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-white font-bold font-display mb-4">Active Study Plans</h3>
          <div className="space-y-4">
            {stats.studyPlans.map((plan: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300 text-sm">{plan.title}</span>
                  <span className="text-white font-semibold text-sm">{plan.progress}%</span>
                </div>
                <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${plan.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Mock Sessions */}
      {stats?.recentMockSessions?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <h3 className="text-white font-bold font-display mb-4">Recent Mock Interviews</h3>
          <div className="space-y-3">
            {stats.recentMockSessions.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-dark-800/50 border border-white/[0.04]">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm", s.totalScore >= 70 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                  {s.totalScore || "—"}
                </div>
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">Mock Interview</span>
                  <p className="text-slate-500 text-xs">{formatDate(s.createdAt)}</p>
                </div>
                <span className={cn("badge text-xs", s.status === "COMPLETED" ? "badge-emerald" : "badge-amber")}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
