"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ThumbsUp,
  Share2,
  Code2,
  Layers,
  Sparkles,
  User,
  Shield,
  Briefcase,
  ExternalLink,
  ChevronRight,
  DollarSign,
  Award,
} from "lucide-react";
import { reportsAPI } from "@/lib/api";
import { cn, getDifficultyColor, formatDate } from "@/lib/utils";

const OFFER_STATUS_CONFIG: Record<
  string,
  { icon: any; color: string; label: string; bg: string }
> = {
  ACCEPTED: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Offer Accepted",
  },
  REJECTED: {
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    label: "No Offer / Rejected",
  },
  PENDING: {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    label: "Decision Pending",
  },
  UNKNOWN: {
    icon: HelpCircle,
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
    label: "Outcome Unknown",
  },
};

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    reportsAPI
      .getById(resolvedParams.id)
      .then((data) => {
        if (data.report) {
          setReport(data.report);
          setHelpfulCount(data.report.helpfulCount || 0);
        }
      })
      .catch((err) => {
        console.error("Failed to load report:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [resolvedParams.id]);

  const handleHelpful = async () => {
    if (hasMarkedHelpful) return;
    setHasMarkedHelpful(true);
    setHelpfulCount((prev) => prev + 1);
    try {
      await reportsAPI.markHelpful(resolvedParams.id);
    } catch {
      // Revert if API fails
      setHelpfulCount((prev) => Math.max(0, prev - 1));
      setHasMarkedHelpful(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-36 bg-white/[0.05] rounded-lg" />
        <div className="glass-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.08]" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-1/3 bg-white/[0.08] rounded" />
              <div className="h-4 w-1/4 bg-white/[0.04] rounded" />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 h-64" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          The requested interview experience does not exist or has been removed.
        </p>
        <Link href="/reports" className="btn-brand text-xs py-2 px-4 inline-block">
          Return to Reports
        </Link>
      </div>
    );
  }

  const statusConfig =
    OFFER_STATUS_CONFIG[report.offerStatus] || OFFER_STATUS_CONFIG.UNKNOWN;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Interview Reports
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="btn-glass text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Copied!" : "Share Link"}</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8 space-y-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            {/* Company Logo Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-lg shadow-brand-500/20 border border-white/10">
              {report.company?.name?.charAt(0) || "C"}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {report.company?.slug ? (
                  <Link
                    href={`/companies/${report.company.slug}`}
                    className="text-brand-400 hover:text-brand-300 font-bold text-sm inline-flex items-center gap-1 group"
                  >
                    <span>{report.company.name}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <span className="text-brand-400 font-bold text-sm">
                    {report.company?.name}
                  </span>
                )}

                {report.company?.tier && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                    {report.company.tier}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-white">
                {report.role}
              </h1>

              {/* Author & Date metadata */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  {report.isAnonymous ? (
                    <>
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Anonymous Candidate</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-brand-400" />
                      <span>{report.user?.name || "Community Engineer"}</span>
                    </>
                  )}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {report.interviewDate
                      ? formatDate(report.interviewDate)
                      : formatDate(report.createdAt)}
                  </span>
                </span>
                {report.location && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{report.location}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Outcome & Difficulty Badges */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border",
                statusConfig.bg,
                statusConfig.color
              )}
            >
              <StatusIcon className="w-4 h-4" />
              <span>{statusConfig.label}</span>
            </span>

            <span
              className={cn(
                "badge text-xs font-semibold px-3 py-1",
                getDifficultyColor(report.difficulty)
              )}
            >
              {report.difficulty} Difficulty
            </span>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.06]">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[11px] text-slate-500 block">Rounds</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {report.rounds?.length || 0} Rounds
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[11px] text-slate-500 block">Questions</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {report.questions?.length || 0} Questions
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[11px] text-slate-500 block">Experience</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {report.yearsExp ? `${report.yearsExp} Years` : "Fresh Grad / Any"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[11px] text-slate-500 block">Compensation</span>
            <span className="text-sm font-bold text-white mt-0.5 block truncate">
              {report.salary || "Not Disclosed"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Experience Story */}
      <div className="glass-card p-6 sm:p-8 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Candidate Narrative & Experience
        </h2>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-3 font-sans">
          {report.experience || report.rawText}
        </div>
      </div>

      {/* Interview Rounds Timeline */}
      {report.rounds && report.rounds.length > 0 && (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Interview Rounds Breakdown
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Detailed step-by-step chronology of the interview loop
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
              {report.rounds.length} Stages
            </span>
          </div>

          <div className="space-y-4 relative">
            {report.rounds.map((round: any, idx: number) => (
              <div
                key={round.id || idx}
                className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 font-bold text-xs flex items-center justify-center">
                      R{round.roundNumber || idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {round.type ? round.type.replace(/_/g, " ") : `Round ${idx + 1}`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {round.duration && (
                      <span className="text-xs text-slate-400 inline-flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-lg">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{round.duration} mins</span>
                      </span>
                    )}
                    {round.difficulty && (
                      <span
                        className={cn(
                          "badge text-xs",
                          getDifficultyColor(round.difficulty)
                        )}
                      >
                        {round.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                {round.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-9">
                    {round.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Questions */}
      {report.questions && report.questions.length > 0 && (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                Questions Asked ({report.questions.length})
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Practice these questions extracted directly from this interview
              </p>
            </div>

            <Link
              href={
                report.company?.slug
                  ? `/questions?company=${report.company.slug}`
                  : `/questions`
              }
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
            >
              <span>View in Question Bank</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {report.questions.map((rq: any, idx: number) => {
              const q = rq.question || rq;
              const text = q?.text || rq.rawText;
              const diff = q?.difficulty || "MEDIUM";
              const topics = q?.topics || [];

              return (
                <div
                  key={rq.id || idx}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <p className="text-xs sm:text-sm font-mono text-white leading-relaxed">
                        {text}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span
                          className={cn(
                            "badge text-[10px]",
                            getDifficultyColor(diff)
                          )}
                        >
                          {diff}
                        </span>

                        {q?.type && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400">
                            {q.type.replace(/_/g, " ")}
                          </span>
                        )}

                        {topics.map((t: any, tidx: number) => (
                          <span
                            key={tidx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-300 border border-brand-500/20"
                          >
                            {t.topic?.name || t.name || t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/questions?search=${encodeURIComponent(text.slice(0, 40))}`}
                      className="btn-glass text-xs py-1.5 px-3 flex-shrink-0 inline-flex items-center gap-1"
                    >
                      <span>Practice</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helpful & Action CTA */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleHelpful}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all active:scale-95",
              hasMarkedHelpful
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]"
            )}
          >
            <ThumbsUp
              className={cn("w-4 h-4", hasMarkedHelpful ? "fill-current" : "")}
            />
            <span>Helpful ({helpfulCount})</span>
          </button>
          <span className="text-xs text-slate-400">
            Let the community know this report helped you!
          </span>
        </div>

        <Link
          href={`/mock-interview?company=${report.company?.slug || ""}&role=${encodeURIComponent(report.role || "")}`}
          className="btn-brand text-xs sm:text-sm py-2 px-4 inline-flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Simulate Mock Interview for this Role</span>
        </Link>
      </div>
    </div>
  );
}
