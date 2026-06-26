"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bookmark, Code2, Building2, FileText, Map, Star, Trash2 } from "lucide-react";
import { bookmarksAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = [
  { key: "QUESTION", label: "Questions", icon: Code2 },
  { key: "COMPANY", label: "Companies", icon: Building2 },
  { key: "REPORT", label: "Reports", icon: FileText },
  { key: "ROADMAP", label: "Study Plans", icon: Map },
];

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("QUESTION");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarksAPI.getAll().then(d => setBookmarks(d.bookmarks || [])).catch(() => {
      setBookmarks([
        { id: "1", type: "QUESTION", question: { id: "1", text: "Design a URL Shortener", difficulty: "HARD", type: "SYSTEM_DESIGN", topics: [{ topic: { name: "System Design" } }] } },
        { id: "2", type: "COMPANY", company: { id: "1", name: "Google", slug: "google", tier: "FAANG" } },
      ]);
    }).finally(() => setLoading(false));
  }, []);

  async function removeBookmark(id: string) {
    await bookmarksAPI.remove(id).catch(() => {});
    setBookmarks(prev => prev.filter(b => b.id !== id));
    toast.success("Bookmark removed");
  }

  const filtered = bookmarks.filter(b => b.type === activeTab);
  const counts = TABS.reduce((acc, t) => ({ ...acc, [t.key]: bookmarks.filter(b => b.type === t.key).length }), {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black font-display text-white mb-1">Bookmarks</h1>
        <p className="text-slate-400">Your saved questions, companies, reports, and study plans</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-dark-900/50 rounded-xl w-fit border border-white/[0.06]">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key ? "bg-brand-500/20 text-brand-400 border border-brand-500/20" : "text-slate-500 hover:text-slate-300"
            )}>
              <Icon className="w-4 h-4" />
              {tab.label}
              {counts[tab.key] > 0 && <span className="badge badge-brand text-xs">{counts[tab.key]}</span>}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <Bookmark className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No {activeTab.toLowerCase()} bookmarks yet</p>
          <p className="text-slate-600 text-sm mt-1">Save items while browsing to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bookmark, i) => (
            <motion.div key={bookmark.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                {bookmark.type === "QUESTION" && bookmark.question && (
                  <>
                    <Link href={`/questions/${bookmark.question.id}`} className="text-white font-medium text-sm hover:text-brand-300 transition-colors line-clamp-1">
                      {bookmark.question.text}
                    </Link>
                    <div className="flex gap-2 mt-1">
                      <span className="badge badge-violet text-xs">{bookmark.question.difficulty}</span>
                      {bookmark.question.topics?.slice(0, 2).map((qt: any) => (
                        <span key={qt.topic.name} className="tag text-xs">{qt.topic.name}</span>
                      ))}
                    </div>
                  </>
                )}
                {bookmark.type === "COMPANY" && bookmark.company && (
                  <Link href={`/companies/${bookmark.company.slug}`} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                      {bookmark.company.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm hover:text-brand-300 transition-colors">{bookmark.company.name}</p>
                      <span className="badge badge-amber text-xs">{bookmark.company.tier}</span>
                    </div>
                  </Link>
                )}
              </div>
              <button onClick={() => removeBookmark(bookmark.id)} className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
