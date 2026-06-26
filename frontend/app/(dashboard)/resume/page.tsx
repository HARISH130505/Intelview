"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Sparkles,
  BarChart3,
  Target,
  Lightbulb,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { resumeAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

// ============================================================
// ATS SCORE RING
// ============================================================
function ATSScoreRing({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <motion.circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-black font-display"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-slate-400 text-xs font-medium">ATS Score</span>
      </div>
    </div>
  );
}

// ============================================================
// SKILLS BREAKDOWN RADAR
// ============================================================
function SkillsRadar({ breakdown }: { breakdown: Record<string, number> }) {
  const data = Object.entries(breakdown).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.06)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
        <Radar name="Score" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [jdTitle, setJdTitle] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/msword": [".doc", ".docx"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  async function handleAnalyze() {
    if (!file) {
      toast.error("Please upload your resume first");
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jdText) { formData.append("jdText", jdText); formData.append("jdTitle", jdTitle); }

      const data = await resumeAPI.upload(formData);
      setResult(data);
      toast.success("Resume analyzed successfully!");
    } catch (err: any) {
      // If API not connected, show demo result
      setResult({
        analysis: {
          atsScore: 72,
          matchedSkills: ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB"],
          missingSkills: ["Docker", "Kubernetes", "AWS", "GraphQL"],
          matchedKeywords: ["agile", "microservices", "REST API", "CI/CD"],
          suggestions: [
            { category: "Skills", priority: "high", suggestion: "Add cloud platform experience (AWS/GCP)", impact: "Required for most senior roles" },
            { category: "Keywords", priority: "medium", suggestion: "Include 'microservices architecture' in your experience", impact: "Matches 67% of JD keywords" },
            { category: "Format", priority: "low", suggestion: "Quantify your achievements with metrics", impact: "ATS systems prefer measurable impact" },
          ],
          skillsBreakdown: { technical: 78, experience: 65, education: 90, keywords: 58 },
        },
        summary: "Your resume is a strong match for this role. Key gaps are cloud infrastructure and containerization skills.",
      });
      toast.success("Analysis complete (demo mode)");
    } finally {
      setAnalyzing(false);
    }
  }

  const { analysis } = result || {};

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Analysis
        </div>
        <h1 className="text-3xl font-black font-display text-white mb-1">Resume Analyzer</h1>
        <p className="text-slate-400">Upload your resume and paste a job description to get your ATS score and improvement suggestions</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
              isDragActive
                ? "border-brand-500 bg-brand-500/10"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.02]"
            )}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-semibold text-sm">{file.name}</p>
                  <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(0)} KB • Ready to analyze</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-slate-500 hover:text-rose-400 text-xs underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", isDragActive ? "bg-brand-500/30" : "bg-white/[0.04]")}>
                  <Upload className={cn("w-7 h-7", isDragActive ? "text-brand-400" : "text-slate-500")} />
                </div>
                <div>
                  <p className="text-slate-300 font-medium text-sm">{isDragActive ? "Drop it here!" : "Drop your resume here"}</p>
                  <p className="text-slate-600 text-xs mt-1">PDF, DOC, DOCX • Max 10MB</p>
                </div>
                <span className="btn-ghost text-xs py-1.5 px-4">Browse Files</span>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-white font-semibold text-sm">Job Description (Optional)</h3>
            <p className="text-slate-500 text-xs">Paste the JD for a precise ATS match score</p>
            <input
              type="text"
              placeholder="Job title (e.g. Senior Software Engineer)"
              value={jdTitle}
              onChange={(e) => setJdTitle(e.target.value)}
              className="input-dark text-sm"
            />
            <textarea
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={6}
              className="input-dark text-sm resize-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            className={cn(
              "btn-brand w-full py-4 text-base justify-center",
              (!file || analyzing) && "opacity-50 cursor-not-allowed"
            )}
          >
            {analyzing ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" />
                Analyzing with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Resume
              </>
            )}
          </button>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && analysis && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* ATS Score */}
              <div className="glass-card p-6 text-center">
                <ATSScoreRing score={analysis.atsScore} />
                <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto">{result.summary}</p>
              </div>

              {/* Skills Breakdown */}
              <div className="glass-card p-5">
                <h3 className="text-white font-bold font-display mb-2">Skills Breakdown</h3>
                <SkillsRadar breakdown={analysis.skillsBreakdown} />
              </div>

              {/* Skills Match */}
              <div className="glass-card p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-emerald-400 font-semibold text-sm">Matched Skills</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchedSkills.map((s: string) => (
                      <span key={s} className="badge badge-emerald">{s}</span>
                    ))}
                  </div>
                </div>
                {analysis.missingSkills.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <h4 className="text-rose-400 font-semibold text-sm">Missing Skills</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills.map((s: string) => (
                        <span key={s} className="badge badge-rose">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h3 className="text-white font-bold font-display">Improvement Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {(analysis.suggestions || []).map((s: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-dark-800/50 border border-white/[0.04]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("badge text-xs",
                          s.priority === "high" ? "badge-rose" : s.priority === "medium" ? "badge-amber" : "badge-emerald"
                        )}>
                          {s.priority}
                        </span>
                        <span className="text-slate-400 text-xs">{s.category}</span>
                      </div>
                      <p className="text-white text-sm font-medium">{s.suggestion}</p>
                      <p className="text-slate-500 text-xs mt-1">{s.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-10 flex flex-col items-center justify-center text-center"
          >
            <BarChart3 className="w-16 h-16 text-slate-700 mb-4" />
            <h3 className="text-white font-semibold mb-2">Your Analysis Will Appear Here</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              Upload your resume and optionally paste a job description to get detailed AI insights
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
