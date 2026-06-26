"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Code2, Search, Filter, TrendingUp } from "lucide-react";
import { questionsAPI } from "@/lib/api";
import { cn, getDifficultyColor, truncate } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const DIFFICULTIES = ["All", "EASY", "MEDIUM", "HARD", "VERY_HARD"];
const TYPES = ["All", "CODING", "BEHAVIORAL", "SYSTEM_DESIGN", "CORE_CS", "APTITUDE"];

const MOCK_QUESTIONS = [
  { id: "1", text: "Design a URL Shortener like bit.ly", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 234, topics: [{ topic: { name: "System Design" } }, { topic: { name: "Databases" } }], companyQuestions: [{ company: { name: "Google", slug: "google" } }, { company: { name: "Amazon", slug: "amazon" } }] },
  { id: "2", text: "Merge K sorted linked lists", difficulty: "HARD", type: "CODING", frequency: 198, topics: [{ topic: { name: "Linked Lists" } }, { topic: { name: "Heap" } }], companyQuestions: [{ company: { name: "Amazon", slug: "amazon" } }, { company: { name: "Microsoft", slug: "microsoft" } }] },
  { id: "3", text: "LRU Cache Implementation", difficulty: "MEDIUM", type: "CODING", frequency: 187, topics: [{ topic: { name: "Hash Map" } }, { topic: { name: "Doubly Linked List" } }], companyQuestions: [{ company: { name: "Google", slug: "google" } }, { company: { name: "Meta", slug: "meta" } }] },
  { id: "4", text: "Find all permutations of a string", difficulty: "MEDIUM", type: "CODING", frequency: 156, topics: [{ topic: { name: "Backtracking" } }, { topic: { name: "Recursion" } }], companyQuestions: [{ company: { name: "Microsoft", slug: "microsoft" } }] },
  { id: "5", text: "Design a Rate Limiter", difficulty: "HARD", type: "SYSTEM_DESIGN", frequency: 143, topics: [{ topic: { name: "System Design" } }, { topic: { name: "Algorithms" } }], companyQuestions: [{ company: { name: "Stripe", slug: "stripe" } }, { company: { name: "Netflix", slug: "netflix" } }] },
  { id: "6", text: "Tell me about a time you had to persuade someone", difficulty: "MEDIUM", type: "BEHAVIORAL", frequency: 132, topics: [{ topic: { name: "Leadership" } }, { topic: { name: "Communication" } }], companyQuestions: [{ company: { name: "Amazon", slug: "amazon" } }, { company: { name: "Google", slug: "google" } }] },
  { id: "7", text: "Binary Tree Maximum Path Sum", difficulty: "HARD", type: "CODING", frequency: 128, topics: [{ topic: { name: "Trees" } }, { topic: { name: "Dynamic Programming" } }], companyQuestions: [{ company: { name: "Meta", slug: "meta" } }] },
  { id: "8", text: "Explain CAP Theorem", difficulty: "MEDIUM", type: "CORE_CS", frequency: 115, topics: [{ topic: { name: "Distributed Systems" } }], companyQuestions: [{ company: { name: "Google", slug: "google" } }, { company: { name: "Amazon", slug: "amazon" } }] },
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [type, setType] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(fetchQuestions, 300);
    return () => clearTimeout(timer);
  }, [search, difficulty, type]);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (difficulty !== "All") params.difficulty = difficulty;
      if (type !== "All") params.type = type;
      const data = await questionsAPI.getAll(params);
      if (data.questions?.length > 0) setQuestions(data.questions);
    } catch {} finally { setLoading(false); }
  }

  const filtered = MOCK_QUESTIONS.filter(q => {
    const ms = !search || q.text.toLowerCase().includes(search.toLowerCase());
    const md = difficulty === "All" || q.difficulty === difficulty;
    const mt = type === "All" || q.type === type;
    return ms && md && mt;
  });

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="pt-16">
        <div className="border-b border-white/[0.06] bg-dark-900/50 relative">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
              <Code2 className="w-3.5 h-3.5" /> 50K+ Questions Indexed
            </div>
            <h1 className="text-4xl font-black font-display text-white mb-2">Question Intelligence</h1>
            <p className="text-slate-400">Every question from real interviews, organized and analyzed</p>
            <div className="mt-6 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-12 py-4" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-500 text-sm mr-1">Difficulty:</span>
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", difficulty === d ? "bg-brand-500/20 text-brand-400 border-brand-500/30" : "text-slate-400 border-white/[0.06] hover:border-white/[0.12]")}>{d}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-500 text-sm mr-1">Type:</span>
              {TYPES.map(t => (
                <button key={t} onClick={() => setType(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", type === t ? "bg-violet-500/20 text-violet-400 border-violet-500/30" : "text-slate-400 border-white/[0.06] hover:border-white/[0.12]")}>{t.replace("_"," ")}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((q, i) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/questions/${q.id}`} className="glass-card-hover p-5 flex items-center gap-5 group">
                  <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-slate-600 text-sm font-bold group-hover:bg-violet-500/20 group-hover:text-violet-400 transition-all flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium group-hover:text-violet-300 transition-colors">{q.text}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {q.topics?.slice(0, 3).map((qt: any) => (
                        <span key={qt.topic.name} className="tag text-xs">{qt.topic.name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      {q.companyQuestions?.slice(0, 2).map((cq: any) => (
                        <span key={cq.company.slug} className="badge badge-brand text-xs mr-1">{cq.company.name}</span>
                      ))}
                    </div>
                    <span className={cn("badge text-xs", getDifficultyColor(q.difficulty))}>{q.difficulty}</span>
                    <div className="text-right hidden md:block">
                      <div className="text-white text-sm font-semibold">{q.frequency}x</div>
                      <div className="text-slate-600 text-xs">asked</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
