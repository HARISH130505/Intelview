"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  FileText,
  Code2,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Target,
  BookOpen,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { companiesAPI } from "@/lib/api";
import { cn, getDifficultyColor, formatDate } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";

const TIER_GRADIENTS: Record<string, string> = {
  FAANG: "from-amber-500 to-yellow-600",
  TIER1: "from-brand-500 to-blue-600",
  TIER2: "from-cyan-500 to-teal-600",
  STARTUP: "from-emerald-500 to-green-600",
  MNC: "from-violet-500 to-purple-600",
};

// Mock analytics data for when API not connected
function getMockAnalytics(slug: string) {
  return {
    reportCount: 312,
    offerRate: 23,
    difficultyDistribution: { EASY: 12, MEDIUM: 156, HARD: 98, VERY_HARD: 46 },
    monthlyTrend: [
      { month: "Jan 25", count: 28 }, { month: "Feb 25", count: 34 },
      { month: "Mar 25", count: 42 }, { month: "Apr 25", count: 51 },
      { month: "May 25", count: 39 }, { month: "Jun 25", count: 58 },
    ],
    topTopics: [
      { topic: "Dynamic Programming", frequency: 156 },
      { topic: "System Design", frequency: 134 },
      { topic: "Trees & Graphs", frequency: 112 },
      { topic: "Arrays & Strings", frequency: 98 },
      { topic: "Behavioral", frequency: 87 },
      { topic: "LLD/OOD", frequency: 65 },
    ],
    topQuestions: [
      { id: "1", text: "Design a distributed cache", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 47 },
      { id: "2", text: "Merge K sorted arrays", difficulty: "HARD", type: "CODING", frequency: 43 },
      { id: "3", text: "LRU Cache Implementation", difficulty: "MEDIUM", type: "CODING", frequency: 38 },
      { id: "4", text: "Find longest palindromic substring", difficulty: "MEDIUM", type: "CODING", frequency: 35 },
      { id: "5", text: "Tell me about a time you handled a conflict", difficulty: "MEDIUM", type: "BEHAVIORAL", frequency: 31 },
    ],
  };
}

const MOCK_COMPANIES: Record<string, any> = {
  google: { id: "1", name: "Google", slug: "google", tier: "FAANG", industry: "Technology", description: "Google LLC is an American multinational technology company that specializes in Internet-related services and products.", _count: { reports: 843, companyQuestions: 324 } },
  amazon: { id: "2", name: "Amazon", slug: "amazon", tier: "FAANG", industry: "E-Commerce", description: "Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, and AI.", _count: { reports: 921, companyQuestions: 412 } },
  microsoft: { id: "3", name: "Microsoft", slug: "microsoft", tier: "FAANG", industry: "Technology", description: "Microsoft Corporation is an American multinational technology corporation that produces computer software and consumer electronics.", _count: { reports: 712, companyQuestions: 298 } },
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-800/90 backdrop-blur-sm border border-white/[0.08] rounded-xl p-3 text-sm">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}

export default function CompanyDashboardPage() {
  const { slug } = useParams() as { slug: string };
  const [company, setCompany] = useState<any>(MOCK_COMPANIES[slug] || null);
  const [analytics, setAnalytics] = useState<any>(getMockAnalytics(slug));
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "reports">("overview");

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    setLoading(true);
    try {
      const [companyData, analyticsData, reportsData] = await Promise.all([
        companiesAPI.getBySlug(slug),
        companiesAPI.getAnalytics(slug),
        companiesAPI.getReports(slug),
      ]);
      if (companyData.company) setCompany(companyData.company);
      if (analyticsData.analytics) setAnalytics(analyticsData.analytics);
      if (reportsData.reports) setReports(reportsData.reports);
    } catch {
      // Keep mock data
    } finally {
      setLoading(false);
    }
  }

  if (!company && !loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Company not found</h2>
          <Link href="/companies" className="btn-brand text-sm py-2 px-4 mt-4 inline-flex">
            <ArrowLeft className="w-4 h-4" /> Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  const diffData = analytics?.difficultyDistribution
    ? Object.entries(analytics.difficultyDistribution).map(([k, v]) => ({
        name: k, value: v as number,
        fill: k === "EASY" ? "#10b981" : k === "MEDIUM" ? "#f59e0b" : k === "HARD" ? "#f43f5e" : "#8b5cf6",
      }))
    : [];

  const gradient = TIER_GRADIENTS[company?.tier] || "from-brand-500 to-violet-500";

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <div className="pt-16">
        {/* Company Header */}
        <div className="border-b border-white/[0.06] bg-dark-900/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-violet-500" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> All Companies
            </Link>

            <div className="flex items-start gap-6">
              {/* Logo */}
              <div className={cn("w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-3xl font-display shadow-xl", gradient)}>
                {company?.name?.charAt(0)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black font-display text-white">{company?.name}</h1>
                  <span className={cn("badge", company?.tier === "FAANG" ? "badge-amber" : "badge-brand")}>
                    {company?.tier}
                  </span>
                </div>
                <p className="text-slate-400 text-sm max-w-2xl">{company?.description || `Leading technology company with ${company?._count?.reports || 0} interview reports.`}</p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 mt-4">
                  {[
                    { icon: FileText, label: "Reports", value: company?._count?.reports || 0, color: "text-brand-400" },
                    { icon: Code2, label: "Questions", value: company?._count?.companyQuestions || 0, color: "text-violet-400" },
                    { icon: TrendingUp, label: "Offer Rate", value: `${analytics?.offerRate || 0}%`, color: "text-emerald-400" },
                    { icon: Target, label: "Avg Difficulty", value: "Hard", color: "text-amber-400" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", color)} />
                      <span className="text-white font-semibold text-sm">{value}</span>
                      <span className="text-slate-500 text-xs">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/[0.06] bg-dark-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-1">
              {(["overview", "questions", "reports"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-5 py-4 text-sm font-medium transition-all border-b-2 capitalize",
                    activeTab === tab
                      ? "text-brand-400 border-brand-400"
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - Charts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Monthly Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold font-display text-white">Interview Activity (Last 6 Months)</h3>
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics?.monthlyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={{ fill: "#2563eb", r: 4, strokeWidth: 2, stroke: "#0f172a" }}
                        activeDot={{ r: 6, fill: "#3b82f6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Top Questions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                  <h3 className="font-bold font-display text-white mb-4">Most Asked Questions</h3>
                  <div className="space-y-3">
                    {(analytics?.topQuestions || []).map((q: any, i: number) => (
                      <div key={q.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-dark-800/50 border border-white/[0.04] hover:border-white/[0.08] transition-all group cursor-pointer">
                        <span className="text-slate-600 text-sm font-bold w-5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{q.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("badge text-xs", getDifficultyColor(q.difficulty))}>{q.difficulty}</span>
                            <span className="text-slate-600 text-xs">{q.type?.replace("_", " ")}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-white font-semibold text-sm">{q.frequency}x</div>
                          <div className="text-slate-600 text-xs">asked</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Difficulty Distribution */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
                  <h3 className="font-bold font-display text-white mb-4">Difficulty Distribution</h3>
                  <div className="space-y-3">
                    {diffData.map((item) => {
                      const total = diffData.reduce((s, d) => s + d.value, 0);
                      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <div key={item.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{item.name}</span>
                            <span className="text-white font-medium">{item.value} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: item.fill }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Top Topics */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                  <h3 className="font-bold font-display text-white mb-4">Top Topics</h3>
                  <div className="space-y-2">
                    {(analytics?.topTopics || []).slice(0, 8).map((t: any, i: number) => (
                      <div key={t.topic} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                          <span className="text-slate-300 text-sm">{t.topic}</span>
                        </div>
                        <span className="badge badge-brand text-xs">{t.frequency}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Prep CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="gradient-border">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-500/10">
                    <h3 className="font-bold text-white mb-2">🎯 Start Preparing</h3>
                    <p className="text-slate-400 text-sm mb-4">
                      Generate a personalized study plan for {company?.name}
                    </p>
                    <Link href={`/planner?company=${slug}`} className="btn-brand text-sm py-2.5 px-4 w-full justify-center">
                      Generate Roadmap
                    </Link>
                    <Link href={`/mock-interview?company=${slug}`} className="btn-ghost text-sm py-2.5 px-4 w-full justify-center mt-2">
                      Start Mock Interview
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold font-display">Interview Reports</h3>
                <Link href="/reports/submit" className="btn-brand text-sm py-2 px-4">
                  Submit Experience
                </Link>
              </div>
              {reports.length > 0 ? (
                reports.map((report: any, i) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/reports/${report.id}`} className="glass-card-hover p-5 flex items-center gap-4 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold text-sm">{report.role}</span>
                          <span className={cn("badge text-xs", getDifficultyColor(report.difficulty))}>{report.difficulty}</span>
                          {report.offerStatus === "ACCEPTED" && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-slate-500 text-xs">{report._count?.questions || 0} questions • {report.rounds?.length || 0} rounds • {formatDate(report.createdAt)}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 glass-card">
                  <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">No reports yet for {company?.name}</p>
                  <p className="text-slate-600 text-sm mt-1">Be the first to submit an interview experience!</p>
                  <Link href="/reports/submit" className="btn-brand text-sm py-2 px-4 mt-4 inline-flex">Submit Report</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
