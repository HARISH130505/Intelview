"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Plus,
  Trash2,
  Send,
  AlertCircle,
  Loader2,
  Lock,
  Layers,
  Code2,
  Lightbulb,
} from "lucide-react";
import { reportsAPI, companiesAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

const POPULAR_COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Uber",
  "Flipkart",
  "Netflix",
  "Atlassian",
  "Adobe",
];

const COMMON_ROLES = [
  "SDE-1",
  "SDE-2",
  "Senior SDE",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Machine Learning Engineer",
  "Data Engineer",
];

const ROUND_TYPES = [
  "ONLINE_ASSESSMENT",
  "PHONE_SCREEN",
  "TECHNICAL",
  "SYSTEM_DESIGN",
  "BEHAVIORAL",
  "HR",
];

export default function SubmitReportPage() {
  const router = useRouter();

  // Company options
  const [dbCompanies, setDbCompanies] = useState<any[]>([]);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [role, setRole] = useState("SDE-1");
  const [location, setLocation] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [offerStatus, setOfferStatus] = useState("ACCEPTED");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [yearsExp, setYearsExp] = useState<number | "">("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Structured Rounds and Questions
  const [rounds, setRounds] = useState<
    Array<{ roundNumber: number; type: string; description: string; duration: number }>
  >([]);
  const [questions, setQuestions] = useState<
    Array<{ text: string; type: string; difficulty: string; topics: string[] }>
  >([]);
  const [extractedTips, setExtractedTips] = useState<string[]>([]);

  // UI state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing companies
  useEffect(() => {
    companiesAPI
      .getAll({ limit: 50 })
      .then((data) => {
        if (data.companies) {
          setDbCompanies(data.companies);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectCompany = (comp: { id: string; name: string }) => {
    setSelectedCompanyId(comp.id);
    setCompanyName(comp.name);
  };

  // AI Extraction handler
  const handleAIExtract = async () => {
    if (!experience || experience.trim().length < 25) {
      setError("Please write at least a couple of sentences about your interview before analyzing.");
      return;
    }

    setError(null);
    setIsExtracting(true);

    try {
      const res = await reportsAPI.extractAI(experience);
      if (res.success && res.extracted) {
        const ext = res.extracted;

        if (ext.company && !companyName) {
          setCompanyName(ext.company);
        }
        if (ext.role && !role) {
          setRole(ext.role);
        }
        if (ext.difficulty) {
          setDifficulty(ext.difficulty);
        }
        if (ext.offerStatus && ext.offerStatus !== "UNKNOWN") {
          setOfferStatus(ext.offerStatus);
        }
        if (ext.yearsOfExperience && !yearsExp) {
          setYearsExp(ext.yearsOfExperience);
        }

        if (ext.rounds && ext.rounds.length > 0) {
          setRounds(
            ext.rounds.map((r: any, idx: number) => ({
              roundNumber: r.roundNumber || idx + 1,
              type: r.type || "TECHNICAL",
              description: r.description || "",
              duration: r.duration || 60,
            }))
          );
        }

        if (ext.questions && ext.questions.length > 0) {
          setQuestions(
            ext.questions.map((q: any) => ({
              text: q.text || "",
              type: q.type || "CODING",
              difficulty: q.difficulty || "MEDIUM",
              topics: q.topics || [],
            }))
          );
        }

        if (ext.tips && ext.tips.length > 0) {
          setExtractedTips(ext.tips);
        }

        setExtractedSuccess(true);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to extract details with AI. You can still fill out the form manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Add Round Manually
  const handleAddRound = () => {
    setRounds([
      ...rounds,
      {
        roundNumber: rounds.length + 1,
        type: "TECHNICAL",
        description: "",
        duration: 45,
      },
    ]);
  };

  // Remove Round
  const handleRemoveRound = (idx: number) => {
    const updated = rounds.filter((_, i) => i !== idx).map((r, i) => ({ ...r, roundNumber: i + 1 }));
    setRounds(updated);
  };

  // Add Question Manually
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "CODING",
        difficulty: "MEDIUM",
        topics: [],
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      setError("Please select or enter the company name.");
      return;
    }
    if (!role.trim()) {
      setError("Please enter the role interviewed for.");
      return;
    }
    if (!experience.trim()) {
      setError("Please provide your interview experience notes.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        companyId: selectedCompanyId || undefined,
        companyName: companyName.trim(),
        role: role.trim(),
        location: location.trim() || undefined,
        interviewDate: interviewDate || undefined,
        difficulty,
        offerStatus,
        rawText: experience.trim(),
        experience: experience.trim(),
        salary: salary.trim() || undefined,
        yearsExp: yearsExp !== "" ? Number(yearsExp) : undefined,
        isAnonymous,
        rounds: rounds.length > 0 ? rounds : undefined,
        questions: questions.length > 0 ? questions : undefined,
      };

      const res = await reportsAPI.submit(payload);

      if (res.success && res.report?.id) {
        router.push(`/reports/${res.report.id}`);
      } else {
        router.push("/reports");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit interview report. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Interview Reports
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Community Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Share Interview Experience
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Help engineers crack top tech interviews. Your report auto-extracts rounds and questions for the community.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Company & Role Information */}
        <div className="glass-card p-5 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
            <Building2 className="w-5 h-5 text-brand-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Company & Role Overview
            </h2>
          </div>

          {/* Company Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Company Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Google, Amazon, Uber, or type any company..."
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  const matched = dbCompanies.find(
                    (c) => c.name.toLowerCase() === e.target.value.toLowerCase()
                  );
                  setSelectedCompanyId(matched ? matched.id : "");
                }}
                className="input-dark pl-10 text-xs sm:text-sm"
                required
              />
            </div>

            {/* Popular quick chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              <span className="text-[11px] text-slate-500 mr-1">Popular:</span>
              {POPULAR_COMPANIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    const matched = dbCompanies.find((item) => item.name.toLowerCase() === c.toLowerCase());
                    if (matched) {
                      handleSelectCompany(matched);
                    } else {
                      setCompanyName(c);
                      setSelectedCompanyId("");
                    }
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                    companyName.toLowerCase() === c.toLowerCase()
                      ? "bg-brand-500/20 border-brand-500/50 text-brand-300"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Role & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Job Role / Title <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. SDE-1, Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-dark pl-10 text-xs sm:text-sm"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_ROLES.slice(0, 4).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded border transition-all",
                      role === r
                        ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                        : "bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Location / Remote
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, Seattle, Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-dark pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Interview Date & Experience Level & CTC */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Interview Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="input-dark pl-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="30"
                placeholder="e.g. 2"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value === "" ? "" : Number(e.target.value))}
                className="input-dark text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Offered CTC / Salary (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 28 LPA, $180k"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="input-dark text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Difficulty & Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Interview Difficulty
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "EASY", label: "Easy", color: "text-emerald-400 border-emerald-500/30" },
                  { value: "MEDIUM", label: "Medium", color: "text-amber-400 border-amber-500/30" },
                  { value: "HARD", label: "Hard", color: "text-orange-400 border-orange-500/30" },
                  { value: "VERY_HARD", label: "Brutal", color: "text-rose-400 border-rose-500/30" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDifficulty(item.value)}
                    className={cn(
                      "py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all",
                      difficulty === item.value
                        ? `bg-white/[0.08] ${item.color} shadow-lg shadow-black/40`
                        : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Offer Status */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Offer Outcome
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "ACCEPTED", label: "Offer Received", icon: CheckCircle2, color: "text-emerald-400" },
                  { value: "REJECTED", label: "No Offer", icon: XCircle, color: "text-rose-400" },
                  { value: "PENDING", label: "Pending", icon: Clock, color: "text-amber-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setOfferStatus(item.value)}
                      className={cn(
                        "py-2 px-2 flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold border transition-all",
                        offerStatus === item.value
                          ? `bg-white/[0.08] ${item.color} border-current shadow-lg`
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[11px] truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Narrative & AI Auto-Extractor */}
        <div className="glass-card p-5 sm:p-7 space-y-5 relative overflow-hidden">
          {/* Subtle gradient corner glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-400" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Interview Story & Notes
                </h2>
              </div>
              <p className="text-slate-400 text-xs">
                Write freely about the rounds, questions asked, DSA topics, interviewer vibes, and insider tips.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAIExtract}
              disabled={isExtracting || !experience.trim()}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg",
                experience.trim()
                  ? "bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white shadow-brand-500/20 active:scale-95"
                  : "bg-white/[0.05] text-slate-500 cursor-not-allowed border border-white/[0.05]"
              )}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Auto-Extract Rounds</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <textarea
              rows={7}
              placeholder={`Describe your interview experience... For example:
- Round 1 (Online Assessment): 2 questions on HackerRank. One was finding max subarray sum with modulo, second was LRU Cache.
- Round 2 (Technical): 45 mins. Asked about Binary Tree Zigzag level order traversal, followed by explaining database indexes and isolation levels.
- Round 3 (System Design): Design TinyURL with 10M daily clicks. Discussed hashing vs auto-increment, caching with Redis.
- Tips: Focus heavily on edge cases, and clarify requirements before coding!`}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="input-dark w-full text-xs sm:text-sm leading-relaxed p-4 resize-y font-mono"
              required
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Markdown supported</span>
              <span>{experience.length} characters</span>
            </div>
          </div>

          {extractedSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Successfully extracted <strong>{rounds.length} rounds</strong> and <strong>{questions.length} questions</strong>! You can review and tweak them below.
                </span>
              </div>
            </motion.div>
          )}

          {/* AI Tips Preview */}
          {extractedTips.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Lightbulb className="w-4 h-4" />
                <span>Extracted Insider Tips</span>
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-300">
                {extractedTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Section 3: Structured Rounds Preview & Customization */}
        <div className="glass-card p-5 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Interview Rounds Breakdown ({rounds.length})
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Each round will appear on the interview timeline for other candidates.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRound}
              className="btn-glass text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Round
            </button>
          </div>

          {rounds.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] space-y-2">
              <p className="text-slate-400 text-xs">
                No structured rounds added yet. Click &quot;AI Auto-Extract Rounds&quot; above or add them manually.
              </p>
              <button
                type="button"
                onClick={handleAddRound}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                + Add Round 1
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rounds.map((round, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold flex items-center justify-center">
                        {round.roundNumber}
                      </span>
                      <span className="text-xs font-bold text-white">
                        Round {round.roundNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Round Type Selector */}
                      <select
                        value={round.type}
                        onChange={(e) => {
                          const updated = [...rounds];
                          updated[idx].type = e.target.value;
                          setRounds(updated);
                        }}
                        className="bg-slate-900/80 border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                      >
                        {ROUND_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>

                      {/* Duration input */}
                      <input
                        type="number"
                        min="15"
                        max="180"
                        placeholder="Mins"
                        value={round.duration}
                        onChange={(e) => {
                          const updated = [...rounds];
                          updated[idx].duration = Number(e.target.value);
                          setRounds(updated);
                        }}
                        className="w-16 bg-slate-900/80 border border-white/[0.1] rounded-lg px-2 py-1 text-xs text-slate-200 text-center"
                      />
                      <span className="text-[11px] text-slate-500">min</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveRound(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                        title="Delete round"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Brief summary of what happened in this round..."
                    value={round.description}
                    onChange={(e) => {
                      const updated = [...rounds];
                      updated[idx].description = e.target.value;
                      setRounds(updated);
                    }}
                    className="input-dark text-xs w-full py-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Extracted Questions for Question Bank */}
        <div className="glass-card p-5 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                Questions Asked ({questions.length})
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                These questions will be automatically added to the Question Bank under this company!
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="btn-glass text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] space-y-2">
              <p className="text-slate-400 text-xs">
                No individual questions specified yet. Questions will be extracted automatically on submission.
              </p>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                + Add a question manually
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <input
                      type="text"
                      placeholder="e.g. Implement LRU Cache or Design Netflix Recommendation Service"
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].text = e.target.value;
                        setQuestions(updated);
                      }}
                      className="input-dark text-xs sm:text-sm flex-1 font-mono"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].type = e.target.value;
                        setQuestions(updated);
                      }}
                      className="bg-slate-900/80 border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-slate-200"
                    >
                      <option value="CODING">Coding / DSA</option>
                      <option value="SYSTEM_DESIGN">System Design</option>
                      <option value="BEHAVIORAL">Behavioral</option>
                      <option value="CORE_CS">Core CS</option>
                      <option value="HR">HR</option>
                    </select>

                    <select
                      value={q.difficulty}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].difficulty = e.target.value;
                        setQuestions(updated);
                      }}
                      className="bg-slate-900/80 border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-slate-200"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Topics (comma separated, e.g. Array, DP)"
                      value={q.topics.join(", ")}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].topics = e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setQuestions(updated);
                      }}
                      className="input-dark text-xs py-1 px-2.5 max-w-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Anonymous & Submit */}
        <div className="glass-card p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-brand-500 focus:ring-brand-500 bg-slate-900"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Post as Anonymous Engineer
              </div>
              <p className="text-[11px] text-slate-400">
                Your name and profile avatar will not be visible on this experience report.
              </p>
            </div>
          </label>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/reports"
              className="btn-glass text-xs sm:text-sm py-2.5 px-4 flex-1 sm:flex-initial text-center"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-brand text-xs sm:text-sm py-2.5 px-6 flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish Experience</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
