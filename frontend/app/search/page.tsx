"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search as SearchIcon, Building2, Code2, FileText, ChevronRight, Loader2 } from "lucide-react";
import { searchAPI } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ companies: any[]; questions: any[]; reports: any[] }>({ companies: [], questions: [], reports: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) performSearch();
      else setResults({ companies: [], questions: [], reports: [] });
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  async function performSearch() {
    setLoading(true);
    try {
      const data = await searchAPI.search(query);
      setResults(data.results || { companies: [], questions: [], reports: [] });
    } catch {
      // Mock search results for demo
      if (query.toLowerCase().includes("goog")) {
        setResults({
          companies: [{ slug: "google", name: "Google", tier: "FAANG" }],
          questions: [{ id: "q1", text: "Google maps routing algorithm", type: "SYSTEM_DESIGN" }],
          reports: [{ id: "r1", role: "SDE 2", company: { name: "Google" } }]
        });
      } else {
        setResults({ companies: [], questions: [], reports: [] });
      }
    } finally {
      setLoading(false);
    }
  }

  const hasResults = results.companies.length > 0 || results.questions.length > 0 || results.reports.length > 0;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12 max-w-4xl mx-auto w-full px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-400" />
          <input
            type="text"
            placeholder="Search companies, questions, or topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-dark-900 border-2 border-white/[0.08] focus:border-brand-500/50 rounded-2xl py-6 pl-16 pr-6 text-xl text-white placeholder-slate-500 outline-none transition-all shadow-xl shadow-black/20"
            autoFocus
          />
          {loading && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          )}
        </motion.div>

        {query.length >= 2 && !loading && !hasResults && (
          <div className="text-center py-20 text-slate-400">
            No results found for "{query}". Try adjusting your search terms.
          </div>
        )}

        {query.length < 2 && (
          <div className="text-center py-20 text-slate-500">
            Type at least 2 characters to begin searching the intelligence database.
          </div>
        )}

        <div className="space-y-8">
          {/* Companies */}
          {results.companies.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <Building2 className="w-4 h-4" /> <h2 className="font-semibold text-sm">Companies</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.companies.map((c) => (
                  <Link key={c.slug} href={`/companies/${c.slug}`} className="glass-card-hover p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">{c.name.charAt(0)}</div>
                      <span className="text-white font-medium group-hover:text-brand-300 transition-colors">{c.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Questions */}
          {results.questions.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <Code2 className="w-4 h-4" /> <h2 className="font-semibold text-sm">Questions</h2>
              </div>
              <div className="space-y-3">
                {results.questions.map((q) => (
                  <Link key={q.id} href={`/questions/${q.id}`} className="glass-card-hover p-4 flex items-center justify-between group">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-white text-sm font-medium truncate group-hover:text-brand-300 transition-colors">{q.text}</p>
                      <span className="text-slate-500 text-xs mt-1 block">{q.type?.replace("_", " ")}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reports */}
          {results.reports.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <FileText className="w-4 h-4" /> <h2 className="font-semibold text-sm">Reports</h2>
              </div>
              <div className="space-y-3">
                {results.reports.map((r) => (
                  <Link key={r.id} href={`/reports/${r.id}`} className="glass-card-hover p-4 flex items-center justify-between group">
                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-brand-300 transition-colors">
                        {r.company?.name} — {r.role}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
