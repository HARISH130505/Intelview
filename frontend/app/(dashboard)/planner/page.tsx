"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Sparkles, ChevronRight, CheckCircle, Clock, BookOpen, Code2, Star, Loader2 } from "lucide-react";
import { plannerAPI, companiesAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Flipkart", "Zoho", "Walmart", "Nvidia", "Tesla"];
const ROLES = ["Software Engineer", "Senior Software Engineer", "Staff Engineer", "Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Data Engineer", "ML Engineer"];
const EXPERIENCE_LEVELS = [
  { value: "fresher", label: "Fresher (0-1 yr)" },
  { value: "junior", label: "Junior (1-3 yrs)" },
  { value: "mid", label: "Mid-Level (3-6 yrs)" },
  { value: "senior", label: "Senior (6+ yrs)" },
];

function DayCard({ day, plan, index }: { day: any; plan: any; index: number }) {
  const [expanded, setExpanded] = useState(index < 2);
  const TaskIcon = { study: BookOpen, practice: Code2, review: CheckCircle, mock: Star }[day.tasks?.[0]?.type as "study" | "practice" | "review" | "mock"] || BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0 border border-brand-500/20">
          <span className="text-brand-400 font-bold text-sm">{day.day}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{day.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-slate-500 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {day.estimatedHours}h
            </span>
            <div className="flex gap-1">
              {day.topics?.slice(0, 3).map((t: string) => (
                <span key={t} className="badge badge-brand text-xs">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <ChevronRight className={cn("w-4 h-4 text-slate-600 transition-transform", expanded && "rotate-90")} />
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="border-t border-white/[0.06] p-4 space-y-2"
        >
          {(day.tasks || []).map((task: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-dark-800/50">
              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold",
                task.type === "study" ? "bg-brand-500/20 text-brand-400" :
                task.type === "practice" ? "bg-violet-500/20 text-violet-400" :
                task.type === "review" ? "bg-emerald-500/20 text-emerald-400" :
                "bg-amber-500/20 text-amber-400"
              )}>
                {task.type?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-slate-300 text-xs">{task.description}</p>
                <p className="text-slate-600 text-xs mt-0.5">{task.duration} min</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function PlannerPage() {
  const [form, setForm] = useState({
    companyName: "Google",
    role: "Software Engineer",
    experienceLevel: "fresher",
    availableDays: 30,
    dailyHours: 4,
  });
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const data = await plannerAPI.generate(form);
      setRoadmap(data.roadmap || data.plan?.generatedPlan);
      toast.success("Study plan generated!");
    } catch {
      // Demo roadmap
      const days = Array.from({ length: Math.min(form.availableDays, 10) }, (_, i) => {
        const topics = [
          ["Arrays", "Two Pointers"],
          ["Strings", "Sliding Window"],
          ["Linked Lists", "Fast & Slow Pointers"],
          ["Trees", "DFS/BFS"],
          ["Binary Search"],
          ["Dynamic Programming Intro", "Memoization"],
          ["Graphs", "Shortest Path"],
          ["Heaps", "Priority Queues"],
          ["System Design Basics"],
          ["Behavioral STAR Method"],
        ];
        return {
          day: i + 1,
          title: `Day ${i + 1}: ${topics[i]?.[0] || "Review & Practice"}`,
          topics: topics[i] || ["Review"],
          tasks: [
            { type: "study", description: `Study ${topics[i]?.[0]} theory and patterns`, duration: 45 },
            { type: "practice", description: `Solve 3-5 LeetCode problems`, duration: 90 },
            { type: "review", description: "Review solutions and note key patterns", duration: 25 },
          ],
          estimatedHours: form.dailyHours,
        };
      });
      setRoadmap({ totalDays: form.availableDays, overview: `Personalized plan for ${form.companyName} ${form.role} interview`, days, milestones: [], tips: ["Focus on understanding patterns", "Practice timed coding"] });
      toast.success("Study plan generated (demo mode)!");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
          <Map className="w-3.5 h-3.5" /> AI-Powered Planning
        </div>
        <h1 className="text-3xl font-black font-display text-white mb-1">AI Study Planner</h1>
        <p className="text-slate-400">Get a personalized day-by-day preparation roadmap tailored to your target company and role</p>
      </motion.div>

      {/* Config Form */}
      {!roadmap && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 max-w-2xl">
          <h2 className="text-white font-bold font-display text-xl mb-6">Tell us your goal</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Target Company</label>
                <select
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="input-dark"
                >
                  {COMPANIES.map((c) => <option key={c} value={c} className="bg-dark-800">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Target Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-dark"
                >
                  {ROLES.map((r) => <option key={r} value={r} className="bg-dark-800">{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-medium mb-2 block">Experience Level</label>
              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp.value}
                    onClick={() => setForm({ ...form, experienceLevel: exp.value })}
                    className={cn(
                      "p-3 rounded-xl text-sm font-medium border transition-all",
                      form.experienceLevel === exp.value
                        ? "bg-brand-500/20 text-brand-400 border-brand-500/30"
                        : "text-slate-400 border-white/[0.06] hover:border-white/[0.12]"
                    )}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">
                  Available Days: <span className="text-white">{form.availableDays}</span>
                </label>
                <input
                  type="range" min={7} max={90} step={1}
                  value={form.availableDays}
                  onChange={(e) => setForm({ ...form, availableDays: parseInt(e.target.value) })}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-slate-600 text-xs mt-1">
                  <span>7d</span><span>90d</span>
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">
                  Daily Study Hours: <span className="text-white">{form.dailyHours}h</span>
                </label>
                <input
                  type="range" min={1} max={10} step={0.5}
                  value={form.dailyHours}
                  onChange={(e) => setForm({ ...form, dailyHours: parseFloat(e.target.value) })}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-slate-600 text-xs mt-1">
                  <span>1h</span><span>10h</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-brand w-full py-4 text-base justify-center"
            >
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating with Gemini AI...</> : <><Sparkles className="w-4 h-4" /> Generate My Study Plan</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* Roadmap Display */}
      {roadmap && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Overview */}
          <div className="gradient-border">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-brand-500/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-white mb-2">
                    {form.companyName} — {form.role} Plan
                  </h2>
                  <p className="text-slate-400 text-sm">{roadmap.overview}</p>
                  <div className="flex gap-4 mt-3">
                    <span className="badge badge-emerald">{roadmap.totalDays} Days</span>
                    <span className="badge badge-brand">{form.dailyHours}h/day</span>
                    <span className="badge badge-violet">{form.experienceLevel}</span>
                  </div>
                </div>
                <button
                  onClick={() => setRoadmap(null)}
                  className="btn-ghost text-sm py-2 px-3 flex-shrink-0"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          {/* Tips */}
          {roadmap.tips?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-white font-bold font-display mb-3">💡 Pro Tips</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roadmap.tips.map((tip: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day-by-Day Plan */}
          <div>
            <h3 className="text-white font-bold font-display text-lg mb-4">Day-by-Day Plan</h3>
            <div className="space-y-2">
              {(roadmap.days || []).map((day: any, i: number) => (
                <DayCard key={i} day={day} plan={roadmap} index={i} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
