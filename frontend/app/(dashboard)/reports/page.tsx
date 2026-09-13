"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Filter,
  Sparkles,
  Building2,
  ChevronRight,
  Layers,
  HelpCircle,
} from "lucide-react";
import { reportsAPI, companiesAPI } from "@/lib/api";
import { cn, getDifficultyColor, formatDate } from "@/lib/utils";

const OFFER_STATUS_CONFIG: Record<
  string,
  { icon: any; color: string; label: string; bg: string }
> = {
  ACCEPTED: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Offer Received",
  },
  REJECTED: {
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    label: "No Offer",
  },
  PENDING: {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    label: "Pending",
  },
  UNKNOWN: {
    icon: HelpCircle,
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
    label: "Unknown",
  },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    reportsAPI
      .getAll({ limit: 50 })
      .then((d) => {
        if (d.reports && d.reports.length > 0) {
          setReports(d.reports);
        } else {
          setReports([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load reports:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
    companiesAPI
      .getAll({ limit: 50 })
      .then((d) => {
        if (d.companies) setCompanies(d.companies);
      })
      .catch(() => {});
  }, []);

  const filtered = reports.filter((r) => {
    const matchesSearch =
      !search ||
      r.role?.toLowerCase().includes(search.toLowerCase()) ||
      r.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.experience?.toLowerCase().includes(search.toLowerCase());

    const matchesDiff =
      selectedDifficulty === "ALL" || r.difficulty === selectedDifficulty;

    const matchesStatus =
      selectedStatus === "ALL" || r.offerStatus === selectedStatus;

    const matchesCompany =
      selectedCompany === "ALL" ||
      r.company?.slug === selectedCompany ||
      r.company?.name === selectedCompany;

    return matchesSearch && matchesDiff && matchesStatus && matchesCompany;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
              <FileText className="w-3.5 h-3.5" /> Community Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white">
              Interview Reports
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Real candidate interview loops, questions asked, and hiring outcomes.
            </p>
          </div>

          <Link
            href="/reports/submit"
            className="btn-brand text-xs sm:text-sm py-2.5 px-4 self-start sm:self-auto inline-flex items-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> Share Experience
          </Link>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by company, role, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-10 py-2.5 text-xs sm:text-sm w-full"
            />
          </div>

          {/* Company Filter Dropdown */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="bg-slate-900/80 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Companies</option>
            {companies.map((c) => (
              <option key={c.id || c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-900/80 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="VERY_HARD">Brutal</option>
          </select>

          {/* Offer Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900/80 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Outcomes</option>
            <option value="ACCEPTED">Offer Received</option>
            <option value="REJECTED">No Offer</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </motion.div>

      {/* Reports List */}
      <div className="space-y-3">
        {loading && reports.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 animate-pulse"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/[0.06] flex-shrink-0" />
              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-4 bg-white/[0.08] rounded w-1/3" />
                  <div className="h-5 bg-white/[0.04] rounded-full w-20" />
                </div>
                <div className="h-3 bg-white/[0.04] rounded w-full" />
                <div className="h-3 bg-white/[0.03] rounded w-2/3" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="glass-card p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              No interview reports found
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
              Be the first to share an interview experience for this role and unlock insights for the community!
            </p>
            <Link
              href="/reports/submit"
              className="btn-brand text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Share First Experience
            </Link>
          </div>
        ) : (
          filtered.map((report, i) => {
            const statusConfig =
              OFFER_STATUS_CONFIG[report.offerStatus] ||
              OFFER_STATUS_CONFIG.UNKNOWN;
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.25) }}
              >
                <Link
                  href={`/reports/${report.id}`}
                  className="block glass-card-hover p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 transition-all group"
                >
                  {/* Company Logo / Initial */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    {report.company?.name?.charAt(0) || "C"}
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                      <div>
                        <h3 className="text-white font-bold text-sm sm:text-base group-hover:text-brand-300 transition-colors flex items-center gap-1.5">
                          <span>{report.role}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-brand-400" />
                        </h3>
                        <p className="text-brand-400 font-medium text-xs">
                          {report.company?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "badge text-xs",
                            getDifficultyColor(report.difficulty)
                          )}
                        >
                          {report.difficulty}
                        </span>
                        <span
                          className={cn(
                            "badge text-xs flex items-center gap-1 border",
                            statusConfig.color,
                            statusConfig.bg
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {statusConfig.label}
                          </span>
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3 font-sans">
                      &ldquo;{report.experience || report.rawText}&rdquo;
                    </p>

                    <div className="flex items-center justify-between text-slate-500 text-[11px] pt-2 border-t border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <span>
                          {report._count?.questions || report.questions?.length || 0} questions
                        </span>
                        <span>•</span>
                        <span>
                          {report.rounds?.length || 0} rounds
                        </span>
                        {report.helpfulCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400">
                              👍 {report.helpfulCount} helpful
                            </span>
                          </>
                        )}
                      </div>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
