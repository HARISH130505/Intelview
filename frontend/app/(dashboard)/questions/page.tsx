"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Code2,
  Search,
  Filter,
  X,
  Building2,
  Tag,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { questionsAPI } from "@/lib/api";
import { cn, getDifficultyColor } from "@/lib/utils";

const DIFFICULTIES = ["All", "EASY", "MEDIUM", "HARD", "VERY_HARD"];
const TYPES = ["All", "CODING", "BEHAVIORAL", "SYSTEM_DESIGN", "CORE_CS", "APTITUDE"];
const COMMON_ROLES = ["All", "SDE-1", "SDE-2", "Senior SDE", "Frontend", "Backend", "Full Stack", "System Design"];

const SOURCE_LABEL: Record<string, { label: string; color: string }> = {
  "gemini-research": { label: "AI Research", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  community: { label: "Community", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  seed: { label: "Verified", color: "text-brand-400 bg-brand-500/10 border-brand-500/20" },
  leetcode: { label: "LeetCode", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  reddit: { label: "Reddit", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
};

function getSourceStyle(source: string) {
  if (!source) return null;
  const lower = source.toLowerCase();
  if (lower.includes("gemini") || lower.includes("research")) return SOURCE_LABEL["gemini-research"];
  if (lower.includes("reddit")) return SOURCE_LABEL["reddit"];
  if (lower.includes("leetcode")) return SOURCE_LABEL["leetcode"];
  if (lower.includes("community")) return SOURCE_LABEL["community"];
  return { label: source, color: "text-slate-400 bg-white/[0.04] border-white/[0.08]" };
}

const MOCK_QUESTIONS = [
  { id: "1", text: "Design a URL Shortener like bit.ly", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 234, source: "seed", isVerified: true, topics: [{ topic: { name: "System Design", slug: "system-design" } }], companyQuestions: [{ company: { name: "Google", slug: "google" } }, { company: { name: "Amazon", slug: "amazon" } }] },
  { id: "2", text: "Merge K sorted linked lists", difficulty: "HARD", type: "CODING", frequency: 198, source: "seed", isVerified: true, topics: [{ topic: { name: "Linked Lists", slug: "linked-lists" } }, { topic: { name: "Heap", slug: "heap" } }], companyQuestions: [{ company: { name: "Amazon", slug: "amazon" } }] },
  { id: "3", text: "LRU Cache Implementation", difficulty: "MEDIUM", type: "CODING", frequency: 187, source: "seed", isVerified: true, topics: [{ topic: { name: "Hash Map", slug: "hash-map" } }], companyQuestions: [{ company: { name: "Google", slug: "google" } }, { company: { name: "Meta", slug: "meta" } }] },
  { id: "4", text: "Find all permutations of a string", difficulty: "MEDIUM", type: "CODING", frequency: 156, source: "community", isVerified: false, topics: [{ topic: { name: "Backtracking", slug: "backtracking" } }], companyQuestions: [{ company: { name: "Microsoft", slug: "microsoft" } }] },
  { id: "5", text: "Design a Rate Limiter", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 143, source: "reddit", isVerified: false, topics: [{ topic: { name: "System Design", slug: "system-design" } }], companyQuestions: [{ company: { name: "Stripe", slug: "stripe" } }] },
  { id: "6", text: "Tell me about a time you had to persuade someone", difficulty: "MEDIUM", type: "BEHAVIORAL", frequency: 132, source: "seed", isVerified: true, topics: [{ topic: { name: "Leadership", slug: "leadership" } }], companyQuestions: [{ company: { name: "Amazon", slug: "amazon" } }] },
  { id: "7", text: "Binary Tree Maximum Path Sum", difficulty: "HARD", type: "CODING", frequency: 128, source: "gemini-research", isVerified: false, topics: [{ topic: { name: "Trees", slug: "trees" } }], companyQuestions: [{ company: { name: "Meta", slug: "meta" } }] },
];

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: "brand" | "violet" | "amber";
  onClick: () => void;
}) {
  const activeClasses = {
    brand: "bg-brand-500/20 text-brand-400 border-brand-500/40",
    violet: "bg-violet-500/20 text-violet-400 border-violet-500/40",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 border flex-shrink-0",
        active
          ? activeClasses[color]
          : "text-slate-400 border-white/[0.06] hover:border-white/[0.12] hover:text-slate-300 bg-white/[0.02]"
      )}
    >
      {label.replace(/_/g, " ")}
    </button>
  );
}

function QuestionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial values from URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "All");
  const [type, setType] = useState(searchParams.get("type") || "All");
  const [company, setCompany] = useState(searchParams.get("company") || "All");
  const [role, setRole] = useState(searchParams.get("role") || "All");
  const [topic, setTopic] = useState(searchParams.get("topic") || "All");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true");

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter dropdown data
  const [companies, setCompanies] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // Load companies + topics for dropdowns once
  useEffect(() => {
    questionsAPI.getFilters().then((data) => {
      if (data?.companies) setCompanies(data.companies);
      if (data?.topics) setTopics(data.topics);
      setFiltersLoaded(true);
    }).catch(() => setFiltersLoaded(true));
  }, []);

  // Sync URL params and refetch on filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (difficulty !== "All") params.set("difficulty", difficulty);
    if (type !== "All") params.set("type", type);
    if (company !== "All") params.set("company", company);
    if (role !== "All") params.set("role", role);
    if (topic !== "All") params.set("topic", topic);
    if (verifiedOnly) params.set("verified", "true");

    const timer = setTimeout(() => {
      router.replace(`/questions?${params.toString()}`, { scroll: false });
      fetchQuestions();
    }, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [search, difficulty, type, company, role, topic, verifiedOnly]);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const params: any = { limit: 60 };
      if (search) params.search = search;
      if (difficulty !== "All") params.difficulty = difficulty;
      if (type !== "All") params.type = type;
      if (company !== "All") params.company = company;
      if (role !== "All") params.role = role;
      if (topic !== "All") params.topic = topic;
      if (verifiedOnly) params.verified = true;

      const data = await questionsAPI.getAll(params);
      if (data.questions) {
        setQuestions(data.questions);
        setTotal(data.total || 0);
      } else if (data.questions?.length === 0) {
        setQuestions([]);
      }
    } catch {
      // Only use mock data on complete network failure (dev fallback)
      if (questions.length === 0) setQuestions(MOCK_QUESTIONS);
    } finally {
      setLoading(false);
    }
  }

  function clearAllFilters() {
    setSearch("");
    setDifficulty("All");
    setType("All");
    setCompany("All");
    setRole("All");
    setTopic("All");
    setVerifiedOnly(false);
  }

  const hasActiveFilters =
    search || difficulty !== "All" || type !== "All" || company !== "All" || role !== "All" || topic !== "All" || verifiedOnly;

  const activeFilterCount = [
    search,
    difficulty !== "All",
    type !== "All",
    company !== "All",
    role !== "All",
    topic !== "All",
    verifiedOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-2">
              <Code2 className="w-3.5 h-3.5" />
              {loading ? "Loading..." : `${total || questions.length} Questions`}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white">
              Question Bank
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Real interview questions from FAANG, Indian unicorns, and top MNCs — sourced from community reports and live Gemini research.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-1 relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search problems, topics, algorithms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10 pr-10 py-2.5 sm:py-3 text-sm sm:text-base w-full"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter Rows */}
      <div className="space-y-2">
        {/* Difficulty Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 pb-1">
          <div className="flex items-center gap-1 text-slate-500 text-xs flex-shrink-0 pr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Difficulty:</span>
          </div>
          {DIFFICULTIES.map((d) => (
            <FilterChip key={d} label={d} active={difficulty === d} color="brand" onClick={() => setDifficulty(d)} />
          ))}
        </div>

        {/* Type Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 pb-1">
          <div className="flex items-center gap-1 text-slate-500 text-xs flex-shrink-0 pr-1 w-[68px]">
            <span>Type:</span>
          </div>
          {TYPES.map((t) => (
            <FilterChip key={t} label={t} active={type === t} color="violet" onClick={() => setType(t)} />
          ))}
        </div>

        {/* Company + Role + Topic dropdowns + Verified toggle */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Company Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={cn(
                "bg-dark-900 border rounded-xl pl-8 pr-7 py-1.5 text-xs font-medium appearance-none cursor-pointer focus:outline-none transition-all",
                company !== "All"
                  ? "border-brand-500/40 text-brand-400 bg-brand-500/10"
                  : "border-white/[0.08] text-slate-400 hover:border-white/[0.14]"
              )}
            >
              <option value="All">All Companies</option>
              {companies.map((c: any) => (
                <option key={c.slug} value={c.slug} className="bg-dark-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Role Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={cn(
                "bg-dark-900 border rounded-xl pl-8 pr-7 py-1.5 text-xs font-medium appearance-none cursor-pointer focus:outline-none transition-all",
                role !== "All"
                  ? "border-violet-500/40 text-violet-400 bg-violet-500/10"
                  : "border-white/[0.08] text-slate-400 hover:border-white/[0.14]"
              )}
            >
              <option value="All">All Roles</option>
              {COMMON_ROLES.filter((r) => r !== "All").map((r) => (
                <option key={r} value={r} className="bg-dark-900 text-white">
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Topic Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={cn(
                "bg-dark-900 border rounded-xl pl-8 pr-7 py-1.5 text-xs font-medium appearance-none cursor-pointer focus:outline-none transition-all",
                topic !== "All"
                  ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                  : "border-white/[0.08] text-slate-400 hover:border-white/[0.14]"
              )}
            >
              <option value="All">All Topics</option>
              {topics.map((t: any) => (
                <option key={t.slug} value={t.slug} className="bg-dark-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Verified Toggle */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
              verifiedOnly
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "text-slate-400 border-white/[0.08] hover:border-white/[0.14] bg-white/[0.02]"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Only
          </button>

          {/* Clear All Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-rose-400 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
            >
              <X className="w-3 h-3" />
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse"
            >
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-5 bg-white/[0.06] rounded-full w-14" />
                  <div className="h-5 bg-white/[0.04] rounded-full w-20" />
                  <div className="h-5 bg-white/[0.03] rounded-full w-16 hidden sm:block" />
                </div>
                <div className="h-4 bg-white/[0.08] rounded w-3/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-white/[0.04] rounded w-16" />
                  <div className="h-5 bg-white/[0.03] rounded w-20" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 sm:pt-0">
                <div className="h-6 bg-white/[0.04] rounded-md w-16" />
                <div className="h-6 bg-white/[0.05] rounded-md w-10" />
              </div>
            </div>
          ))
        ) : questions.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {questions.map((q, i) => {
              const sourceStyle = q.source ? getSourceStyle(q.source) : null;
              return (
                <motion.div
                  key={q.id || i}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: Math.min(i * 0.025, 0.2) }}
                  className="glass-card-hover p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                >
                  {/* Left: badge row + question text + topics */}
                  <div className="flex-1 min-w-0">
                    {/* Top badge row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={cn("badge text-[11px]", getDifficultyColor(q.difficulty))}>
                        {q.difficulty}
                      </span>
                      <span className="badge badge-brand text-[11px]">
                        {q.type?.replace(/_/g, " ")}
                      </span>
                      {q.isVerified && (
                        <span className="badge text-[11px] text-emerald-400 bg-emerald-500/10 border-emerald-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {sourceStyle && (
                        <span className={cn("badge text-[11px]", sourceStyle.color)}>
                          {sourceStyle.label}
                        </span>
                      )}
                    </div>

                    {/* Question text */}
                    <h3 className="text-white font-medium text-sm sm:text-base leading-snug group-hover:text-brand-300 transition-colors mb-2">
                      {q.text}
                    </h3>

                    {/* Topics */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(q.topics || []).slice(0, 4).map((t: any, j: number) => (
                        <button
                          key={j}
                          onClick={() => setTopic(t.topic?.slug || "All")}
                          className="text-[11px] text-slate-500 hover:text-brand-400 transition-colors"
                        >
                          #{t.topic?.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Company tags + Frequency */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04] flex-shrink-0">
                    {/* Companies */}
                    <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                      {(q.companyQuestions || []).slice(0, 2).map((cq: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCompany(cq.company?.slug || "All")}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:border-brand-500/30 hover:text-brand-400 transition-all"
                        >
                          {cq.company?.name}
                        </button>
                      ))}
                      {(q.companyQuestions || []).length > 2 && (
                        <span className="text-[11px] text-slate-600">
                          +{q.companyQuestions.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Frequency */}
                    <div className="text-right">
                      <span className="text-brand-400 font-bold text-sm">{q.frequency}x</span>
                      <span className="text-slate-500 text-[10px] block">asked</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 glass-card p-8"
          >
            <Code2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-base mb-1">No questions match your filters</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-4">
              {company !== "All"
                ? `No questions found for this company with the current filters.`
                : topic !== "All"
                ? `No questions tagged under this topic yet.`
                : `Try adjusting your search or filters.`}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-ghost text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Footer: pagination hint */}
      {!loading && questions.length > 0 && (
        <div className="text-center text-xs text-slate-600 pt-2">
          Showing {questions.length} of {total} questions
          {total > 60 && (
            <span className="ml-1">
              — use filters to narrow results
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-5 animate-pulse">
        <div className="h-10 w-64 bg-white/[0.06] rounded-xl" />
        <div className="h-12 w-full max-w-xl bg-white/[0.04] rounded-xl" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card h-24 bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    }>
      <QuestionsContent />
    </Suspense>
  );
}
