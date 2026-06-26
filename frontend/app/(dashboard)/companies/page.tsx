"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, Building2, TrendingUp, Filter, ChevronRight, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn, getTierColor } from "@/lib/utils";
import { companiesAPI } from "@/lib/api";

const TIERS = ["All", "FAANG", "TIER1", "TIER2", "STARTUP", "MNC"];
const INDUSTRIES = ["All", "Technology", "E-Commerce", "Finance", "Healthcare", "Automotive"];

// Fallback mock data if API not connected
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
    <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold font-display text-lg shadow-lg flex-shrink-0", gradient)}>
      {name.charAt(0)}
    </div>
  );
}

export default function CompanyExplorerPage() {
  const [companies, setCompanies] = useState<any[]>(MOCK_COMPANIES);
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState("All");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => fetchCompanies(), 300);
    return () => clearTimeout(timer);
  }, [search, selectedTier, selectedIndustry, page]);

  async function fetchCompanies() {
    setLoading(true);
    try {
      const params: any = { page, limit: 16 };
      if (search) params.search = search;
      if (selectedTier !== "All") params.tier = selectedTier;
      if (selectedIndustry !== "All") params.industry = selectedIndustry;

      const data = await companiesAPI.getAll(params);
      if (data.companies?.length > 0) {
        setCompanies(data.companies);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }

  const filtered = companies.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchTier = selectedTier === "All" || c.tier === selectedTier;
    const matchIndustry = selectedIndustry === "All" || c.industry === selectedIndustry;
    return matchSearch && matchTier && matchIndustry;
  });

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="relative border-b border-white/[0.06] bg-dark-900/50">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-4">
                <Building2 className="w-3.5 h-3.5" />
                500+ Companies Tracked
              </div>
              <h1 className="text-4xl font-black font-display text-white mb-2">
                Company Intelligence Explorer
              </h1>
              <p className="text-slate-400">
                Deep analytics, real interview data, and AI insights for every company
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 relative max-w-xl"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark pl-12 py-4 text-base"
              />
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            <div className="flex items-center gap-1 mr-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500 text-sm">Tier:</span>
            </div>
            {TIERS.map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border",
                  selectedTier === tier
                    ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                    : "text-slate-400 border-white/[0.06] hover:border-white/[0.12] hover:text-slate-300"
                )}
              >
                {tier}
              </button>
            ))}
          </motion.div>

          {/* Company Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((company, i) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  layout
                >
                  <Link
                    href={`/companies/${company.slug}`}
                    className="glass-card-hover p-5 flex flex-col gap-4 group h-full"
                  >
                    {/* Company Header */}
                    <div className="flex items-start gap-3">
                      <CompanyInitial name={company.name} tier={company.tier} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{company.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{company.industry || "Technology"}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 flex-shrink-0 transition-colors mt-0.5" />
                    </div>

                    {/* Tier Badge */}
                    <div className="flex items-center gap-2">
                      <span className={cn("badge text-xs", getTierColor(company.tier))}>
                        {company.tier}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 pt-2 border-t border-white/[0.06]">
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {company._count?.reports || 0}
                        </div>
                        <div className="text-slate-600 text-xs">Reports</div>
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {company._count?.companyQuestions || 0}
                        </div>
                        <div className="text-slate-600 text-xs">Questions</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-20">
              <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No companies found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
