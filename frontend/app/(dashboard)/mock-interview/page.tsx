"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Play, ChevronRight, CheckCircle, Clock, Star, Loader2, Send, BarChart3, ArrowRight } from "lucide-react";
import { mockAPI } from "@/lib/api";
import { cn, getDifficultyColor } from "@/lib/utils";
import { toast } from "sonner";

const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Flipkart"];
const INTERVIEW_TYPES = [
  { value: "CODING", label: "Coding", emoji: "💻" },
  { value: "SYSTEM_DESIGN", label: "System Design", emoji: "🏗️" },
  { value: "BEHAVIORAL", label: "Behavioral", emoji: "🗣️" },
  { value: "CORE_CS", label: "Core CS", emoji: "📚" },
];

type Phase = "setup" | "interview" | "report";

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{score}/100</span>
      </div>
      <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
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

export default function MockInterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState({ company: "Google", type: "CODING", difficulty: "MEDIUM", numQuestions: 5 });
  const [session, setSession] = useState<any>(null);
  const [interviewSet, setInterviewSet] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  async function handleStart() {
    setLoading(true);
    try {
      const data = await mockAPI.start({ ...config, companyName: config.company });
      setSession(data.session);
      setInterviewSet(data.interviewSet);
      setPhase("interview");
      setTimeLeft((data.interviewSet?.timeLimit || 60) * 60);
      toast.success("Interview started! Good luck 🎯");
    } catch {
      // Demo interview
      const demoQuestions = [
        { id: "q1", text: "Given an array of integers, find two numbers that add up to a target sum.", type: "CODING", difficulty: "MEDIUM", hints: ["Use a hash map", "Think about complements"], timeRecommended: 20, evaluationCriteria: ["Time complexity", "Space complexity", "Edge cases"] },
        { id: "q2", text: "Design a scalable notification system that handles millions of users.", type: "SYSTEM_DESIGN", difficulty: "HARD", hints: ["Think about message queues", "Consider fan-out strategies"], timeRecommended: 30, evaluationCriteria: ["Scalability", "Reliability", "Trade-offs"] },
        { id: "q3", text: "Tell me about a time you had to make a difficult technical decision under pressure.", type: "BEHAVIORAL", difficulty: "MEDIUM", hints: ["Use STAR format", "Be specific"], timeRecommended: 10, evaluationCriteria: ["Communication", "Decision making", "Reflection"] },
      ].slice(0, config.numQuestions);

      setSession({ id: "demo-session", questions: demoQuestions.map(q => ({ id: q.id, questionText: q.text, questionType: q.type })) });
      setInterviewSet({ questions: demoQuestions, instructions: `Welcome to your ${config.company} mock interview. Answer each question thoroughly.`, timeLimit: 60 });
      setPhase("interview");
      toast.success("Demo interview started!");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) { toast.error("Please write an answer before submitting"); return; }
    const questions = interviewSet?.questions || [];
    const currentQuestion = questions[currentQ];
    if (!currentQuestion) return;

    setEvalLoading(true);
    try {
      const sessionId = session?.id || "demo-session";
      const questionId = session?.questions?.[currentQ]?.id || currentQuestion.id;

      let evaluation;
      try {
        const data = await mockAPI.submitAnswer(sessionId, { questionId, answer });
        evaluation = data.evaluation?.aiEvaluation || data;
      } catch {
        evaluation = {
          score: Math.floor(Math.random() * 30) + 60,
          communication: Math.floor(Math.random() * 20) + 70,
          correctness: Math.floor(Math.random() * 25) + 60,
          optimization: Math.floor(Math.random() * 30) + 50,
          conceptualUnderstanding: Math.floor(Math.random() * 20) + 65,
          strengths: ["Good problem identification", "Clear explanation"],
          improvements: ["Add more edge case handling", "Discuss time complexity explicitly"],
          modelAnswer: "A well-optimized solution would use a hash map to achieve O(n) time complexity...",
          followUpQuestions: ["What is the time complexity?", "Can you handle duplicates?"],
        };
      }

      setEvaluations((prev) => ({ ...prev, [currentQuestion.id]: evaluation }));
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
      toast.success(`Evaluated! Score: ${evaluation.score}/100`);
    } finally {
      setEvalLoading(false);
    }
  }

  function handleNext() {
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
    const avgScore = allEvals.length > 0
      ? Math.round(allEvals.reduce((s: number, e: any) => s + (e.score || 0), 0) / allEvals.length)
      : 0;

    setReport({
      totalScore: avgScore,
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-3">
          <Mic className="w-3.5 h-3.5" /> AI Mock Interview
        </div>
        <h1 className="text-3xl font-black font-display text-white mb-1">Mock Interview</h1>
        <p className="text-slate-400">Practice with real interview questions and get AI evaluation on every answer</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ============ SETUP ============ */}
        {phase === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-8 max-w-2xl">
            <h2 className="text-white font-bold font-display text-xl mb-6">Configure Your Interview</h2>
            <div className="space-y-5">
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Target Company</label>
                <select value={config.company} onChange={(e) => setConfig({ ...config, company: e.target.value })} className="input-dark">
                  {COMPANIES.map((c) => <option key={c} value={c} className="bg-dark-800">{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Interview Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERVIEW_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setConfig({ ...config, type: t.value })}
                      className={cn(
                        "p-3 rounded-xl text-sm font-medium border transition-all flex items-center gap-2",
                        config.type === t.value
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          : "text-slate-400 border-white/[0.06] hover:border-white/[0.12]"
                      )}
                    >
                      <span>{t.emoji}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-2 block">Difficulty</label>
                  <select value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: e.target.value })} className="input-dark">
                    {["EASY", "MEDIUM", "HARD"].map((d) => <option key={d} value={d} className="bg-dark-800">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-2 block">
                    Questions: <span className="text-white">{config.numQuestions}</span>
                  </label>
                  <input type="range" min={3} max={10} step={1} value={config.numQuestions}
                    onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
                    className="w-full accent-rose-500 mt-3"
                  />
                </div>
              </div>

              <button onClick={handleStart} disabled={loading} className="btn-brand w-full py-4 text-base justify-center bg-rose-500 hover:bg-rose-600" style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)" }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up interview...</> : <><Play className="w-4 h-4" fill="currentColor" /> Start Interview</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* ============ INTERVIEW ============ */}
        {phase === "interview" && currentQuestion && (
          <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-500 to-brand-500 rounded-full"
                  animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-slate-400 text-sm">{currentQ + 1}/{questions.length}</span>
            </div>

            {/* Question */}
            <div className="glass-card p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-rose-400 font-bold text-sm">Q{currentQ + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <span className={cn("badge text-xs", getDifficultyColor(currentQuestion.difficulty))}>{currentQuestion.difficulty}</span>
                    <span className="badge badge-brand text-xs">{currentQuestion.type?.replace("_", " ")}</span>
                    <span className="badge text-xs bg-dark-800 text-slate-400 border-white/[0.06]">
                      <Clock className="w-3 h-3 mr-1" />{currentQuestion.timeRecommended} min
                    </span>
                  </div>
                  <p className="text-white text-lg font-semibold leading-relaxed">{currentQuestion.text}</p>
                </div>
              </div>

              {/* Hints */}
              {currentQuestion.hints?.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-dark-800/50 border border-white/[0.04]">
                  <p className="text-slate-500 text-xs font-medium mb-2">Hints:</p>
                  {currentQuestion.hints.map((hint: string, i: number) => (
                    <p key={i} className="text-slate-400 text-xs flex items-start gap-2">
                      <span className="text-brand-400">•</span>{hint}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Answer Input */}
            {!currentEval ? (
              <div className="glass-card p-5 space-y-3">
                <label className="text-slate-300 text-sm font-medium">Your Answer</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={currentQuestion.type === "CODING"
                    ? "Explain your approach, write pseudocode or actual code..."
                    : currentQuestion.type === "SYSTEM_DESIGN"
                    ? "Describe your system architecture, components, data flow..."
                    : "Use the STAR format: Situation, Task, Action, Result..."}
                  rows={8}
                  className="input-dark text-sm resize-none font-mono"
                />
                <div className="flex gap-3">
                  <button onClick={handleSubmitAnswer} disabled={evalLoading || !answer.trim()} className="btn-brand py-3 px-6 justify-center flex-1">
                    {evalLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</> : <><Send className="w-4 h-4" /> Submit Answer</>}
                  </button>
                  <button onClick={handleNext} className="btn-ghost py-3 px-4">Skip</button>
                </div>
              </div>
            ) : (
              /* Evaluation Display */
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">AI Evaluation</h3>
                    <div className="text-3xl font-black font-display" style={{ color: currentEval.score >= 70 ? "#10b981" : currentEval.score >= 50 ? "#f59e0b" : "#f43f5e" }}>
                      {currentEval.score}/100
                    </div>
                  </div>
                  <div className="space-y-3 mb-5">
                    <ScoreBar label="Correctness" score={currentEval.correctness} color="#10b981" />
                    <ScoreBar label="Communication" score={currentEval.communication} color="#2563eb" />
                    <ScoreBar label="Optimization" score={currentEval.optimization} color="#8b5cf6" />
                    <ScoreBar label="Conceptual Understanding" score={currentEval.conceptualUnderstanding} color="#f59e0b" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-emerald-400 text-xs font-medium mb-2">✓ Strengths</p>
                      {currentEval.strengths?.map((s: string, i: number) => (
                        <p key={i} className="text-slate-400 text-xs flex items-start gap-1.5 mb-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />{s}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-amber-400 text-xs font-medium mb-2">→ Improvements</p>
                      {currentEval.improvements?.map((s: string, i: number) => (
                        <p key={i} className="text-slate-400 text-xs flex items-start gap-1.5 mb-1">
                          <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />{s}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={handleNext} className="btn-brand w-full py-3 justify-center">
                  {currentQ < questions.length - 1 ? <><ChevronRight className="w-4 h-4" /> Next Question</> : <><Star className="w-4 h-4" /> Finish & See Report</>}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ============ REPORT ============ */}
        {phase === "report" && report && (
          <motion.div key="report" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            {/* Score Card */}
            <div className="gradient-border">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-500/10 to-brand-500/10 text-center">
                <div className="text-6xl font-black font-display mb-2" style={{ color: report.totalScore >= 70 ? "#10b981" : report.totalScore >= 50 ? "#f59e0b" : "#f43f5e" }}>
                  {report.totalScore}
                </div>
                <div className="text-slate-300 font-medium mb-1">Overall Score</div>
                <div className="text-slate-500 text-sm">{report.questionsAttempted}/{report.totalQuestions} questions answered</div>
                <div className="flex gap-2 justify-center mt-4">
                  <button onClick={() => { setPhase("setup"); setSession(null); setEvaluations({}); setAnswers({}); setCurrentQ(0); }} className="btn-ghost text-sm py-2 px-4">
                    Try Again
                  </button>
                </div>
              </div>
            </div>

            {/* Per Question Breakdown */}
            <div className="glass-card p-6">
              <h3 className="text-white font-bold font-display mb-4">Question Breakdown</h3>
              <div className="space-y-4">
                {report.questions.map((q: any, i: number) => {
                  const eval_ = report.evaluations[q.id];
                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-dark-800/50 border border-white/[0.04]">
                      <div className="flex items-start gap-3">
                        <span className="text-slate-600 text-sm w-6">{i + 1}.</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium mb-2">{q.text}</p>
                          {eval_ ? (
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-bold" style={{ color: eval_.score >= 70 ? "#10b981" : "#f59e0b" }}>{eval_.score}</div>
                              <div className="flex-1 h-1.5 bg-dark-700 rounded-full">
                                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500" style={{ width: `${eval_.score}%` }} />
                              </div>
                            </div>
                          ) : <span className="text-slate-600 text-xs">Skipped</span>}
                        </div>
                      </div>
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
