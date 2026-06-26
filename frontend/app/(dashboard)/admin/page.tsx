"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Building2, FileText, CheckCircle, XCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AdminStats {
  totalUsers: number;
  totalReports: number;
  pendingReports: number;
  totalCompanies: number;
}

export default function AdminDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if admin
  const isAdmin = user?.publicMetadata?.role === "admin";

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.replace("/dashboard");
      return;
    }

    if (isAdmin) {
      fetchData();
    }
  }, [isLoaded, isAdmin, router]);

  async function fetchData() {
    setLoading(true);
    try {
      const [statsData, reportsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingReports(),
      ]);
      setStats(statsData.stats);
      setPendingReports(reportsData.reports || []);
    } catch {
      // Demo data
      setStats({ totalUsers: 15432, totalReports: 12450, pendingReports: 45, totalCompanies: 523 });
      setPendingReports([
        { id: "1", role: "SDE-2", difficulty: "HARD", createdAt: new Date().toISOString(), company: { name: "Google", slug: "google" }, user: { id: "u1", name: "John Doe" }, _count: { questions: 5 } },
        { id: "2", role: "Frontend Engineer", difficulty: "MEDIUM", createdAt: new Date().toISOString(), company: { name: "Amazon", slug: "amazon" }, user: { id: "u2", name: "Jane Smith" }, _count: { questions: 3 } },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await adminAPI.approveReport(id);
      setPendingReports(prev => prev.filter(r => r.id !== id));
      setStats(prev => prev ? { ...prev, pendingReports: Math.max(0, prev.pendingReports - 1) } : null);
      toast.success("Report approved and published");
    } catch {
      toast.error("Failed to approve report");
    }
  }

  async function handleReject(id: string) {
    try {
      await adminAPI.rejectReport(id);
      setPendingReports(prev => prev.filter(r => r.id !== id));
      setStats(prev => prev ? { ...prev, pendingReports: Math.max(0, prev.pendingReports - 1) } : null);
      toast.success("Report rejected");
    } catch {
      toast.error("Failed to reject report");
    }
  }

  if (!isLoaded || !isAdmin) return <div className="min-h-screen bg-dark-950 flex items-center justify-center"><RefreshCcw className="w-8 h-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
        </div>
        <h1 className="text-3xl font-black font-display text-white mb-1">Platform Administration</h1>
        <p className="text-slate-400">Manage users, content, and system intelligence</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Users", value: stats?.totalUsers || 0, color: "text-brand-400" },
          { icon: FileText, label: "Total Reports", value: stats?.totalReports || 0, color: "text-emerald-400" },
          { icon: AlertCircle, label: "Pending Review", value: stats?.pendingReports || 0, color: "text-amber-400" },
          { icon: Building2, label: "Companies", value: stats?.totalCompanies || 0, color: "text-violet-400" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
            <Icon className={cn("w-5 h-5 mb-3", color)} />
            <div className="text-2xl font-bold font-display text-white">{value}</div>
            <div className="text-slate-500 text-xs mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Pending Reports */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold font-display">Content Moderation Queue</h3>
          <button onClick={fetchData} className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
            <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
          </button>
        </div>

        {pendingReports.length === 0 ? (
          <div className="text-center py-10 bg-dark-800/30 rounded-xl border border-white/[0.04]">
            <CheckCircle className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Queue is empty</p>
            <p className="text-slate-600 text-sm mt-1">All community reports have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <div key={report.id} className="p-4 rounded-xl bg-dark-800/50 border border-white/[0.04] flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold">{report.company?.name}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-300 text-sm">{report.role}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>By {report.user?.name || "Anonymous"}</span>
                    <span>{formatDate(report.createdAt)}</span>
                    <span className="badge badge-amber text-xs">{report._count?.questions || 0} extracted Qs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleApprove(report.id)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Approve & Publish">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleReject(report.id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors" title="Reject & Delete">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
