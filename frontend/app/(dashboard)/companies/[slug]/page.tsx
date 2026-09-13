"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  FileText,
  Code2,
  TrendingUp,
  Target,
  CheckCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Clock,
  Layers,
  DollarSign,
  Lightbulb,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Calendar,
  AlertCircle,
  HelpCircle,
  Briefcase,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { companiesAPI, researchAPI } from "@/lib/api";
import { cn, getDifficultyColor, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const TIER_GRADIENTS: Record<string, string> = {
  FAANG: "from-amber-500 to-yellow-600",
  TIER1: "from-brand-500 to-blue-600",
  TIER2: "from-cyan-500 to-teal-600",
  STARTUP: "from-emerald-500 to-green-600",
  MNC: "from-violet-500 to-purple-600",
};

const AVAILABLE_ROLES = [
  "SDE-1",
  "SDE-2",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
];

// Mock analytics data for fallback
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

function getDaysAgo(dateStr?: string | Date): string {
  if (!dateStr) return "recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-800/95 backdrop-blur-sm border border-white/[0.08] rounded-xl p-3 text-xs sm:text-sm">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold">{payload[0].value} interviews</p>
      </div>
    );
  }
  return null;
}

type TabType = "intelligence" | "overview" | "questions" | "reports";

export default function CompanyDashboardPage() {
  const { slug } = useParams() as { slug: string };
  const [company, setCompany] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("intelligence");

  // Research Intelligence State
  const [selectedRole, setSelectedRole] = useState<string>("SDE-1");
  const [research, setResearch] = useState<any>(null);
  const [researchMeta, setResearchMeta] = useState<{
    fromCache: boolean;
    researchedAt?: string;
    expiresAt?: string;
  } | null>(null);
  const [researchLoading, setResearchLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchResearch(roleToFetch: string, forceRefresh = false) {
    if (forceRefresh) setRefreshing(true);
    else setResearchLoading(true);

    try {
      const data = await researchAPI.getCompanyIntelligence(slug, roleToFetch, forceRefresh);
      if (data?.research) {
        setResearch(data.research);
        setResearchMeta({
          fromCache: data.fromCache,
          researchedAt: data.researchedAt,
          expiresAt: data.expiresAt,
        });
        if (forceRefresh) {
          toast.success(`Intelligence for ${roleToFetch} refreshed via Gemini + Google Search!`);
        }
      }
    } catch (err) {
      console.warn("Could not load research intelligence:", err);
      if (forceRefresh) {
        toast.error("Failed to refresh live intelligence. Please try again.");
      }
    } finally {
      setResearchLoading(false);
      setRefreshing(false);
    }
  }

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
      // Fall back to mock data on error
      setCompany((prev: any) => prev || MOCK_COMPANIES[slug] || null);
      setAnalytics((prev: any) => prev || getMockAnalytics(slug));
    } finally {
      setLoading(false);
    }

    // Trigger research intelligence fetch
    fetchResearch(selectedRole, false);
  }

  function handleRoleChange(newRole: string) {
    setSelectedRole(newRole);
    fetchResearch(newRole, false);
  }

  function handleRefresh() {
    fetchResearch(selectedRole, true);
  }

  // Full-page skeleton while initial company info is loading
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-28 bg-white/[0.06] rounded" />

        {/* Header card skeleton */}
        <div className="glass-card p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.08] flex-shrink-0" />
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-3">
                <div className="h-7 w-40 bg-white/[0.08] rounded-lg" />
                <div className="h-5 w-16 bg-white/[0.05] rounded-full" />
              </div>
              <div className="h-3 w-full bg-white/[0.05] rounded" />
              <div className="h-3 w-2/3 bg-white/[0.04] rounded" />
              <div className="flex gap-6 pt-3 border-t border-white/[0.05]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white/[0.06]" />
                    <div className="h-4 w-16 bg-white/[0.06] rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2 border-b border-white/[0.06] pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 bg-white/[0.05] rounded" />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-4 sm:p-6">
              <div className="h-4 w-52 bg-white/[0.08] rounded mb-6" />
              <div className="h-[190px] bg-white/[0.03] rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-card p-4 sm:p-6">
              <div className="h-4 w-44 bg-white/[0.08] rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 bg-white/[0.04] rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20 glass-card">
        <Building2 className="w-14 h-14 text-slate-700 mx-auto mb-3" />
        <h2 className="text-white font-bold text-lg mb-2">Company not found</h2>
        <Link href="/companies" className="btn-brand text-sm py-2 px-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </Link>
      </div>
    );
  }

  const diffData = analytics?.difficultyDistribution
    ? Object.entries(analytics.difficultyDistribution).map(([k, v]) => ({
        name: k,
        value: v as number,
        fill: k === "EASY" ? "#10b981" : k === "MEDIUM" ? "#f59e0b" : k === "HARD" ? "#f43f5e" : "#8b5cf6",
      }))
    : [];

  const gradient = TIER_GRADIENTS[company?.tier] || "from-brand-500 to-violet-500";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs sm:text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Companies
        </Link>
      </div>

      {/* Company Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-6 lg:p-8 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Logo */}
          <div
            className={cn(
              "w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-2xl sm:text-3xl font-display shadow-xl flex-shrink-0",
              gradient
            )}
          >
            {company?.name?.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                {company?.name}
              </h1>
              <span className={cn("badge text-xs", company?.tier === "FAANG" ? "badge-amber" : "badge-brand")}>
                {company?.tier}
              </span>
              <span className="badge badge-purple text-xs">
                {company?.industry || "Technology"}
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {company?.description || `Leading technology company with ${company?._count?.reports || 0} interview reports.`}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6 mt-4 pt-4 border-t border-white/[0.06]">
              {[
                { icon: FileText, label: "Reports", value: company?._count?.reports || analytics?.reportCount || 0, color: "text-brand-400" },
                { icon: Code2, label: "Questions", value: company?._count?.companyQuestions || analytics?.topQuestions?.length || 0, color: "text-violet-400" },
                { icon: TrendingUp, label: "Offer Rate", value: research?.offerRate || `${analytics?.offerRate || 0}%`, color: "text-emerald-400" },
                { icon: Target, label: "Difficulty", value: research?.difficulty || "Hard", color: "text-amber-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
                  <div>
                    <span className="text-white font-semibold text-xs sm:text-sm">{value}</span>
                    <span className="text-slate-500 text-[11px] ml-1">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06] overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {[
            { id: "intelligence", label: "🧠 Interview Intelligence" },
            { id: "questions", label: "💻 Question Bank" },
            { id: "overview", label: "📊 Analytics & Trends" },
            { id: "reports", label: `📝 Community Reports (${reports.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "px-4 py-2.5 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap",
                activeTab === tab.id
                  ? "text-brand-400 border-brand-400 font-semibold"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: INTERVIEW INTELLIGENCE (END-TO-END GEMINI RESEARCH) */}
      {/* ============================================================ */}
      {activeTab === "intelligence" && (
        <div className="space-y-6">
          {/* Role Selector & Control Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-brand-500/20 bg-gradient-to-r from-brand-500/5 via-violet-500/5 to-transparent"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Target Role
                </label>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={researchLoading || refreshing}
                    className="bg-dark-800 border border-white/[0.12] rounded-xl px-3.5 py-2 pr-8 text-xs sm:text-sm text-white font-medium focus:border-brand-400 focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {AVAILABLE_ROLES.map((role) => (
                      <option key={role} value={role} className="bg-dark-900 text-white">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Research Cache / Live Freshness Badge */}
              <div className="sm:mt-5 flex items-center gap-2">
                {researchMeta?.fromCache ? (
                  <span className="badge badge-brand text-xs flex items-center gap-1.5 py-1 px-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ✓ Updated {getDaysAgo(researchMeta.researchedAt)} • 30-Day DB Cache
                  </span>
                ) : (
                  <span className="badge text-xs flex items-center gap-1.5 py-1 px-2.5 bg-violet-500/10 text-violet-300 border-violet-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Live Gemini 2.5 Flash + Google Grounding
                  </span>
                )}
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing || researchLoading}
                className="btn-ghost text-xs sm:text-sm py-2 px-3.5 flex items-center gap-2 hover:border-brand-500/40 transition-all disabled:opacity-50"
                title="Bypass 30-day cache and fetch live from Google Search Grounding"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin text-brand-400")} />
                <span>{refreshing ? "Updating interview intelligence..." : "Refresh Research"}</span>
              </button>
            </div>
          </motion.div>

          {/* Shimmer Skeleton when Research is Loading */}
          {researchLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="glass-card p-4 h-24 bg-white/[0.03]" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card p-6 h-48 bg-white/[0.03]" />
                  <div className="glass-card p-6 h-64 bg-white/[0.03]" />
                </div>
                <div className="space-y-6">
                  <div className="glass-card p-6 h-48 bg-white/[0.03]" />
                  <div className="glass-card p-6 h-48 bg-white/[0.03]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. 🎯 Interview Overview Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  {
                    icon: Target,
                    label: "Overall Difficulty",
                    value: research?.difficulty || "HARD",
                    badgeClass: getDifficultyColor(research?.difficulty || "HARD"),
                  },
                  {
                    icon: Layers,
                    label: "Typical Process",
                    value: `${research?.interviewRounds?.length || 4} Rounds`,
                    subtext: "OA + Tech + System + Behavioral",
                  },
                  {
                    icon: Clock,
                    label: "Interview Timeline",
                    value: research?.timeline || "3–5 Weeks",
                    subtext: "Application to final offer",
                  },
                  {
                    icon: TrendingUp,
                    label: "Offer Rate",
                    value: research?.offerRate || "~5–8%",
                    subtext: "From OA to offer letter",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-medium">{item.label}</span>
                        <Icon className="w-4 h-4 text-brand-400" />
                      </div>
                      <div>
                        {item.badgeClass ? (
                          <span className={cn("badge text-xs font-bold", item.badgeClass)}>
                            {item.value}
                          </span>
                        ) : (
                          <div className="text-white font-bold text-base sm:text-lg">{item.value}</div>
                        )}
                        {item.subtext && (
                          <div className="text-slate-500 text-[11px] mt-1 truncate">{item.subtext}</div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Main Content Grid: 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2/3): OA + Rounds + Questions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 2. 📝 Online Assessment (OA) Pattern */}
                  {research?.oaFormat && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-5 sm:p-6 border-l-4 border-l-brand-500"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-5 h-5 text-brand-400" />
                          <h3 className="font-bold font-display text-white text-base">
                            Online Assessment (OA) Format
                          </h3>
                        </div>
                        <span className="badge badge-brand text-xs font-semibold">
                          Platform: {research.oaFormat.platform || "HackerRank"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
                        <div className="bg-dark-800/60 p-3 rounded-xl border border-white/[0.04]">
                          <span className="text-slate-400 block mb-1">Duration</span>
                          <span className="text-white font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand-400" />
                            {research.oaFormat.duration || "90 minutes"}
                          </span>
                        </div>
                        <div className="bg-dark-800/60 p-3 rounded-xl border border-white/[0.04]">
                          <span className="text-slate-400 block mb-1">Structure</span>
                          <span className="text-white font-semibold">
                            {research.oaFormat.questionTypes?.join(" • ") || "2 DSA Coding Problems"}
                          </span>
                        </div>
                      </div>

                      {research.oaFormat.tips?.length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                            OA Key Advice
                          </span>
                          {research.oaFormat.tips.map((tip: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 3. 🔄 Interview Rounds (Round-by-Round Breakdown) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-5 sm:p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-violet-400" />
                        <h3 className="font-bold font-display text-white text-base">
                          Round-by-Round Breakdown ({selectedRole})
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500">
                        {research?.interviewRounds?.length || 0} Stages
                      </span>
                    </div>

                    <div className="space-y-4 relative">
                      {research?.interviewRounds && research.interviewRounds.length > 0 ? (
                        research.interviewRounds.map((rnd: any, i: number) => (
                          <div
                            key={rnd.roundNumber || i}
                            className="p-4 rounded-xl bg-dark-800/50 border border-white/[0.05] hover:border-white/[0.1] transition-all relative"
                          >
                            <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {rnd.roundNumber || i + 1}
                                </div>
                                <h4 className="text-white font-semibold text-sm">
                                  Round {rnd.roundNumber || i + 1}: {rnd.type?.replace(/_/g, " ")}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                {rnd.duration && (
                                  <span className="badge text-[11px] text-slate-400 bg-white/[0.03]">
                                    <Clock className="w-3 h-3 mr-1 inline" />
                                    {rnd.duration}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-3 pl-8">
                              {rnd.description}
                            </p>

                            {rnd.tips && rnd.tips.length > 0 && (
                              <div className="pl-8 pt-2 border-t border-white/[0.04] space-y-1">
                                {rnd.tips.map((tip: string, tIdx: number) => (
                                  <div key={tIdx} className="text-xs text-brand-300/90 flex items-center gap-1.5">
                                    <Lightbulb className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                    <span>{tip}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 text-xs py-4 text-center">
                          Standard 4 rounds: 1 OA + 2 Coding/Architecture + 1 Behavioral/Hiring Manager.
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* 4. 🔥 Frequently Asked Questions (from Gemini Live Research) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass-card p-5 sm:p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-amber-400" />
                        <h3 className="font-bold font-display text-white text-base">
                          Recently Discovered Interview Problems
                        </h3>
                      </div>
                      <Link
                        href={`/questions?company=${slug}`}
                        className="text-xs text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
                      >
                        View in Bank <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="space-y-2.5">
                      {research?.recentQuestions && research.recentQuestions.length > 0 ? (
                        research.recentQuestions.map((q: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-white/[0.04] hover:border-white/[0.08] transition-all"
                          >
                            <span className="text-slate-500 text-xs font-bold w-4 text-center">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs sm:text-sm font-medium line-clamp-1">{q.text}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={cn("badge text-[10px]", getDifficultyColor(q.difficulty))}>
                                  {q.difficulty}
                                </span>
                                <span className="text-slate-500 text-[10px]">{q.type?.replace(/_/g, " ")}</span>
                                {q.source && (
                                  <span className="text-slate-500 text-[10px] truncate">
                                    • {q.source}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        analytics?.topQuestions?.map((q: any, i: number) => (
                          <div
                            key={q.id || i}
                            className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 border border-white/[0.04]"
                          >
                            <span className="text-slate-500 text-xs font-bold w-4 text-center">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs sm:text-sm font-medium truncate">{q.text}</p>
                              <span className={cn("badge text-[10px] mt-1 inline-block", getDifficultyColor(q.difficulty))}>
                                {q.difficulty}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Right Column (1/3): Salary + Insider Tips + Sources + Action */}
                <div className="space-y-6">
                  {/* 5. 💰 Salary & Offer Insights */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-bold font-display text-white text-base">
                        Compensation & Insights
                      </h3>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
                      <span className="text-emerald-400 text-xs font-bold block mb-1">
                        Estimated Package
                      </span>
                      <p className="text-white font-semibold text-xs sm:text-sm leading-relaxed">
                        {research?.salaryInsights || "Compensation varies significantly by tier and level. Check Glassdoor for recent bands."}
                      </p>
                    </div>
                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="flex justify-between py-1 border-b border-white/[0.04]">
                        <span>Offer Probability</span>
                        <span className="text-white font-medium">{research?.offerRate || "~5-8%"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/[0.04]">
                        <span>Hiring Pace</span>
                        <span className="text-white font-medium">{research?.timeline || "3-5 Weeks"}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* 6. 💡 Insider Tips */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass-card p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold font-display text-white text-base">
                        Insider Tips ({selectedRole})
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {research?.insiderTips && research.insiderTips.length > 0 ? (
                        research.insiderTips.map((tip: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                            <span>{tip}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400 text-xs">
                          Be prepared to state time and space trade-offs clearly. Practice writing clean, modular code.
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* 7. 🔗 Grounding Sources */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-5 sm:p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-brand-400" />
                        <h3 className="font-bold font-display text-white text-sm">
                          Research Sources
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-500">Google Grounding</span>
                    </div>

                    <div className="space-y-2">
                      {research?.sources && research.sources.length > 0 ? (
                        research.sources.slice(0, 5).map((src: string, idx: number) => {
                          const isUrl = src.startsWith("http");
                          let domain = src;
                          if (isUrl) {
                            try {
                              domain = new URL(src).hostname.replace("www.", "");
                            } catch {}
                          }

                          return isUrl ? (
                            <a
                              key={idx}
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-lg bg-dark-800/80 border border-white/[0.04] hover:border-brand-500/40 transition-all flex items-center justify-between group text-xs"
                            >
                              <span className="text-slate-300 group-hover:text-white truncate max-w-[200px]">
                                {domain}
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand-400 flex-shrink-0" />
                            </a>
                          ) : (
                            <div
                              key={idx}
                              className="p-2 rounded-lg bg-dark-800/50 border border-white/[0.04] text-xs text-slate-400"
                            >
                              {src}
                            </div>
                          );
                        })
                      ) : (
                        <div className="space-y-1.5 text-xs text-slate-400">
                          <div className="p-2 rounded bg-dark-800/50">Reddit r/cscareerquestions & r/leetcode</div>
                          <div className="p-2 rounded bg-dark-800/50">LeetCode Discuss Interview Experiences</div>
                          <div className="p-2 rounded bg-dark-800/50">Community Verified Reports</div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* 8. 🎯 Action Card: Start Preparing */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="glass-card p-5 sm:p-6 bg-gradient-to-br from-brand-500/10 via-violet-500/10 to-transparent border-brand-500/30"
                  >
                    <h3 className="font-bold text-white text-base mb-1">🎯 Start Preparing Now</h3>
                    <p className="text-slate-400 text-xs mb-4">
                      Study plan & AI mock interview tailored for {company?.name} ({selectedRole}).
                    </p>
                    <div className="space-y-2">
                      <Link
                        href={`/planner?company=${slug}&role=${encodeURIComponent(selectedRole)}`}
                        className="btn-brand text-xs sm:text-sm py-2.5 px-4 w-full justify-center"
                      >
                        Generate Study Roadmap
                      </Link>
                      <Link
                        href={`/mock-interview?company=${slug}&role=${encodeURIComponent(selectedRole)}`}
                        className="btn-ghost text-xs sm:text-sm py-2.5 px-4 w-full justify-center"
                      >
                        Launch Mock Interview
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: QUESTION BANK */}
      {/* ============================================================ */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold font-display text-base sm:text-lg">
              Questions Asked at {company?.name}
            </h3>
            <Link href={`/questions?company=${slug}`} className="btn-brand text-xs py-2 px-3.5">
              Open in Question Bank
            </Link>
          </div>

          <div className="space-y-2.5">
            {(analytics?.topQuestions || []).length > 0 ? (
              analytics.topQuestions.map((q: any, i: number) => (
                <div
                  key={q.id || i}
                  className="glass-card-hover p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-slate-500 text-xs font-bold w-4 text-center">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-white text-xs sm:text-sm font-semibold truncate">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("badge text-[10px]", getDifficultyColor(q.difficulty))}>
                          {q.difficulty}
                        </span>
                        <span className="text-slate-500 text-[10px]">{q.type?.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-white font-semibold text-xs sm:text-sm">{q.frequency || 1}x</div>
                    <div className="text-slate-500 text-[10px]">reported</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 glass-card p-6">
                <Code2 className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">No recorded questions yet for {company?.name}</p>
                <p className="text-slate-600 text-xs mt-1">
                  Questions extracted from live research and interview reports appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ANALYTICS & TRENDS */}
      {/* ============================================================ */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Trend Chart */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="font-bold font-display text-white text-sm sm:text-base">
                  Interview Activity (Last 6 Months)
                </h3>
                <TrendingUp className="w-4 h-4 text-brand-400" />
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={analytics?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ fill: "#2563eb", r: 3, strokeWidth: 2, stroke: "#0f172a" }}
                    activeDot={{ r: 5, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top Topics in Interviews */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-6">
              <h3 className="font-bold font-display text-white text-sm sm:text-base mb-3">
                Most Tested Topics at {company?.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(analytics?.topTopics || []).map((t: any) => (
                  <div
                    key={t.topic}
                    className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40 border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                      <span className="text-slate-300 text-xs sm:text-sm font-medium truncate">{t.topic}</span>
                    </div>
                    <span className="badge badge-brand text-[11px] flex-shrink-0">{t.frequency}x</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Difficulty Breakdown */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-6">
              <h3 className="font-bold font-display text-white text-sm sm:text-base mb-4">
                Difficulty Distribution
              </h3>
              <div className="space-y-3">
                {diffData.map((item) => {
                  const total = diffData.reduce((s, d) => s + d.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{item.name}</span>
                        <span className="text-white font-medium">
                          {item.value} ({pct}%)
                        </span>
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
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: COMMUNITY REPORTS */}
      {/* ============================================================ */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold font-display text-sm sm:text-base">
              Interview Reports ({reports.length})
            </h3>
            <Link href="/reports/submit" className="btn-brand text-xs sm:text-sm py-2 px-3.5">
              Submit Experience
            </Link>
          </div>
          {reports.length > 0 ? (
            reports.map((report: any) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="glass-card-hover p-4 sm:p-5 flex items-center justify-between gap-4 group transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-semibold text-xs sm:text-sm group-hover:text-brand-300 transition-colors">
                      {report.role}
                    </span>
                    <span className={cn("badge text-[10px]", getDifficultyColor(report.difficulty))}>
                      {report.difficulty}
                    </span>
                    {report.offerStatus === "ACCEPTED" && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="text-slate-500 text-xs">
                    {report._count?.questions || report.questions?.length || 0} questions • {report.rounds?.length || 0} rounds • {formatDate(report.createdAt)}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            ))
          ) : (
            <div className="text-center py-12 glass-card p-6">
              <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">No community reports yet for {company?.name}</p>
              <p className="text-slate-600 text-xs mt-1">Be the first to submit an interview experience!</p>
              <Link href="/reports/submit" className="btn-brand text-xs py-2 px-4 inline-flex mt-4">
                Submit Experience
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
