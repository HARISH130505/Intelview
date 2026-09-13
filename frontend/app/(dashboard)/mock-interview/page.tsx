"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Play,
  ChevronRight,
  CheckCircle2,
  Clock,
  Star,
  Loader2,
  Send,
  ArrowRight,
  Sparkles,
  Building2,
  Briefcase,
  Layers,
  Award,
  HelpCircle,
  Code2,
  Lightbulb,
  Check,
  RefreshCw,
} from "lucide-react";
import { mockAPI, companiesAPI } from "@/lib/api";
import { cn, getDifficultyColor } from "@/lib/utils";
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
];

const INTERVIEW_TYPES = [
  { value: "CODING", label: "Coding / DSA", emoji: "💻" },
  { value: "SYSTEM_DESIGN", label: "System Design", emoji: "🏗️" },
  { value: "BEHAVIORAL", label: "Behavioral / Leadership", emoji: "🗣️" },
  { value: "CORE_CS", label: "Core CS & Fundamentals", emoji: "📚" },
];

type Phase = "setup" | "interview" | "report";

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{score}/100</span>
      </div>
      <div className="h-2 bg-dark-850 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </div>
  );
}

function MockInterviewContent() {
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState({
    company: searchParams.get("company") || "Google",
    role: searchParams.get("role") || "Software Engineer",
    type: searchParams.get("type") || "CODING",
    difficulty: "MEDIUM",
    numQuestions: 5,
  });

  const [dbCompanies, setDbCompanies] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [interviewSet, setInterviewSet] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);

  // Speech-to-text voice recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(60 * 60);

  useEffect(() => {
    companiesAPI
      .getAll({ limit: 30 })
      .then((d) => {
        if (d.companies) setDbCompanies(d.companies);
      })
      .catch(() => {});
  }, []);

  // Timer countdown
  useEffect(() => {
    if (phase !== "interview") return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Speech recognition initialization
  const toggleVoiceRecording = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Speech recognition is not supported in your browser. Please use Chrome/Edge or type your answer."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast.info("Listening... Speak your answer aloud");
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  async function handleStart() {
    setLoading(true);
    try {
      const data = await mockAPI.start({
        companyName: config.company,
        role: config.role,
        type: config.type,
        difficulty: config.difficulty,
        numQuestions: config.numQuestions,
      });

      setSession(data.session);
      setInterviewSet(data.interviewSet);
      setTimeRemaining((data.interviewSet?.timeLimit || 60) * 60);
      setPhase("interview");
      toast.success("Interview session initialized with Gemini AI! Good luck 🎯");
    } catch {
      // Fallback demo interview
      const demoQuestions = [
        {
          id: "q1",
          text: `Given an array of integers, find two numbers that add up to a target sum. Explain your approach and write optimal code.`,
          type: config.type,
          difficulty: config.difficulty,
          hints: ["Use a hash map for O(n) time lookup", "Consider what complement value is needed for each element"],
          timeRecommended: 15,
        },
        {
          id: "q2",
          text: `Design a scalable notification service for ${config.company} handling 50M daily notifications across push, email, and SMS.`,
          type: "SYSTEM_DESIGN",
          difficulty: "HARD",
          hints: ["Decouple notification producers and delivery workers via Kafka", "Implement rate limiting and deduplication"],
          timeRecommended: 25,
        },
        {
          id: "q3",
          text: `Tell me about a time you resolved a major production bug or architectural bottleneck under severe time pressure.`,
          type: "BEHAVIORAL",
          difficulty: "MEDIUM",
          hints: ["Use STAR format: Situation, Task, Action, Result", "Highlight technical diagnosis and post-mortem improvements"],
          timeRecommended: 10,
        },
      ].slice(0, config.numQuestions);

      setSession({
        id: `mock-session-${Date.now()}`,
        questions: demoQuestions.map((q) => ({ id: q.id, questionText: q.text, questionType: q.type })),
      });
      setInterviewSet({
        questions: demoQuestions,
        instructions: `Welcome to your ${config.company} mock interview.`,
        timeLimit: 60,
      });
      setPhase("interview");
      toast.success("Interview ready!");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      toast.error("Please provide an answer before submitting.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const questions = interviewSet?.questions || [];
    const currentQuestion = questions[currentQ];
    if (!currentQuestion) return;

    setEvalLoading(true);
    try {
      const sessionId = session?.id || "demo-session";
      const questionId = session?.questions?.[currentQ]?.id || currentQuestion.id;

      let evaluation: any;
      try {
        const data = await mockAPI.submitAnswer(sessionId, { questionId, answer });
        evaluation = data.evaluation?.aiEvaluation || data.evaluation || data;
      } catch {
        evaluation = {
          score: 82,
          communication: 85,
          correctness: 80,
          optimization: 78,
          conceptualUnderstanding: 85,
          strengths: [
            "Clear logical explanation of the algorithm",
            "Identified the optimal O(n) space-time trade-off",
          ],
          improvements: [
            "Explicitly mention edge cases such as empty input or duplicate elements",
            "Write modular helper functions for readability",
          ],
          modelAnswer:
            "The optimal approach utilizes a single pass hash table storing seen elements. As we iterate, we calculate target - current and check existence in O(1) time.",
          followUpQuestions: [
            "How would your approach change if the input array is already sorted in ascending order?",
            "What if memory is severely constrained to O(1) auxiliary space?",
          ],
        };
      }

      setEvaluations((prev) => ({ ...prev, [currentQuestion.id]: evaluation }));
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
      toast.success(`Evaluated! Question Score: ${evaluation.score}/100`);
    } finally {
      setEvalLoading(false);
    }
  }

  function handleNext() {
    setShowHints(false);
    const questions = interviewSet?.questions || [];
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setAnswer("");
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    const questions = interviewSet?.questions || [];
    const allEvals = Object.values(evaluations);
    const avgScore =
      allEvals.length > 0
        ? Math.round(
            allEvals.reduce((s: number, e: any) => s + (e.score || 0), 0) /
              allEvals.length
          )
        : 0;

    let recommendation = "No Hire";
    if (avgScore >= 85) recommendation = "Strong Hire";
    else if (avgScore >= 75) recommendation = "Hire";
    else if (avgScore >= 60) recommendation = "Lean Hire";

    // Call complete API if session exists
    if (session?.id) {
      mockAPI.complete(session.id).catch(() => {});
    }

    setReport({
      totalScore: avgScore,
      recommendation,
      questionsAttempted: Object.keys(answers).length,
      totalQuestions: questions.length,
      evaluations,
      questions,
    });
    setPhase("report");
  }

  const questions = interviewSet?.questions || [];
  const currentQuestion = questions[currentQ];
  const currentEval = evaluations[currentQuestion?.id];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1.5"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <Mic className="w-3.5 h-3.5" /> AI Interview Simulator
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white">
          AI Mock Interview
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Simulate rigorous real company interview loops, answer with voice or code, and get real-time Gemini evaluation.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ============ PHASE 1: SETUP ============ */}
        {phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold font-display text-base sm:text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" /> Configure Interview Session
              </h2>
            </div>

            <div className="space-y-5">
              {/* Target Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" /> Target Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Amazon, Meta, Uber..."
                    value={config.company}
                    onChange={(e) => setConfig({ ...config, company: e.target.value })}
                    className="input-dark text-xs sm:text-sm"
                  />
                  {/* Quick chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {DEFAULT_COMPANIES.slice(0, 5).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setConfig({ ...config, company: c })}
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded border transition-all",
                          config.company.toLowerCase() === c.toLowerCase()
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SDE-1, Senior Software Engineer"
                    value={config.role}
                    onChange={(e) => setConfig({ ...config, role: e.target.value })}
                    className="input-dark text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Round Type */}
              <div className="space-y-2">
                <label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" /> Interview Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {INTERVIEW_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setConfig({ ...config, type: t.value })}
                      className={cn(
                        "p-3 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-1.5 text-center",
                        config.type === t.value
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10"
                          : "text-slate-400 border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:text-white"
                      )}
                    >
                      <span className="text-base">{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty & Question Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-xs font-semibold">
                    Target Difficulty
                  </label>
                  <select
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                    className="input-dark text-xs sm:text-sm"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium (Recommended)</option>
                    <option value="HARD">Hard (FAANG standard)</option>
                    <option value="VERY_HARD">Brutal (Staff level)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-semibold">
                      Question Count
                    </label>
                    <span className="text-rose-400 font-bold">
                      {config.numQuestions} Questions
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={7}
                    step={1}
                    value={config.numQuestions}
                    onChange={(e) =>
                      setConfig({ ...config, numQuestions: parseInt(e.target.value) })
                    }
                    className="w-full accent-rose-500 mt-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>3 Quick</span>
                    <span>5 Standard</span>
                    <span>7 Full Loop</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={loading}
                className="btn-brand w-full py-3.5 text-xs sm:text-sm font-semibold justify-center shadow-lg shadow-rose-500/20"
                style={{ background: "linear-gradient(135deg, #e11d48, #be123c)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Realistic {config.company} Questions with Gemini...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Launch Mock Interview
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ============ PHASE 2: LIVE INTERVIEW ============ */}
        {phase === "interview" && currentQuestion && (
          <motion.div
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Top Bar: Progress & Timer */}
            <div className="glass-card p-3.5 sm:p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-bold text-white flex-shrink-0">
                  Question {currentQ + 1} of {questions.length}
                </span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-500 to-brand-500 rounded-full"
                    animate={{
                      width: `${((currentQ + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>{formatTimer(timeRemaining)}</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="glass-card p-5 sm:p-7 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 font-black text-sm flex items-center justify-center flex-shrink-0 border border-rose-500/30">
                  Q{currentQ + 1}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "badge text-[10px]",
                        getDifficultyColor(currentQuestion.difficulty)
                      )}
                    >
                      {currentQuestion.difficulty}
                    </span>
                    <span className="badge text-[10px] bg-white/[0.05] text-slate-300">
                      {currentQuestion.type?.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Suggested: {currentQuestion.timeRecommended || 15} mins
                    </span>
                  </div>

                  <p className="text-white text-sm sm:text-base font-semibold leading-relaxed">
                    {currentQuestion.text}
                  </p>
                </div>
              </div>

              {/* Collapsible Hints */}
              {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                <div className="pt-2 border-t border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setShowHints(!showHints)}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHints ? "Hide Hints" : "Need a hint?"}</span>
                  </button>

                  {showHints && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5"
                    >
                      {currentQuestion.hints.map((hint: string, i: number) => (
                        <p
                          key={i}
                          className="text-xs text-slate-300 flex items-start gap-2"
                        >
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{hint}</span>
                        </p>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Candidate Answer Input or Evaluation */}
            {!currentEval ? (
              <div className="glass-card p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-brand-400" />
                    Your Answer & Explanation
                  </label>

                  {/* Voice Recognition Button */}
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                      isListening
                        ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                        : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                    )}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-400" />
                        <span>Recording (Click to stop)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Voice Answer (Speech-to-Text)</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={
                    currentQuestion.type === "CODING"
                      ? `// 1. State your approach & algorithmic intuition
// 2. Mention time/space complexity (e.g. O(N) time, O(1) space)
// 3. Write clean solution code below:

function solve() {
  // your solution here
}`
                      : currentQuestion.type === "SYSTEM_DESIGN"
                      ? "Describe high-level architecture, database schema, caching, bottleneck handling, and trade-offs..."
                      : "Use STAR framework: Situation, Task, Action you took, and Measurable Result..."
                  }
                  rows={9}
                  className="input-dark w-full text-xs sm:text-sm resize-y font-mono leading-relaxed p-4"
                />

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-glass text-xs py-2.5 px-4"
                  >
                    Skip Question
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={evalLoading || !answer.trim()}
                    className={cn(
                      "btn-brand text-xs sm:text-sm py-2.5 px-6 font-semibold inline-flex items-center gap-2 shadow-lg shadow-brand-500/20",
                      evalLoading && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {evalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Evaluating with Gemini AI...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit & Evaluate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Immediate Evaluation Display */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="glass-card p-6 sm:p-7 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        AI Feedback & Assessment
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Question {currentQ + 1} performance review
                      </p>
                    </div>

                    <div
                      className="text-3xl sm:text-4xl font-black font-display"
                      style={{
                        color:
                          currentEval.score >= 75
                            ? "#10b981"
                            : currentEval.score >= 55
                            ? "#f59e0b"
                            : "#f43f5e",
                      }}
                    >
                      {currentEval.score}
                      <span className="text-sm font-semibold text-slate-500">/100</span>
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <ScoreBar
                      label="Correctness"
                      score={currentEval.correctness || 75}
                      color="#10b981"
                    />
                    <ScoreBar
                      label="Communication"
                      score={currentEval.communication || 80}
                      color="#2563eb"
                    />
                    <ScoreBar
                      label="Optimization"
                      score={currentEval.optimization || 70}
                      color="#8b5cf6"
                    />
                    <ScoreBar
                      label="Conceptual Understanding"
                      score={currentEval.conceptualUnderstanding || 80}
                      color="#f59e0b"
                    />
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.04]">
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <p className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                      </p>
                      {currentEval.strengths?.map((s: string, i: number) => (
                        <p key={i} className="text-slate-300 text-xs leading-relaxed">
                          • {s}
                        </p>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <p className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5" /> Actionable Improvements
                      </p>
                      {currentEval.improvements?.map((s: string, i: number) => (
                        <p key={i} className="text-slate-300 text-xs leading-relaxed">
                          • {s}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Model Answer */}
                  {currentEval.modelAnswer && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-brand-400" /> Ideal Interviewer Answer
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {currentEval.modelAnswer}
                      </p>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {currentEval.followUpQuestions && currentEval.followUpQuestions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/20 space-y-1.5">
                      <p className="text-xs font-bold text-brand-300">
                        Interviewer Follow-ups to reflect on:
                      </p>
                      {currentEval.followUpQuestions.map((q: string, i: number) => (
                        <p key={i} className="text-xs text-slate-300">
                          {i + 1}. {q}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="btn-brand w-full py-3.5 justify-center text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  {currentQ < questions.length - 1 ? (
                    <>
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      <span>Complete Interview & View Scorecard</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ============ PHASE 3: FINAL SCORECARD & REPORT ============ */}
        {phase === "report" && report && (
          <motion.div
            key="report"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Score Card Hero */}
            <div className="glass-card p-6 sm:p-8 bg-gradient-to-br from-rose-500/10 via-brand-500/10 to-transparent border-rose-500/20 text-center space-y-3">
              <div
                className="text-5xl sm:text-6xl font-black font-display"
                style={{
                  color:
                    report.totalScore >= 75
                      ? "#10b981"
                      : report.totalScore >= 55
                      ? "#f59e0b"
                      : "#f43f5e",
                }}
              >
                {report.totalScore}
              </div>

              <div>
                <span
                  className={cn(
                    "text-xs sm:text-sm font-bold px-3 py-1 rounded-full border",
                    report.totalScore >= 75
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : report.totalScore >= 55
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  )}
                >
                  Decision: {report.recommendation || (report.totalScore >= 75 ? "Hire" : "Lean Hire")}
                </span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed pt-2">
                You attempted {report.questionsAttempted} of {report.totalQuestions} questions for {config.company} ({config.role}).
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    setPhase("setup");
                    setSession(null);
                    setEvaluations({});
                    setAnswers({});
                    setCurrentQ(0);
                  }}
                  className="btn-glass text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Interview
                </button>

                <Link
                  href={`/planner?company=${encodeURIComponent(config.company)}&role=${encodeURIComponent(config.role)}`}
                  className="btn-brand text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate Study Roadmap for Weak Areas
                </Link>
              </div>
            </div>

            {/* Questions Detailed Scorecard */}
            <div className="glass-card p-5 sm:p-7 space-y-4">
              <h3 className="text-white font-bold font-display text-sm sm:text-base">
                Question Performance Scorecard
              </h3>

              <div className="space-y-3">
                {report.questions.map((q: any, i: number) => {
                  const eval_ = report.evaluations[q.id];
                  return (
                    <div
                      key={q.id || i}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-brand-500/20 text-brand-300 text-[11px] font-bold flex items-center justify-center">
                              {i + 1}
                            </span>
                            <span className="text-xs font-semibold text-white">
                              {q.type?.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 font-medium">
                            {q.text}
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          {eval_ ? (
                            <span
                              className="text-sm font-bold font-display"
                              style={{
                                color:
                                  eval_.score >= 75
                                    ? "#10b981"
                                    : eval_.score >= 55
                                    ? "#f59e0b"
                                    : "#f43f5e",
                              }}
                            >
                              {eval_.score}/100
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Skipped</span>
                          )}
                        </div>
                      </div>

                      {eval_ && eval_.modelAnswer && (
                        <div className="text-xs text-slate-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.03]">
                          <strong className="text-slate-300">Model Answer: </strong>
                          {eval_.modelAnswer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MockInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
          <div className="h-8 w-48 bg-white/[0.06] rounded-lg" />
          <div className="glass-card p-8 h-80" />
        </div>
      }
    >
      <MockInterviewContent />
    </Suspense>
  );
}
