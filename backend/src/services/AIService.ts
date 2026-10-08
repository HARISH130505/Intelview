import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// ============================================================
// TYPES
// ============================================================

export interface ExtractedInterview {
  company: string;
  role: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'VERY_HARD';
  rounds: ExtractedRound[];
  questions: ExtractedQuestion[];
  topics: string[];
  technologies: string[];
  behavioralTopics: string[];
  systemDesignTopics: string[];
  offerStatus: string;
  summary: string;
  tips: string[];
  yearsOfExperience?: number;
}

export interface ExtractedRound {
  roundNumber: number;
  type: string;
  description: string;
  duration?: number;
  difficulty?: string;
}

export interface ExtractedQuestion {
  text: string;
  type: string;
  difficulty: string;
  topics: string[];
}

export interface ResumeAnalysis {
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  suggestions: ResumeSuggestion[];
  skillsBreakdown: {
    technical: number;
    experience: number;
    education: number;
    keywords: number;
  };
  summary: string;
}

export interface ResumeSuggestion {
  category: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact: string;
}

export interface StudyRoadmap {
  totalDays: number;
  overview: string;
  milestones: Milestone[];
  days: DayPlan[];
  resources: Resource[];
  tips: string[];
}

export interface Milestone {
  day: number;
  title: string;
  description: string;
}

export interface DayPlan {
  day: number;
  title: string;
  topics: string[];
  tasks: Task[];
  estimatedHours: number;
  resources: string[];
}

export interface Task {
  type: 'study' | 'practice' | 'review' | 'mock';
  description: string;
  duration: number; // minutes
  difficulty?: string;
}

export interface Resource {
  title: string;
  type: 'video' | 'article' | 'book' | 'practice';
  url?: string;
}

export interface MockInterviewSet {
  sessionId: string;
  questions: MockQuestion[];
  instructions: string;
  timeLimit: number;
}

export interface MockQuestion {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  hints: string[];
  timeRecommended: number; // minutes
  evaluationCriteria: string[];
}

export interface AnswerEvaluation {
  score: number; // 0-100
  communication: number;
  correctness: number;
  optimization: number;
  conceptualUnderstanding: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  followUpQuestions: string[];
}

// ============================================================
// AI SERVICE
// ============================================================

// Types for live company research
export interface CompanyResearch {
  company: string;
  role: string;
  oaFormat: {
    platform: string;
    duration: string;
    questionTypes: string[];
    tips: string[];
  };
  interviewRounds: {
    roundNumber: number;
    type: string;
    description: string;
    duration: string;
    tips: string[];
  }[];
  frequentTopics: string[];
  recentQuestions: {
    text: string;
    type: string;
    difficulty: string;
    source: string;
  }[];
  preparationResources: {
    title: string;
    url: string;
    type: string;
    description: string;
  }[];
  salaryInsights: string;
  difficulty: string;
  offerRate: string;
  timeline: string;
  insiderTips: string[];
  sources: string[];
  researchedAt: string;
}

class AIService {
  private model: GenerativeModel;
  private fastModel: GenerativeModel;
  private researchModel: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not set. AI features will return mock data.');
    }

    const genAI = new GoogleGenerativeAI(apiKey || 'placeholder');

    // ✅ Gemini 3.1 Flash-Lite — Bulk extraction and normalization (e.g. interview extraction, resume parsing)
    this.model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    // ✅ Gemini 3.8 Flash — User-facing AI features (e.g. roadmaps, mock interviews, chat)
    // NOTE: gemini-2.5-flash is no longer available; verified working replacement is gemini-3.8-flash
    this.fastModel = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    // ✅ Gemini 3.8 Flash + Google Search Grounding — Live dynamic company research
    // NOTE: gemini-2.5-flash is deprecated/removed from v1beta. Using gemini-3.8-flash.
    this.researchModel = genAI.getGenerativeModel(
      { model: 'gemini-3.8-flash' },
      { apiVersion: 'v1beta' }
    );
  }

  // ============================================================
  // INTERVIEW EXTRACTION
  // ============================================================

  async extractInterview(rawText: string): Promise<ExtractedInterview> {
    const prompt = this.buildExtractionPrompt(rawText);
    
    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return this.parseJSON<ExtractedInterview>(text, this.defaultExtractedInterview());
    } catch (error) {
      console.error('AI extraction error:', error);
      return this.defaultExtractedInterview();
    }
  }

  private buildExtractionPrompt(rawText: string): string {
    return `You are an expert interview data analyst. Extract structured information from this interview experience.

INTERVIEW TEXT:
"""
${rawText}
"""

Extract and return ONLY a valid JSON object with this exact structure:
{
  "company": "company name",
  "role": "job role/position",
  "difficulty": "EASY|MEDIUM|HARD|VERY_HARD",
  "rounds": [
    {
      "roundNumber": 1,
      "type": "TECHNICAL|BEHAVIORAL|SYSTEM_DESIGN|HR|ONLINE_ASSESSMENT|PHONE_SCREEN",
      "description": "brief description of this round",
      "duration": 60,
      "difficulty": "EASY|MEDIUM|HARD"
    }
  ],
  "questions": [
    {
      "text": "exact question asked",
      "type": "CODING|BEHAVIORAL|SYSTEM_DESIGN|CORE_CS|HR",
      "difficulty": "EASY|MEDIUM|HARD",
      "topics": ["array", "string"]
    }
  ],
  "topics": ["arrays", "dynamic programming", "system design"],
  "technologies": ["Java", "React", "AWS"],
  "behavioralTopics": ["leadership", "conflict resolution"],
  "systemDesignTopics": ["URL shortener", "rate limiter"],
  "offerStatus": "ACCEPTED|REJECTED|PENDING|UNKNOWN",
  "summary": "2-3 sentence summary of the interview experience",
  "tips": ["tip 1", "tip 2"],
  "yearsOfExperience": 2
}

Return ONLY the JSON, no markdown, no explanation.`;
  }

  // ============================================================
  // LIVE COMPANY RESEARCH (Google Search Grounding)
  // ============================================================

  async researchCompany(company: string, role: string): Promise<CompanyResearch> {
    const prompt = `You are an expert career intelligence analyst. Research the current (2025-2026) interview process for "${company}" for the role "${role}".

Using your search capability, find and analyze:
1. Recent interview experiences from Reddit (r/cscareerquestions, r/leetcode, r/${company.toLowerCase().replace(/\s+/g, '')}), LeetCode Discuss, Glassdoor, and LinkedIn.
2. Online Assessment (OA) format — platform used (HackerRank/CodeSignal/Glider), question count, time limit, difficulty distribution.
3. All interview rounds — types, duration, difficulty, what interviewers focus on.
4. Most frequently asked coding questions and topics in 2025-2026.
5. Specific preparation resources with real URLs.
6. Offer rates, salary ranges, and interview timeline.

Return ONLY a valid JSON object with this exact structure:
{
  "company": "${company}",
  "role": "${role}",
  "oaFormat": {
    "platform": "HackerRank",
    "duration": "90 minutes",
    "questionTypes": ["2 DSA problems (Medium/Hard)", "1 SQL query"],
    "tips": ["Focus on optimal time complexity", "Test edge cases"]
  },
  "interviewRounds": [
    {
      "roundNumber": 1,
      "type": "ONLINE_ASSESSMENT",
      "description": "2 LeetCode Medium/Hard problems",
      "duration": "90 min",
      "tips": ["Write brute force first then optimize"]
    },
    {
      "roundNumber": 2,
      "type": "TECHNICAL",
      "description": "DSA + problem solving with live coding",
      "duration": "45-60 min",
      "tips": ["Think aloud", "Ask clarifying questions"]
    }
  ],
  "frequentTopics": ["Dynamic Programming", "Trees", "Graphs", "System Design", "Arrays"],
  "recentQuestions": [
    {
      "text": "Specific question text seen in recent interviews",
      "type": "CODING",
      "difficulty": "MEDIUM",
      "source": "Reddit r/cscareerquestions (2025)"
    }
  ],
  "preparationResources": [
    {
      "title": "Resource name",
      "url": "https://actual-url.com",
      "type": "practice|video|article|book",
      "description": "Why this resource is relevant for this company"
    }
  ],
  "salaryInsights": "SDE-1: ₹25-40 LPA | SDE-2: ₹45-80 LPA (includes stock)",
  "difficulty": "HARD",
  "offerRate": "~5-8% from OA to offer",
  "timeline": "OA → 2-3 Technical rounds → HR → 3-5 weeks total",
  "insiderTips": [
    "Specific insider tip based on recent experiences"
  ],
  "sources": ["Reddit thread URL", "LeetCode discuss URL"],
  "researchedAt": "${new Date().toISOString()}"
}

Be specific with real questions and accurate URLs. Prioritize 2025-2026 data. Return ONLY the JSON.`;

    try {
      // Call Gemini with Google Search Grounding enabled; fall back to standard model if search quota exceeded
      let result;
      let usedSearch = false;
      try {
        result = await this.researchModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} } as any],
        });
        usedSearch = true;
      } catch (searchErr) {
        console.warn('researchModel with googleSearch failed, falling back to gemini-3.1-flash-lite:', searchErr);
        result = await this.model.generateContent(prompt);
      }

      const text = result.response.text();
      const parsed = this.parseJSON<CompanyResearch>(text, this.defaultCompanyResearch(company, role));

      // Attach grounding sources if available
      if (usedSearch) {
        const groundingMetadata = (result.response as any).candidates?.[0]?.groundingMetadata;
        if (groundingMetadata?.webSearchQueries) {
          console.log(`🔍 Gemini searched: ${groundingMetadata.webSearchQueries.join(', ')}`);
        }
        if (groundingMetadata?.groundingChunks) {
          const sourceUrls = groundingMetadata.groundingChunks
            .map((chunk: any) => chunk.web?.uri)
            .filter(Boolean);
          if (sourceUrls.length > 0) parsed.sources = sourceUrls;
        }
      }

      parsed.researchedAt = new Date().toISOString();
      return parsed;
    } catch (error) {
      console.error('Company research error:', error);
      return this.defaultCompanyResearch(company, role);
    }
  }

  private defaultCompanyResearch(company: string, role: string): CompanyResearch {
    // Curated company intelligence table — used when the live AI research call fails
    type CompanyProfile = {
      difficulty: string;
      offerRate: string;
      timeline: string;
      oaPlatform: string;
      oaDuration: string;
      frequentTopics: string[];
      insiderTips: string[];
    };

    const profiles: Record<string, CompanyProfile> = {
      google: {
        difficulty: 'VERY_HARD',
        offerRate: '~1–3% from application to offer (top DSA + system design bar)',
        timeline: 'OA → 2 phone screens → 4–5 onsite rounds → committee review → 4–8 weeks total',
        oaPlatform: 'Google Forms / CodePair',
        oaDuration: '60–90 minutes',
        frequentTopics: ['Graphs', 'Trees', 'Dynamic Programming', 'System Design', 'Trie', 'Segment Tree'],
        insiderTips: ['Think aloud — Googlers value problem-solving process over final answer', 'Optimize for both time and space complexity', 'Practice LeetCode Hard-level problems'],
      },
      amazon: {
        difficulty: 'HARD',
        offerRate: '~5–10% from OA to offer',
        timeline: 'OA (HackerRank) → 1 phone screen → Bar Raiser loop (4–5 rounds) → 3–5 weeks total',
        oaPlatform: 'HackerRank',
        oaDuration: '90 minutes (2 DSA + work-style survey)',
        frequentTopics: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming', 'Leadership Principles', 'System Design'],
        insiderTips: ['Prepare 2+ STAR stories for ALL 14 Leadership Principles', 'Bar Raiser round is the most critical — focus on ownership and dive-deep', 'OA difficulty: Medium to Hard'],
      },
      microsoft: {
        difficulty: 'HARD',
        offerRate: '~8–15% from interview to offer',
        timeline: 'Online assessment → 4–5 interview rounds (phone/onsite) → 3–5 weeks total',
        oaPlatform: 'HackerRank / Codility',
        oaDuration: '75 minutes',
        frequentTopics: ['Trees', 'Graphs', 'Dynamic Programming', 'OOP Design', 'String Manipulation', 'System Design'],
        insiderTips: ['Microsoft values collaboration — think aloud and engage the interviewer', 'Object-Oriented Design questions are common', 'Focus on code readability and edge cases'],
      },
      meta: {
        difficulty: 'HARD',
        offerRate: '~3–7% from application to offer',
        timeline: 'Recruiter screen → 2 technical phone screens → Virtual onsite (4 rounds) → 4–6 weeks total',
        oaPlatform: 'HackerRank / CoderPad',
        oaDuration: '70 minutes',
        frequentTopics: ['Graphs', 'Arrays', 'Trees', 'System Design', 'Dynamic Programming', 'Behavioral/Product Sense'],
        insiderTips: ['Speed matters at Meta — aim to finish coding problems with time to optimize', 'Practice graph problems extensively (social network context)', 'Behavioral round uses "Tell me about a time..." format'],
      },
      facebook: {
        difficulty: 'HARD',
        offerRate: '~3–7% from application to offer',
        timeline: 'Recruiter screen → 2 technical phone screens → Virtual onsite (4 rounds) → 4–6 weeks total',
        oaPlatform: 'HackerRank / CoderPad',
        oaDuration: '70 minutes',
        frequentTopics: ['Graphs', 'Arrays', 'Trees', 'System Design', 'Dynamic Programming'],
        insiderTips: ['Speed matters — finish fast and then optimize', 'Social-graph-style graph problems are very common'],
      },
      apple: {
        difficulty: 'HARD',
        offerRate: '~5–10% from screening to offer',
        timeline: 'Recruiter call → Technical phone screen → Team matching → Onsite (5–6 rounds) → 4–8 weeks total',
        oaPlatform: 'HackerRank / Take-home project',
        oaDuration: 'Varies by team',
        frequentTopics: ['Data Structures', 'Algorithms', 'System Design', 'Low-Level Design', 'Swift/Objective-C (mobile)'],
        insiderTips: ['Polish and attention to detail matter highly at Apple', 'Team-specific hiring — match your skills to the team', 'Low-Level Design questions are common for SDE roles'],
      },
      flipkart: {
        difficulty: 'HARD',
        offerRate: '~10–18% from OA to offer',
        timeline: 'OA (HackerEarth) → Machine coding round → 3–4 technical rounds → HR → 3–5 weeks total',
        oaPlatform: 'HackerEarth',
        oaDuration: '90 minutes',
        frequentTopics: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming', 'System Design (e-commerce)', 'Low-Level Design'],
        insiderTips: ['Machine coding round is a major filter — practice designing clean OOP systems', 'System design focuses on e-commerce (search, cart, payments, catalog)', 'Flipkart values product thinking alongside coding'],
      },
      uber: {
        difficulty: 'HARD',
        offerRate: '~8–15% from application to offer',
        timeline: 'Recruiter call → Technical phone screen → Onsite (3–4 rounds) → 3–5 weeks total',
        oaPlatform: 'HackerRank / CoderPad',
        oaDuration: '60–75 minutes',
        frequentTopics: ['Graphs', 'Geospatial Algorithms', 'System Design (real-time matching)', 'Dynamic Programming', 'Arrays'],
        insiderTips: ['Graph routing and shortest-path problems are very common', 'System design: focus on real-time, geo-distributed systems (surge pricing, driver matching)', 'Think about scalability at city/country scale'],
      },
      netflix: {
        difficulty: 'VERY_HARD',
        offerRate: '~2–5% from application to offer (extremely selective)',
        timeline: 'Recruiter screen → 2–3 technical rounds → System design round → Culture fit → 5–8 weeks total',
        oaPlatform: 'CoderPad / Take-home',
        oaDuration: 'Varies (often a take-home project)',
        frequentTopics: ['Distributed Systems', 'System Design (streaming, CDN)', 'Java/Python', 'Algorithms', 'Database Design'],
        insiderTips: ['Netflix has a very high bar — senior engineers only (no juniors in most teams)', 'Culture fit is critical: freedom & responsibility principle', 'System design focuses on streaming pipelines and CDN architecture'],
      },
      atlassian: {
        difficulty: 'MEDIUM',
        offerRate: '~12–20% from technical screen to offer',
        timeline: 'Recruiter screen → Values interview → Technical phone screen → Onsite (3 rounds) → 3–4 weeks total',
        oaPlatform: 'HackerRank',
        oaDuration: '60 minutes',
        frequentTopics: ['Graphs', 'Trees', 'System Design (Jira/Confluence scale)', 'Behavioral/Values', 'Data Structures'],
        insiderTips: ['Atlassian values behavioral/cultural fit heavily — practice their 5 values', 'Collaborative pair-programming style: talk through your thought process', 'System design: focus on collaborative, multi-tenant SaaS products'],
      },
      adobe: {
        difficulty: 'MEDIUM',
        offerRate: '~12–20% from technical screen to offer',
        timeline: 'Recruiter call → Technical phone screen → Onsite (3–4 rounds) → 3–5 weeks total',
        oaPlatform: 'HackerRank / Codility',
        oaDuration: '75 minutes',
        frequentTopics: ['OOP & Design Patterns', 'Trees', 'Graphs', 'Dynamic Programming', 'System Design', 'Image Processing concepts'],
        insiderTips: ['OOP design patterns (Factory, Observer, Strategy) are very common', 'System design often involves document/image processing pipelines', 'Focus on clean, modular code — Adobe values software craftsmanship'],
      },
    };

    // Match company name to a profile (case-insensitive, partial match)
    const key = Object.keys(profiles).find(k => company.toLowerCase().includes(k));
    const profile = key ? profiles[key] : null;

    return {
      company,
      role,
      oaFormat: {
        platform: profile?.oaPlatform ?? 'HackerRank / Company Portal',
        duration: profile?.oaDuration ?? 'Varies by role',
        questionTypes: ['DSA problems', 'Problem solving'],
        tips: ['Read the problem statement carefully', 'Handle edge cases', 'Aim for optimal complexity'],
      },
      interviewRounds: [],
      frequentTopics: profile?.frequentTopics ?? ['Arrays', 'Dynamic Programming', 'Trees', 'System Design'],
      recentQuestions: [],
      preparationResources: [
        { title: 'LeetCode', url: 'https://leetcode.com', type: 'practice', description: 'Primary DSA practice platform' },
        { title: 'NeetCode', url: 'https://neetcode.io', type: 'video', description: 'Structured problem-solving roadmap' },
        { title: 'Glassdoor', url: `https://www.glassdoor.com/Interview/${company.replace(/\s+/g, '-')}-Interview-Questions-E.htm`, type: 'article', description: `${company} interview experiences from past candidates` },
      ],
      salaryInsights: `Check Glassdoor and Levels.fyi for the latest ${company} ${role} compensation data.`,
      difficulty: profile?.difficulty ?? 'MEDIUM',
      offerRate: profile?.offerRate ?? 'Typically 10–20% from technical screen to offer (varies by role and team)',
      timeline: profile?.timeline ?? 'Recruiter screen → Technical rounds → HR → 3–6 weeks total',
      insiderTips: profile?.insiderTips ?? ['Prepare thoroughly across DSA and system design', 'Practice mock interviews', 'Review company-specific interview experiences on Glassdoor'],
      sources: [],
      researchedAt: new Date().toISOString(),
    };
  }

  // ============================================================
  // REPORT SUMMARIZATION
  // ============================================================

  async summarizeReports(reports: string[], companyName: string): Promise<string> {
    const prompt = `You are an expert career advisor analyzing interview reports for ${companyName}.

Here are ${reports.length} interview reports:
${reports.slice(0, 10).map((r, i) => `Report ${i + 1}: ${r}`).join('\n\n')}

Generate a comprehensive 3-4 paragraph analysis covering:
1. Overall interview process and structure
2. Common technical topics and difficulty level  
3. Behavioral/culture fit expectations
4. Key preparation tips specific to this company

Be specific, actionable, and grounded in the actual reports. Write in second person.`;

    try {
      const result = await this.fastModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      return `Interview analysis for ${companyName} is being generated. Check back soon.`;
    }
  }

  // ============================================================
  // TOPIC CLASSIFICATION
  // ============================================================

  async classifyTopics(questionTexts: string[]): Promise<string[][]> {
    const prompt = `Classify each coding/technical question into DSA/CS topics.

Questions:
${questionTexts.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Return ONLY a JSON array where each element is an array of topics for the corresponding question:
[["array", "two pointers"], ["graph", "BFS"], ...]

Available topic categories: arrays, strings, linked list, trees, graphs, dynamic programming, 
backtracking, sorting, binary search, stack, queue, heap, hash map, math, bit manipulation,
system design, database, OS, networking, OOP, behavioral, leadership`;

    try {
      const result = await this.fastModel.generateContent(prompt);
      return this.parseJSON<string[][]>(result.response.text(), questionTexts.map(() => []));
    } catch {
      return questionTexts.map(() => []);
    }
  }

  // ============================================================
  // RESUME ANALYSIS
  // ============================================================

  async analyzeResume(resumeText: string): Promise<Partial<ResumeAnalysis>> {
    const prompt = `Analyze this resume and provide structured feedback.

RESUME:
"""
${resumeText}
"""

Return ONLY a valid JSON object:
{
  "skills": ["skill1", "skill2"],
  "experience": "summary of experience level",
  "suggestions": [
    {
      "category": "Skills|Experience|Education|Format|Keywords",
      "priority": "high|medium|low",
      "suggestion": "specific actionable suggestion",
      "impact": "why this matters"
    }
  ],
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "overallScore": 75
}`;

    try {
      const result = await this.model.generateContent(prompt);
      return this.parseJSON(result.response.text(), {});
    } catch {
      return {};
    }
  }

  // ============================================================
  // RESUME vs JD COMPARISON
  // ============================================================

  async compareResumeToJD(resumeText: string, jdText: string): Promise<ResumeAnalysis> {
    const prompt = this.buildResumeJDPrompt(resumeText, jdText);

    try {
      // Use fastModel (gemini-3.8-flash) — fall back to gemini-3.1-flash-lite if overloaded
      let result;
      try {
        result = await this.fastModel.generateContent(prompt);
      } catch (fastErr) {
        console.warn('fastModel failed, falling back to gemini-3.1-flash-lite:', fastErr);
        result = await this.model.generateContent(prompt);
      }

      const parsed = this.parseJSON<ResumeAnalysis>(result.response.text(), this.defaultResumeAnalysis());
      // Safety clamp: ensure scores are valid integers 0-100
      const clamp = (v: unknown) => Math.min(100, Math.max(0, typeof v === 'number' ? Math.round(v) : 0));
      parsed.atsScore = clamp(parsed.atsScore);
      parsed.skillsBreakdown = {
        technical: clamp(parsed.skillsBreakdown?.technical),
        experience: clamp(parsed.skillsBreakdown?.experience),
        education: clamp(parsed.skillsBreakdown?.education),
        keywords: clamp(parsed.skillsBreakdown?.keywords),
      };
      return parsed;
    } catch (error) {
      console.error('Resume-JD comparison error:', error);
      return this.defaultResumeAnalysis();
    }
  }

  private buildResumeJDPrompt(resumeText: string, jdText: string): string {
    return `You are a strict ATS (Applicant Tracking System) evaluator. Score the resume below against the job description based SOLELY on the actual text content. Do NOT use placeholder values.

JOB DESCRIPTION:
"""
${jdText}
"""

CANDIDATE RESUME:
"""
${resumeText}
"""

SCORING RUBRIC — derive every number from the actual text above:

atsScore (integer 0–100):
  90–100: Candidate has ALL required skills, relevant experience matching the role seniority, and most JD keywords.
  70–89:  Strong match — has most required skills/keywords, only minor gaps.
  50–69:  Moderate match — has some relevant skills but missing key requirements.
  30–49:  Weak match — limited overlap, significant skill/experience gaps.
   0–29:  Poor match — resume does not meaningfully match this job description.

skillsBreakdown (each 0–100, proportional to actual overlap):
  technical:  Fraction of required technical skills/tools explicitly present in the resume.
  experience: How well the candidate's years of experience and seniority match the JD requirements.
  education:  Degree, field, and level match against stated educational requirements.
  keywords:   Fraction of important JD keywords (tools, frameworks, certifications) found in the resume.

Return ONLY a valid JSON object with no markdown, no code fences:
{
  "atsScore": <integer you calculated using the rubric>,
  "matchedSkills": [<skills explicitly present in both resume and JD>],
  "missingSkills": [<required JD skills absent from the resume>],
  "matchedKeywords": [<JD keywords that appear in the resume>],
  "suggestions": [
    {
      "category": <"Skills" | "Experience" | "Keywords" | "Formatting">,
      "priority": <"high" | "medium" | "low">,
      "suggestion": <specific actionable advice>,
      "impact": <why this improves the ATS score>
    }
  ],
  "skillsBreakdown": {
    "technical": <integer you calculated>,
    "experience": <integer you calculated>,
    "education": <integer you calculated>,
    "keywords": <integer you calculated>
  },
  "summary": <2-3 sentence qualitative assessment mentioning the actual calculated score>
}`;
  }

  // ============================================================
  // STUDY ROADMAP GENERATION
  // ============================================================

  async generateRoadmap(params: {
    company: string;
    role: string;
    experienceLevel: string;
    availableDays: number;
    dailyHours: number;
    weakTopics?: string[];
    topTopics?: string[];
  }): Promise<StudyRoadmap> {
    const prompt = this.buildRoadmapPrompt(params);

    try {
      // Use fastModel for better reasoning quality on roadmap generation
      let result;
      try {
        result = await this.fastModel.generateContent(prompt);
      } catch (fastErr) {
        console.warn('fastModel failed for roadmap, falling back to gemini-3.1-flash-lite:', fastErr);
        result = await this.model.generateContent(prompt);
      }
      const parsed = this.parseJSON<StudyRoadmap>(result.response.text(), this.defaultRoadmap(params.availableDays));
      // Ensure the plan has actual days content
      if (!parsed.days || parsed.days.length === 0) {
        console.warn('Roadmap returned empty days, using fallback');
        return this.defaultRoadmap(params.availableDays);
      }
      return parsed;
    } catch (error) {
      console.error('Roadmap generation error:', error);
      return this.defaultRoadmap(params.availableDays);
    }
  }

  private buildRoadmapPrompt(params: {
    company: string;
    role: string;
    experienceLevel: string;
    availableDays: number;
    dailyHours: number;
    weakTopics?: string[];
    topTopics?: string[];
  }): string {
    // Build a company-specific known interview pattern context
    const companyLower = params.company.toLowerCase();
    let companyContext = '';
    if (companyLower.includes('google')) {
      companyContext = 'Google interviews emphasize: Graphs/Trees/DP (very heavily), System Design (scalability, distributed systems), clean code with optimal complexity. Leetcode Hard is common. Behavioral uses STAR format. Known patterns: BFS/DFS trees, trie, segment tree, LRU cache, rate limiter design.';
    } else if (companyLower.includes('amazon')) {
      companyContext = 'Amazon interviews emphasize: Leadership Principles (14 LPs, very heavily in behavioral), Arrays/Graphs/DP coding, System Design (microservices, SQS, DynamoDB). Two-stage: OA on HackerRank then 4-5 rounds. Common: LRU cache, meeting rooms, word ladder, design Amazon ordering system.';
    } else if (companyLower.includes('microsoft')) {
      companyContext = 'Microsoft interviews emphasize: Trees/Graphs/DP/String manipulation, Object-Oriented Design, collaborative problem solving. 4-5 rounds, strong emphasis on communication. Common: serialize/deserialize BST, clone graph, design parking lot.';
    } else if (companyLower.includes('meta') || companyLower.includes('facebook')) {
      companyContext = 'Meta/Facebook interviews emphasize: Graphs, Trees, Arrays/Strings, Product Sense (for senior), System Design (social graph, news feed, ads). Fast-paced coding. Common: Number of Islands, Course Schedule, Design Facebook Messenger.';
    } else if (companyLower.includes('apple')) {
      companyContext = 'Apple interviews emphasize: Data Structures, Algorithms, Swift/Objective-C knowledge (for mobile), System Design. Polished communication expected. Common: implement LRU, design Siri, string parsing.';
    } else if (companyLower.includes('flipkart')) {
      companyContext = 'Flipkart interviews emphasize: DSA (Arrays, Trees, DP, Graphs), System Design (e-commerce scale: catalog, cart, payments, search), Low-Level Design (OOP). OA on HackerEarth. Common: design a shopping cart, recommendation engine, inventory system.';
    } else if (companyLower.includes('uber')) {
      companyContext = 'Uber interviews emphasize: Graphs (routing algorithms), Real-time systems, Geospatial problems, System Design (surge pricing, matching). Common: nearest driver matching, graph shortest path variants, design Uber backend.';
    } else if (companyLower.includes('netflix')) {
      companyContext = 'Netflix interviews emphasize: Distributed Systems, Streaming architecture, Java/Python, System Design (CDN, recommendation, A/B testing), Coding (medium-hard DSA). Common: design Netflix streaming, implement rate limiter, consistent hashing.';
    } else if (companyLower.includes('atlassian')) {
      companyContext = 'Atlassian interviews emphasize: Collaborative coding (pair programming style), Data Structures, System Design (Jira/Confluence scale), Values-fit behavioral. Common: graph traversal, design issue tracker, LRU cache.';
    } else if (companyLower.includes('adobe')) {
      companyContext = 'Adobe interviews emphasize: OOP/Design Patterns, DSA (Trees, Graphs, DP), Image/Document processing concepts, System Design. Common: design Photoshop undo, PDF rendering pipeline, implement iterator pattern.';
    } else {
      companyContext = `Research known interview patterns for ${params.company}: focus on their core product domain (e.g. fintech → rate limiter/fraud detection, edtech → recommendation/search, gaming → real-time/graph), commonly seen DSA topics from interview forums, and their tech stack.`;
    }

    const topicsSection = params.topTopics?.length
      ? `HIGH-FREQUENCY TOPICS FROM ${params.company.toUpperCase()}'s ACTUAL INTERVIEW DATA: ${params.topTopics.join(', ')}\nPrioritize these topics heavily throughout the plan.`
      : `Use your knowledge of ${params.company}'s interview patterns to select the most relevant topics.`;

    return `You are an expert interview coach. Generate a COMPANY-SPECIFIC, ROLE-SPECIFIC study roadmap. This plan must be meaningfully different from a generic DSA plan — it must reflect the ACTUAL interview style and common questions of ${params.company}.

COMPANY: ${params.company}
ROLE: ${params.role}
EXPERIENCE LEVEL: ${params.experienceLevel}
PREPARATION DAYS: ${params.availableDays}
DAILY HOURS AVAILABLE: ${params.dailyHours}

COMPANY INTERVIEW INTELLIGENCE:
${companyContext}

${topicsSection}
${params.weakTopics?.length ? `\nCANDIDATE WEAK AREAS TO ADDRESS: ${params.weakTopics.join(', ')}` : ''}

INSTRUCTIONS:
1. The overview must mention ${params.company} specifically and what makes their interviews unique.
2. Day titles and tasks must reference ${params.company}-specific patterns (e.g. "Amazon Leadership Principles Deep Dive", "Google Graph Traversal Mastery").
3. Distribute topic coverage so the most important topics for ${params.company} get more days.
4. Include at least one System Design day if the role is SDE-2 or senior, or if ${params.company} is known for it.
5. Include behavioral prep days tailored to ${params.company}'s values/culture.
6. Each day must have 3-4 tasks: study theory, practice problems, review/reflect, and optionally a mock challenge.
7. Milestones must reflect ${params.company}-specific readiness checkpoints.

Return ONLY valid JSON (no markdown, no code fences):
{
  "totalDays": ${params.availableDays},
  "overview": "${params.company}-specific overview of the preparation strategy for ${params.role}",
  "milestones": [
    {"day": ${Math.ceil(params.availableDays * 0.25)}, "title": "Foundation Locked", "description": "Core DSA patterns relevant to ${params.company}"},
    {"day": ${Math.ceil(params.availableDays * 0.6)}, "title": "${params.company} Pattern Mastery", "description": "High-frequency ${params.company} topics covered"},
    {"day": ${params.availableDays}, "title": "Interview Ready for ${params.company}", "description": "Mock interviews, behavioral prep, final review"}
  ],
  "days": [
    {
      "day": 1,
      "title": "[Company-specific day title]",
      "topics": ["Topic1", "Topic2"],
      "tasks": [
        {"type": "study", "description": "[Specific to ${params.company}]", "duration": 45},
        {"type": "practice", "description": "[Specific LeetCode problems or patterns]", "duration": 60, "difficulty": "easy"},
        {"type": "review", "description": "Review and note patterns", "duration": 15}
      ],
      "estimatedHours": ${params.dailyHours},
      "resources": ["LeetCode", "NeetCode"]
    }
  ],
  "resources": [
    {"title": "LeetCode", "type": "practice", "url": "https://leetcode.com"},
    {"title": "NeetCode", "type": "video", "url": "https://neetcode.io"}
  ],
  "tips": ["${params.company}-specific tip 1", "${params.company}-specific tip 2"]
}

Generate all ${params.availableDays} days. Return ONLY the JSON.`;
  }

  // ============================================================
  // MOCK INTERVIEW GENERATION
  // ============================================================

  async generateMockInterview(params: {
    company: string;
    role: string;
    type: string;
    difficulty: string;
    numQuestions: number;
    topTopics?: string[];
    userWeaknesses?: string[];
  }): Promise<MockInterviewSet> {
    const prompt = this.buildMockInterviewPrompt(params);

    try {
      const result = await this.model.generateContent(prompt);
      return this.parseJSON<MockInterviewSet>(result.response.text(), this.defaultMockInterview());
    } catch (error) {
      console.error('Mock interview generation error:', error);
      return this.defaultMockInterview();
    }
  }

  private buildMockInterviewPrompt(params: {
    company: string;
    role: string;
    type: string;
    difficulty: string;
    numQuestions: number;
    topTopics?: string[];
    userWeaknesses?: string[];
  }): string {
    return `You are an expert interviewer at ${params.company}. Generate a realistic mock interview.

COMPANY: ${params.company}
ROLE: ${params.role}  
INTERVIEW TYPE: ${params.type}
DIFFICULTY: ${params.difficulty}
QUESTIONS NEEDED: ${params.numQuestions}
${params.topTopics?.length ? `FOCUS TOPICS: ${params.topTopics.join(', ')}` : ''}
${params.userWeaknesses?.length ? `CANDIDATE WEAK AREAS: ${params.userWeaknesses.join(', ')}` : ''}

Return ONLY valid JSON:
{
  "sessionId": "mock-session-001",
  "instructions": "Welcome to your mock interview for ${params.company}...",
  "timeLimit": 60,
  "questions": [
    {
      "id": "q1",
      "text": "Specific interview question here",
      "type": "${params.type}",
      "difficulty": "${params.difficulty}",
      "hints": ["hint 1", "hint 2"],
      "timeRecommended": 20,
      "evaluationCriteria": ["correctness", "approach explanation", "edge cases"]
    }
  ]
}

Generate exactly ${params.numQuestions} questions relevant to ${params.company}'s interview style.
Return ONLY the JSON.`;
  }

  // ============================================================
  // ANSWER EVALUATION
  // ============================================================

  async evaluateMockAnswer(params: {
    question: string;
    answer: string;
    questionType: string;
    difficulty: string;
  }): Promise<AnswerEvaluation> {
    const prompt = `You are an expert interviewer evaluating a candidate's answer.

QUESTION: "${params.question}"
QUESTION TYPE: ${params.questionType}
DIFFICULTY: ${params.difficulty}

CANDIDATE'S ANSWER:
"""
${params.answer}
"""

Evaluate and return ONLY valid JSON:
{
  "score": 75,
  "communication": 80,
  "correctness": 70,
  "optimization": 65,
  "conceptualUnderstanding": 80,
  "strengths": ["Good problem decomposition", "Clear explanation"],
  "improvements": ["Could improve time complexity", "Edge cases not handled"],
  "modelAnswer": "Ideal answer explanation here...",
  "followUpQuestions": ["What is the time complexity?", "Can you optimize further?"]
}

All numeric scores are 0-100. Be honest but constructive. Return ONLY the JSON.`;

    try {
      const result = await this.model.generateContent(prompt);
      return this.parseJSON<AnswerEvaluation>(result.response.text(), this.defaultEvaluation());
    } catch {
      return this.defaultEvaluation();
    }
  }

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================

  async generateRecommendations(params: {
    userRole?: string;
    targetCompanies?: string[];
    recentActivity?: string[];
    weakTopics?: string[];
  }): Promise<string[]> {
    const prompt = `Generate 5 personalized interview preparation recommendations.
    
User Context:
- Target Role: ${params.userRole || 'Software Engineer'}
- Target Companies: ${params.targetCompanies?.join(', ') || 'Top Tech Companies'}
- Recent Activity: ${params.recentActivity?.join(', ') || 'Just started preparation'}
- Weak Topics: ${params.weakTopics?.join(', ') || 'Not assessed yet'}

Return ONLY a JSON array of 5 specific, actionable recommendation strings:
["Focus on dynamic programming - appears in 70% of Google interviews", ...]`;

    try {
      const result = await this.fastModel.generateContent(prompt);
      return this.parseJSON<string[]>(result.response.text(), []);
    } catch {
      return ['Review data structures and algorithms fundamentals', 'Practice system design concepts'];
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private parseJSON<T>(text: string, fallback: T): T {
    try {
      // Strip markdown code blocks if present
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch {
      return fallback;
    }
  }

  private defaultExtractedInterview(): ExtractedInterview {
    return {
      company: 'Unknown',
      role: 'Software Engineer',
      difficulty: 'MEDIUM',
      rounds: [],
      questions: [],
      topics: [],
      technologies: [],
      behavioralTopics: [],
      systemDesignTopics: [],
      offerStatus: 'UNKNOWN',
      summary: 'Interview experience being processed.',
      tips: [],
    };
  }

  private defaultResumeAnalysis(): ResumeAnalysis {
    return {
      atsScore: 0,
      matchedSkills: [],
      missingSkills: [],
      matchedKeywords: [],
      suggestions: [],
      skillsBreakdown: { technical: 0, experience: 0, education: 0, keywords: 0 },
      summary: 'Analysis pending. Please try again.',
    };
  }

  private defaultRoadmap(days: number): StudyRoadmap {
    return {
      totalDays: days,
      overview: 'Personalized study plan being generated.',
      milestones: [],
      days: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1} Study Session`,
        topics: ['Review previous topics'],
        tasks: [{ type: 'study', description: 'Study and practice', duration: 60 }],
        estimatedHours: 3,
        resources: [],
      })),
      resources: [],
      tips: [],
    };
  }

  private defaultMockInterview(): MockInterviewSet {
    return {
      sessionId: `session-${Date.now()}`,
      questions: [
        {
          id: 'q1',
          text: 'Explain your approach to solving complex algorithmic problems.',
          type: 'BEHAVIORAL',
          difficulty: 'MEDIUM',
          hints: [],
          timeRecommended: 5,
          evaluationCriteria: ['clarity', 'structure', 'examples'],
        },
      ],
      instructions: 'Answer each question clearly and concisely.',
      timeLimit: 60,
    };
  }

  private defaultEvaluation(): AnswerEvaluation {
    return {
      score: 50,
      communication: 50,
      correctness: 50,
      optimization: 50,
      conceptualUnderstanding: 50,
      strengths: ['Attempted the problem'],
      improvements: ['Provide more detail in your answer'],
      modelAnswer: 'A complete answer would include...',
      followUpQuestions: [],
    };
  }
}

export const aiService = new AIService();
export default aiService;
