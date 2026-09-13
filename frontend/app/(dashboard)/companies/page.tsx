"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, Building2, Filter, ChevronRight } from "lucide-react";
import { cn, getTierColor } from "@/lib/utils";
import { companiesAPI } from "@/lib/api";

const TIERS = ["All", "FAANG", "TIER1", "TIER2", "STARTUP", "MNC"];

const MOCK_COMPANIES = [
  { id: "1", name: "Google", slug: "google", logo: null, tier: "FAANG", industry: "Technology", _count: { reports: 843, companyQuestions: 324 } },
  { id: "2", name: "Amazon", slug: "amazon", logo: null, tier: "FAANG", industry: "E-Commerce", _count: { reports: 921, companyQuestions: 412 } },
  { id: "3", name: "Microsoft", slug: "microsoft", logo: null, tier: "FAANG", industry: "Technology", _count: { reports: 712, companyQuestions: 298 } },
  { id: "4", name: "Meta", slug: "meta", logo: null, tier: "FAANG", industry: "Technology", _count: { reports: 634, companyQuestions: 267 } },
  { id: "5", name: "Netflix", slug: "netflix", logo: null, tier: "FAANG", industry: "Technology", _count: { reports: 412, companyQuestions: 189 } },
  { id: "6", name: "Apple", slug: "apple", logo: null, tier: "FAANG", industry: "Technology", _count: { reports: 567, companyQuestions: 234 } },
  { id: "7", name: "Flipkart", slug: "flipkart", logo: null, tier: "TIER1", industry: "E-Commerce", _count: { reports: 389, companyQuestions: 156 } },
  { id: "8", name: "Zoho", slug: "zoho", logo: null, tier: "TIER1", industry: "Technology", _count: { reports: 256, companyQuestions: 112 } },
  { id: "9", name: "Walmart Labs", slug: "walmart", logo: null, tier: "TIER1", industry: "E-Commerce", _count: { reports: 287, companyQuestions: 124 } },
  { id: "10", name: "Nvidia", slug: "nvidia", logo: null, tier: "TIER1", industry: "Technology", _count: { reports: 198, companyQuestions: 89 } },
  { id: "11", name: "Tesla", slug: "tesla", logo: null, tier: "TIER1", industry: "Automotive", _count: { reports: 167, companyQuestions: 78 } },
  { id: "12", name: "Razorpay", slug: "razorpay", logo: null, tier: "STARTUP", industry: "Finance", _count: { reports: 123, companyQuestions: 56 } },
];

const TIER_COLORS: Record<string, string> = {
  FAANG: "from-amber-500 to-yellow-600",
  TIER1: "from-brand-500 to-blue-600",
  TIER2: "from-cyan-500 to-teal-600",
  STARTUP: "from-emerald-500 to-green-600",
  MNC: "from-violet-500 to-purple-600",
  PRODUCT: "from-rose-500 to-pink-600",
  SERVICE: "from-slate-500 to-gray-600",
};

function CompanyInitial({ name, tier }: { name: string; tier: string }) {
  const gradient = TIER_COLORS[tier] || "from-slate-500 to-gray-600";
  return (
    <div className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold font-display text-base sm:text-lg shadow-lg flex-shrink-0", gradient)}>
      {name.charAt(0)}
    </div>
  );
}

export default function CompanyExplorerPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState("All");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => fetchCompanies(), 250);
    return () => clearTimeout(timer);
  }, [search, selectedTier, page]);

  async function fetchCompanies() {
    setLoading(true);
    try {
      const params: any = { page, limit: 24 };
      if (search) params.search = search;
      if (selectedTier !== "All") params.tier = selectedTier;

      const data = await companiesAPI.getAll(params);
      if (data.companies?.length > 0) {
        setCompanies(data.companies);
        setTotalPages(data.totalPages || 1);
      } else if (companies.length === 0) {
        setCompanies(MOCK_COMPANIES);
      }
    } catch {
      if (companies.length === 0) setCompanies(MOCK_COMPANIES);
    } finally {
      setLoading(false);
    }
  }

  const filtered = companies.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchTier = selectedTier === "All" || c.tier === selectedTier;
    return matchSearch && matchTier;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium">
          <Building2 className="w-3.5 h-3.5" />
          500+ Companies Tracked
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white">
          Company Intelligence
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Deep analytics, real interview experiences, and AI insights for top tech companies.
        </p>

        {/* Search */}
        <div className="pt-2 relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10 py-2.5 sm:py-3 text-sm sm:text-base"
          />
        </div>
      </motion.div>

      {/* Filters (Horizontal scrollable on mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
      >
        <div className="flex items-center gap-1 text-slate-500 text-xs sm:text-sm flex-shrink-0 pr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Tier:</span>
        </div>
        {TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 border flex-shrink-0",
              selectedTier === tier
                ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                : "text-slate-400 border-white/[0.06] hover:border-white/[0.12] hover:text-slate-300 bg-white/[0.02]"
            )}
          >
            {tier}
          </button>
        ))}
      </motion.div>

      {/* Company Grid: 1 col on mobile (<640px), 2 col on tablet (640-1024px), 3-4 col on desktop */}
      {loading && companies.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 sm:p-5 flex flex-col gap-3.5 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/[0.06] flex-shrink-0" />
                <div className="flex-1 space-y-2 py-0.5">
                  <div className="h-4 bg-white/[0.08] rounded w-3/4" />
                  <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                </div>
              </div>
              <div className="h-5 bg-white/[0.04] rounded-full w-16" />
              <div className="flex gap-4 pt-2.5 border-t border-white/[0.04] mt-auto">
                <div className="space-y-1">
                  <div className="h-4 bg-white/[0.06] rounded w-8" />
                  <div className="h-2.5 bg-white/[0.03] rounded w-12" />
                </div>
                <div className="space-y-1">
                  <div className="h-4 bg-white/[0.06] rounded w-8" />
                  <div className="h-2.5 bg-white/[0.03] rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.2 }}
                layout
              >
                <Link
                  href={`/companies/${company.slug}`}
                  className="glass-card-hover p-4 sm:p-5 flex flex-col gap-3 group h-full block"
                >
                  {/* Company Header */}
                  <div className="flex items-start gap-3">
                    <CompanyInitial name={company.name} tier={company.tier} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm sm:text-base truncate group-hover:text-brand-300 transition-colors">
                        {company.name}
                      </div>
                      <div className="text-slate-500 text-xs truncate mt-0.5">
                        {company.industry || "Technology"}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 flex-shrink-0 transition-colors mt-1" />
                  </div>

                  {/* Tier Badge */}
                  <div className="flex items-center gap-2">
                    <span className={cn("badge text-xs", getTierColor(company.tier))}>
                      {company.tier}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 pt-2.5 border-t border-white/[0.06] mt-auto">
                    <div>
                      <div className="text-white font-semibold text-xs sm:text-sm">
                        {company._count?.reports || 0}
                      </div>
                      <div className="text-slate-500 text-[11px]">Reports</div>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-xs sm:text-sm">
                        {company._count?.companyQuestions || 0}
                      </div>
                      <div className="text-slate-500 text-[11px]">Questions</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && !loading && (
        <div className="text-center py-16 glass-card p-8">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold text-base mb-1">No companies found</h3>
          <p className="text-slate-500 text-xs sm:text-sm">
            Try adjusting your search query or tier filters.
          </p>
        </div>
      )}
    </div>
  );
}
