"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Map,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Code2,
  Star,
  RefreshCcw,
  Building2,
  Briefcase,
  Layers,
  Calendar,
  Award,
  ExternalLink,
  Play,
  CheckSquare,
  Square,
  ListOrdered,
  Plus,
} from "lucide-react";
import { plannerAPI, companiesAPI } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const DEFAULT_COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Flipkart",
  "Uber",
  "Atlassian",
  "Adobe",
];

const ROLES = [
  "SDE-1",
  "SDE-2",
  "Software Engineer",
  "Senior Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Engineer",
];

const EXPERIENCE_LEVELS = [
  { value: "fresher", label: "Fresher (0-1 yr)" },
  { value: "junior", label: "Junior (1-3 yrs)" },
  { value: "mid", label: "Mid-Level (3-6 yrs)" },
  { value: "senior", label: "Senior (6+ yrs)" },
];

function DayCard({
  day,
  index,
  completedTasks,
  onToggleTask,
  companyName,
  role,
}: {
  day: any;
  index: number;
  completedTasks: Set<string>;
  onToggleTask: (taskId: string) => void;
  companyName: string;
  role: string;
}) {
  const [expanded, setExpanded] = useState(index < 2);
  const tasks = day.tasks || [];
  const dayDoneCount = tasks.filter((t: any, i: number) =>
    completedTasks.has(`d${day.day}-t${i}`)
  ).length;
  const isDayComplete = tasks.length > 0 && dayDoneCount === tasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25) }}
      className={cn(
        "glass-card overflow-hidden transition-all",
        isDayComplete && "border-emerald-500/30 bg-emerald-500/[0.02]"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm border transition-all",
            isDayComplete
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-brand-500/20 text-brand-400 border-brand-500/30"
          )}
        >
          {isDayComplete ? <CheckCircle2 className="w-5 h-5" /> : `D${day.day}`}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-bold text-sm sm:text-base truncate">
              {day.title}
            </p>
            {isDayComplete && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Completed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" /> {day.estimatedHours || 3}h
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">
              {dayDoneCount}/{tasks.length} tasks done
            </span>
            <div className="flex gap-1 flex-wrap pl-1">
              {day.topics?.slice(0, 3).map((t: string) => (
                <span key={t} className="badge badge-brand text-[10px]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <ChevronRight
          className={cn(
            "w-4 h-4 text-slate-500 transition-transform flex-shrink-0",
            expanded && "rotate-90"
          )}
        />
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="border-t border-white/[0.06] p-4 sm:p-5 space-y-3 bg-dark-900/40"
        >
          {tasks.map((task: any, i: number) => {
            const taskId = `d${day.day}-t${i}`;
            const isDone = completedTasks.has(taskId);

            return (
              <div
                key={i}
                onClick={() => onToggleTask(taskId)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                  isDone
                    ? "bg-emerald-500/[0.04] border-emerald-500/20 text-slate-400"
                    : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] text-slate-200"
                )}
              >
                <div className="mt-0.5 text-slate-400 hover:text-brand-400 flex-shrink-0">
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
                    task.type === "study"
                      ? "bg-brand-500/20 text-brand-400"
                      : task.type === "practice"
                      ? "bg-violet-500/20 text-violet-400"
                      : task.type === "review"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  )}
                >
                  {task.type?.[0]?.toUpperCase() || "T"}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs sm:text-sm leading-relaxed",
                      isDone && "line-through text-slate-500"
                    )}
                  >
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-[11px]">
                      {task.duration || 30} mins
                    </span>
                    {task.difficulty && (
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        • {task.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                {task.type === "practice" && (
                  <Link
                    href={`/questions?company=${encodeURIComponent(companyName.toLowerCase())}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-brand-300 text-xs flex items-center gap-1 flex-shrink-0"
                    title="Practice matching questions"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Practice</span>
                  </Link>
                )}
              </div>
            );
          })}

          {/* Day Actions */}
          <div className="pt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
            <span>
              Resources: {day.resources?.join(", ") || "LeetCode, NeetCode"}
            </span>
            <Link
              href={`/mock-interview?company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(role)}`}
              className="text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Test yourself with Mock</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function PlannerContent() {
  const searchParams = useSearchParams();

  const [dbCompanies, setDbCompanies] = useState<any[]>([]);
  const [userPlans, setUserPlans] = useState<any[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const [form, setForm] = useState({
    companyName: searchParams.get("company") || "Google",
    role: searchParams.get("role") || "SDE-1",
    experienceLevel: "fresher",
    availableDays: 30,
    dailyHours: 4,
  });

  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Load companies & previous user plans
  useEffect(() => {
    companiesAPI
      .getAll({ limit: 40 })
      .then((d) => {
        if (d.companies) setDbCompanies(d.companies);
      })
      .catch(() => {});

    plannerAPI
      .getAll()
      .then((d) => {
        if (d.plans && d.plans.length > 0) {
          setUserPlans(d.plans);
          // Set the first plan as active if no search param
          if (!searchParams.get("company")) {
            const first = d.plans[0];
            setActivePlanId(first.id);
            setRoadmap(first.generatedPlan);
            setForm({
              companyName: first.company?.name || first.role,
              role: first.role,
              experienceLevel: first.experienceLevel || "fresher",
              availableDays: first.availableDays || 30,
              dailyHours: first.dailyHours || 4,
            });
          }
        }
      })
      .catch(() => {});
  }, [searchParams]);

  // Handle task toggle
  const handleToggleTask = (taskId: string) => {
    const updated = new Set(completedTasks);
    if (updated.has(taskId)) {
      updated.delete(taskId);
    } else {
      updated.add(taskId);
    }
    setCompletedTasks(updated);

    // Calculate progress
    const totalTasks =
      roadmap?.days?.reduce((sum: number, d: any) => sum + (d.tasks?.length || 0), 0) || 1;
    const progress = Math.round((updated.size / totalTasks) * 100);

    if (activePlanId) {
      plannerAPI.updateProgress(activePlanId, progress).catch(() => {});
    }
  };

  // Generate Plan
  async function handleGenerate() {
    setGenerating(true);
    try {
      const data = await plannerAPI.generate(form);
      const generated = data.roadmap || data.plan?.generatedPlan;
      setRoadmap(generated);
      if (data.plan?.id) {
        setActivePlanId(data.plan.id);
        setUserPlans([data.plan, ...userPlans]);
      }
      setCompletedTasks(new Set());
      toast.success("Personalized study plan generated via Gemini AI!");
    } catch {
      // Fallback fallback roadmap
      const days = Array.from({ length: Math.min(form.availableDays, 14) }, (_, i) => {
        const topics = [
          ["Arrays", "Two Pointers"],
          ["Strings", "Sliding Window"],
          ["Linked Lists", "Fast & Slow"],
          ["Trees", "DFS & BFS"],
          ["Binary Search & Recursion"],
          ["Dynamic Programming Intro"],
          ["Graphs & Topo Sort"],
          ["System Design Essentials"],
          ["Behavioral & STAR Answers"],
          ["Mock Testing & Review"],
        ];
        return {
          day: i + 1,
          title: `Day ${i + 1}: ${topics[i % topics.length][0]}`,
          topics: topics[i % topics.length],
          tasks: [
            { type: "study", description: `Review core ${topics[i % topics.length][0]} theory and common patterns`, duration: 45 },
            { type: "practice", description: `Solve 3 recommended LeetCode problems for ${form.companyName}`, duration: 90, difficulty: "medium" },
            { type: "review", description: "Log mistakes and optimize space-time complexity", duration: 30 },
          ],
          estimatedHours: form.dailyHours,
          resources: ["LeetCode", "NeetCode 150"],
        };
      });

      setRoadmap({
        totalDays: form.availableDays,
        overview: `Intensive ${form.availableDays}-day target plan for ${form.companyName} (${form.role}). Focuses heavily on high-frequency DSA patterns, system architecture, and mock rounds.`,
        milestones: [
          { day: 7, title: "Data Structures Mastery", description: "Array, Tree & Graph patterns locked down" },
          { day: Math.floor(form.availableDays / 2), title: "Algorithm Speed", description: "DP, Greedy & System Design readiness" },
          { day: form.availableDays, title: "Interview Ready", description: "Full loops and behavioral prep complete" },
        ],
        days,
        tips: [
          "Always state time and space complexity before writing code.",
          "Clarify edge cases before beginning implementation.",
          "Use active recall and spaced repetition for tricky DP recurrences.",
        ],
      });
      toast.success("Study roadmap ready!");
    } finally {
      setGenerating(false);
    }
  }

  const totalTasks =
    roadmap?.days?.reduce((sum: number, d: any) => sum + (d.tasks?.length || 0), 0) || 0;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks.size / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Map className="w-3.5 h-3.5" /> AI Roadmap Engine
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white">
            Study Planner
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Personalized day-by-day interview preparation roadmap generated by Gemini AI.
          </p>
        </div>

        {userPlans.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={activePlanId || ""}
              onChange={(e) => {
                const selected = userPlans.find((p) => p.id === e.target.value);
                if (selected) {
                  setActivePlanId(selected.id);
                  setRoadmap(selected.generatedPlan);
                  setForm({
                    companyName: selected.company?.name || selected.title,
                    role: selected.role,
                    experienceLevel: selected.experienceLevel || "fresher",
                    availableDays: selected.availableDays || 30,
                    dailyHours: selected.dailyHours || 4,
                  });
                }
              }}
              className="bg-slate-900 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {userPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* Config Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <h2 className="text-white font-bold font-display text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Configure Target & Timeline
          </h2>
          {roadmap && (
            <span className="text-xs text-slate-400 font-medium">
              Generating a new plan will replace the view below
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Company */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" /> Target Company
            </label>
            <input
              type="text"
              placeholder="e.g. Google, Amazon, Uber..."
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="input-dark text-xs sm:text-sm"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Target Role
            </label>
            <input
              type="text"
              placeholder="e.g. SDE-1, Backend Engineer"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input-dark text-xs sm:text-sm"
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-500" /> Experience Level
            </label>
            <select
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
              className="input-dark text-xs sm:text-sm"
            >
              {EXPERIENCE_LEVELS.map((el) => (
                <option key={el.value} value={el.value} className="bg-slate-900">
                  {el.label}
                </option>
              ))}
            </select>
          </div>

          {/* Daily Commitment */}
          <div className="space-y-1.5">
            <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Daily Commitment
            </label>
            <select
              value={form.dailyHours}
              onChange={(e) => setForm({ ...form, dailyHours: Number(e.target.value) })}
              className="input-dark text-xs sm:text-sm"
            >
              <option value={2}>2 Hours / Day</option>
              <option value={3}>3 Hours / Day</option>
              <option value={4}>4 Hours / Day</option>
              <option value={6}>6 Hours / Day</option>
              <option value={8}>8 Hours / Day (Full-Time)</option>
            </select>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Preparation Timeline
            </span>
            <span className="text-brand-400 font-bold bg-brand-500/10 px-2.5 py-0.5 rounded-lg border border-brand-500/20">
              {form.availableDays} Days Plan
            </span>
          </div>
          <input
            type="range"
            min={7}
            max={90}
            step={7}
            value={form.availableDays}
            onChange={(e) => setForm({ ...form, availableDays: parseInt(e.target.value) })}
            className="w-full accent-brand-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>1 Week (Crash Course)</span>
            <span>30 Days (Standard Prep)</span>
            <span>60 Days</span>
            <span>90 Days (Comprehensive)</span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className={cn(
            "btn-brand w-full py-3 sm:py-3.5 text-xs sm:text-sm font-semibold justify-center shadow-lg shadow-brand-500/25",
            generating && "opacity-50 cursor-not-allowed"
          )}
        >
          {generating ? (
            <>
              <RefreshCcw className="w-4 h-4 animate-spin" />
              Generating Custom Roadmap with Gemini 2.5...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate AI Study Roadmap for {form.companyName}
            </>
          )}
        </button>
      </motion.div>

      {/* Roadmap Output */}
      {roadmap && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overview & Progress Card */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                  {form.companyName} {form.role} Roadmap
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  {roadmap.overview}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/mock-interview?company=${encodeURIComponent(form.companyName)}&role=${encodeURIComponent(form.role)}`}
                  className="btn-brand text-xs sm:text-sm py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Start Mock Interview
                </Link>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Overall Completion Progress</span>
                <span className="text-brand-400">{progressPercent}%</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {completedTasks.size} of {totalTasks} tasks checked off
              </p>
            </div>

            {/* Milestones */}
            {roadmap.milestones && roadmap.milestones.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target Milestones
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roadmap.milestones.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1"
                    >
                      <span className="text-[10px] font-bold text-brand-400 block">
                        Day {m.day}
                      </span>
                      <h4 className="text-xs font-bold text-white">{m.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {m.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Day Schedule List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-brand-400" />
              Day-by-Day Schedule ({roadmap.days?.length || 0} Days)
            </h3>

            <div className="space-y-3">
              {(roadmap.days || []).map((day: any, i: number) => (
                <DayCard
                  key={day.day || i}
                  day={day}
                  index={i}
                  completedTasks={completedTasks}
                  onToggleTask={handleToggleTask}
                  companyName={form.companyName}
                  role={form.role}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
          <div className="h-8 w-48 bg-white/[0.06] rounded-lg" />
          <div className="glass-card p-8 h-80" />
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
