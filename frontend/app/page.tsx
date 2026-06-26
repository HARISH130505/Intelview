"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Brain,
  TrendingUp,
  Target,
  FileSearch,
  Mic,
  Star,
  ChevronDown,
  BookOpen,
  Building2,
  Code2,
  Users,
  BarChart3,
  CheckCircle,
  Sparkles,
  Map,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

// ============================================================
// MOCK DATA for landing page (not dependent on backend)
// ============================================================
const STATS = [
  { label: "Companies Tracked", value: 500, suffix: "+", icon: Building2, color: "text-brand-400" },
  { label: "Interview Reports", value: 12000, suffix: "+", icon: FileSearch, color: "text-emerald-400" },
  { label: "Questions Indexed", value: 50000, suffix: "+", icon: Code2, color: "text-violet-400" },
  { label: "Students Helped", value: 80000, suffix: "+", icon: Users, color: "text-amber-400" },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Interview Extraction",
    description: "Gemini AI parses real interview experiences from Reddit, GFG & community submissions — extracting questions, topics, and difficulty automatically.",
    color: "from-brand-500/20 to-violet-500/20",
    iconColor: "text-brand-400",
    badge: "Powered by Gemini",
  },
  {
    icon: BarChart3,
    title: "Company Intelligence Dashboard",
    description: "Deep analytics for every company — difficulty distributions, hiring trends, topic heatmaps, and most-asked questions with historical data.",
    color: "from-emerald-500/20 to-cyan-500/20",
    iconColor: "text-emerald-400",
    badge: "Real Data",
  },
  {
    icon: FileSearch,
    title: "Resume × JD Analysis",
    description: "Upload your resume, paste the job description, and get an ATS score, skill gap analysis, and personalized improvement suggestions.",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
    badge: "ATS Score",
  },
  {
    icon: Map,
    title: "AI Study Roadmap",
    description: "Get a personalized day-by-day preparation plan tailored to your target company, role, experience, and available time.",
    color: "from-violet-500/20 to-pink-500/20",
    iconColor: "text-violet-400",
    badge: "Personalized",
  },
  {
    icon: Mic,
    title: "AI Mock Interviews",
    description: "Practice with questions drawn from real interview data. Get evaluated on correctness, optimization, and communication with AI feedback.",
    color: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-400",
    badge: "AI Evaluated",
  },
  {
    icon: TrendingUp,
    title: "Real-time Hiring Trends",
    description: "Track which companies are hiring aggressively, see topic frequency shifts, and get alerts when new interview reports arrive.",
    color: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
    badge: "Live Data",
  },
];

const TRENDING_COMPANIES = [
  { name: "Google", slug: "google", tier: "FAANG", reports: 843, logo: "G", color: "from-blue-500 to-green-500" },
  { name: "Amazon", slug: "amazon", tier: "FAANG", reports: 921, logo: "A", color: "from-orange-500 to-yellow-500" },
  { name: "Microsoft", slug: "microsoft", tier: "FAANG", reports: 712, logo: "M", color: "from-blue-600 to-cyan-500" },
  { name: "Meta", slug: "meta", tier: "FAANG", reports: 634, logo: "M", color: "from-blue-500 to-indigo-600" },
  { name: "Netflix", slug: "netflix", tier: "FAANG", reports: 412, logo: "N", color: "from-red-600 to-red-500" },
  { name: "Apple", slug: "apple", tier: "FAANG", reports: 567, logo: "A", color: "from-gray-600 to-gray-500" },
  { name: "Flipkart", slug: "flipkart", tier: "TIER1", reports: 389, logo: "F", color: "from-yellow-500 to-amber-500" },
  { name: "Zoho", slug: "zoho", tier: "TIER1", reports: 256, logo: "Z", color: "from-teal-500 to-cyan-600" },
];

const TRENDING_QUESTIONS = [
  { text: "Design a URL Shortener like bit.ly", type: "SYSTEM_DESIGN", difficulty: "HARD", companies: 47 },
  { text: "Merge K sorted linked lists", type: "CODING", difficulty: "HARD", companies: 89 },
  { text: "LRU Cache Implementation", type: "CODING", difficulty: "MEDIUM", companies: 72 },
  { text: "Design a Rate Limiter", type: "SYSTEM_DESIGN", difficulty: "HARD", companies: 54 },
  { text: "Find all subsets of a set", type: "CODING", difficulty: "MEDIUM", companies: 63 },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "SDE @ Google",
    text: "Intelview's company intelligence completely changed my preparation. I knew exactly what topics to focus on for my Google interviews. Got the offer!",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    role: "Software Engineer @ Amazon",
    text: "The AI mock interviews are incredibly realistic. The feedback on my answers was more detailed than any human mock interview I've had.",
    rating: 5,
    avatar: "RV",
  },
  {
    name: "Anjali Gupta",
    role: "Backend Dev @ Flipkart",
    text: "The resume analyzer gave me a 78% ATS score match and showed exactly what skills were missing. Spent 2 weeks fixing them — got shortlisted instantly.",
    rating: 5,
    avatar: "AG",
  },
];

const FAQ_ITEMS = [
  {
    q: "Where does the interview data come from?",
    a: "We aggregate interview experiences from Reddit (r/cscareerquestions, etc.), GeeksforGeeks interview experiences, and direct community submissions. All data is processed by Gemini AI to extract structured insights.",
  },
  {
    q: "Is the AI mock interview better than practicing on LeetCode?",
    a: "It complements LeetCode. Unlike LeetCode, our mock interviews simulate the actual interview flow with company-specific questions from real interview data, and evaluate your communication and approach — not just code correctness.",
  },
  {
    q: "How accurate is the resume ATS score?",
    a: "Our ATS scoring uses Gemini AI to analyze keyword density, skill matches, and experience alignment with the job description. It's designed to mirror how real ATS systems evaluate resumes.",
  },
  {
    q: "Is Intelview free?",
    a: "Core features (company explorer, question bank, interview reports) are free. AI-powered tools (mock interview, resume analysis, study planner) require an account and may have usage limits.",
  },
  {
    q: "Can I submit my own interview experience?",
    a: "Yes! Community submissions are the backbone of Intelview. Your report gets AI-processed and — after admin review — becomes part of the intelligence database helping others.",
  },
];

// ============================================================
// COUNT-UP HOOK
// ============================================================
function useCountUp(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    const step = (end - start) / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, end, start, duration]);

  return { count, ref };
}

function StatCard({ label, value, suffix, icon: Icon, color }: typeof STATS[0]) {
  const { count, ref } = useCountUp(value, 2000);
  return (
    <div ref={ref} className="glass-card p-6 text-center">
      <Icon className={cn("w-8 h-8 mx-auto mb-3", color)} />
      <div className="text-3xl font-bold font-display text-white">
        {count >= 1000 ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K` : count}{suffix}
      </div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

// ============================================================
// LANDING PAGE
// ============================================================
export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-hero-glow" />

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-500/5 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl"
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Google Gemini AI
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white leading-[1.08] mb-6"
          >
            Interview Intelligence,{" "}
            <span className="gradient-text">Powered by AI</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Transform scattered interview experiences into{" "}
            <span className="text-white font-medium">structured, AI-powered intelligence</span>.
            Real company data. Real questions. Real insights. Personalized for you.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/sign-up" className="btn-brand text-base py-4 px-8">
              Start Preparing Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/explore" className="btn-ghost text-base py-4 px-8">
              <Building2 className="w-4 h-4" />
              Explore Companies
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-slate-500 text-sm"
          >
            {["Google", "Amazon", "Microsoft", "Meta", "Flipkart"].map((co) => (
              <span key={co} className="font-medium text-slate-400">{co}</span>
            ))}
            <span className="text-slate-600">+ 495 more</span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* STATS SECTION */}
      {/* ============================================================ */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================================ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
              <Zap className="w-3 h-3" />
              Everything You Need
            </div>
            <h2 className="section-heading">
              The Bloomberg of Interview Intelligence
            </h2>
            <p className="section-subheading max-w-2xl mx-auto">
              12 powerful modules working together to give you an unfair advantage in your next interview
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card-hover p-6 group relative overflow-hidden"
                >
                  {/* Gradient background */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", feature.color)} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]", feature.iconColor)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.06]">
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-white text-lg mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TRENDING COMPANIES */}
      {/* ============================================================ */}
      <section className="py-20 bg-dark-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="section-heading">🔥 Trending Companies</h2>
              <p className="section-subheading">Most active interview activity in the last 30 days</p>
            </div>
            <Link href="/explore" className="btn-ghost text-sm py-2 px-4 hidden sm:flex">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TRENDING_COMPANIES.map((company, i) => (
              <motion.div
                key={company.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/companies/${company.slug}`}
                  className="glass-card-hover p-5 flex flex-col items-center text-center gap-3 group"
                >
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold font-display text-lg shadow-lg", company.color)}>
                    {company.logo}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{company.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{company.reports} reports</div>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium",
                    company.tier === "FAANG"
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : "text-brand-400 bg-brand-500/10 border-brand-500/20"
                  )}>
                    {company.tier}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TRENDING QUESTIONS */}
      {/* ============================================================ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="section-heading">⚡ Trending Questions</h2>
              <p className="section-subheading">Most frequently asked across top companies</p>
            </div>
            <Link href="/questions" className="btn-ghost text-sm py-2 px-4 hidden sm:flex">
              All Questions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="space-y-3">
            {TRENDING_QUESTIONS.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover p-5 flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center text-slate-500 text-sm font-bold flex-shrink-0 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-all">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{q.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("badge text-xs",
                      q.type === "SYSTEM_DESIGN" ? "badge-violet" : "badge-brand"
                    )}>
                      {q.type.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={cn("badge",
                    q.difficulty === "HARD" ? "badge-hard" : "badge-medium"
                  )}>
                    {q.difficulty}
                  </span>
                  <div className="text-right hidden sm:block">
                    <div className="text-white text-sm font-semibold">{q.companies}</div>
                    <div className="text-slate-600 text-xs">companies</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIALS */}
      {/* ============================================================ */}
      <section className="py-20 bg-dark-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-heading">Stories from the Community</h2>
            <p className="section-subheading">Real results from real candidates</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS */}
      {/* ============================================================ */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="section-heading">How Intelview Works</h2>
            <p className="section-subheading">Three steps to interview intelligence</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "We Collect",
                desc: "AI scrapes and processes real interview experiences from Reddit, GFG, and community submissions",
                color: "text-brand-400",
                bg: "bg-brand-500/10",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Analyzes",
                desc: "Gemini extracts questions, topics, difficulty, rounds, and company-specific patterns from raw text",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
              {
                step: "03",
                icon: Target,
                title: "You Prepare",
                desc: "Get personalized roadmaps, mock interviews, and intelligence dashboards tailored to your target",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
            ].map(({ step, icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative border border-white/[0.08]", bg)}>
                  <Icon className={cn("w-8 h-8", color)} />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-dark-950 border border-white/[0.1] text-xs font-bold text-slate-500 flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-white text-xl mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FAQ */}
      {/* ============================================================ */}
      <section className="py-20 bg-dark-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-heading">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-card overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                >
                  <span className="font-medium text-white text-sm">{item.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 flex-shrink-0 ml-4 transition-transform duration-200", openFAQ === i && "rotate-180")} />
                </button>
                {openFAQ === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-5"
                  >
                    <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA SECTION */}
      {/* ============================================================ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative gradient-border p-12 md:p-16"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-500/10" />
            <div className="absolute inset-0 bg-grid rounded-2xl opacity-30" />

            <div className="relative">
              <div className="flex items-center justify-center gap-2 text-brand-400 mb-6">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">500+ Companies • 50K+ Questions • AI-Powered</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black font-display text-white mb-4 leading-tight">
                Stop Guessing.{" "}
                <span className="gradient-text">Start Knowing.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Join 80,000+ candidates who use Intelview to prepare smarter, not harder.
              </p>
              <div className="flex justify-center">
                <Link href="/sign-up" className="btn-brand text-base py-4 px-10">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}