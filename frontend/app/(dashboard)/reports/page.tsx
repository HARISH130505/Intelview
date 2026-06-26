"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Search, Filter, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { reportsAPI } from "@/lib/api";
import { cn, getDifficultyColor, formatDate } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const MOCK_REPORTS = [
  { id: "1", role: "Software Engineer II", difficulty: "HARD", offerStatus: "ACCEPTED", createdAt: "2025-06-10", company: { name: "Google", slug: "google" }, rounds: [{}, {}, {}], _count: { questions: 8 }, experience: "3 rounds of coding, then system design. Focus was on dynamic programming and graph algorithms." },
  { id: "2", role: "SDE-1", difficulty: "MEDIUM", offerStatus: "PENDING", createdAt: "2025-06-08", company: { name: "Amazon", slug: "amazon" }, rounds: [{}, {}], _count: { questions: 5 }, experience: "Two technical rounds with LP questions interspersed. Strong focus on leadership principles." },
  { id: "3", role: "Senior Software Engineer", difficulty: "VERY_HARD", offerStatus: "REJECTED", createdAt: "2025-06-05", company: { name: "Meta", slug: "meta" }, rounds: [{}, {}, {}, {}], _count: { questions: 12 }, experience: "4 rounds including system design at scale. They expect you to handle billions of users in your design." },
  { id: "4", role: "Backend Engineer", difficulty: "MEDIUM", offerStatus: "ACCEPTED", createdAt: "2025-06-01", company: { name: "Flipkart", slug: "flipkart" }, rounds: [{}, {}], _count: { questions: 6 }, experience: "More practical and product-focused. Good communication skills matter here." },
];

export default function ReportsPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [search, setSearch] = useState("");

  useEffect(() => {
    reportsAPI.getAll({ limit: 20 }).then(d => { if (d.reports?.length > 0) setReports(d.reports); }).catch(() => {});
  }, []);

  const OFFER_STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    ACCEPTED: { icon: CheckCircle, color: "text-emerald-400", label: "Offer Received" },
    REJECTED: { icon: XCircle, color: "text-rose-400", label: "No Offer" },
    PENDING: { icon: Clock, color: "text-amber-400", label: "Pending" },
    UNKNOWN: { icon: Clock, color: "text-slate-400", label: "Unknown" },
  };

  const filtered = reports.filter(r => !search || r.role.toLowerCase().includes(search.toLowerCase()) || r.company?.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="pt-16">
        <div className="border-b border-white/[0.06] bg-dark-900/50 relative">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
                  <FileText className="w-3.5 h-3.5" /> Community Reports
                </div>
                <h1 className="text-4xl font-black font-display text-white mb-2">Interview Reports</h1>
                <p className="text-slate-400">Real experiences from the community, analyzed by AI</p>
              </div>
              <Link href="/reports/submit" className="btn-brand text-sm py-2.5 px-5 flex-shrink-0">
                <Plus className="w-4 h-4" /> Share Experience
              </Link>
            </div>
            <div className="mt-6 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input type="text" placeholder="Search by company or role..." value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-12 py-4" />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          {filtered.map((report, i) => {
            const statusConfig = OFFER_STATUS_CONFIG[report.offerStatus] || OFFER_STATUS_CONFIG.UNKNOWN;
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={`/reports/${report.id}`} className="glass-card-hover p-6 flex gap-5 group">
                  {/* Company Logo */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {report.company?.name?.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold">{report.company?.name}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-300 text-sm">{report.role}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("badge text-xs", getDifficultyColor(report.difficulty))}>{report.difficulty}</span>
                          <span className="text-slate-600 text-xs">{report.rounds?.length || 0} rounds</span>
                          <span className="text-slate-600 text-xs">{report._count?.questions || 0} questions</span>
                          <span className="text-slate-600 text-xs">{formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-1.5 text-sm font-medium flex-shrink-0", statusConfig.color)}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-3 line-clamp-2">{report.experience}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
