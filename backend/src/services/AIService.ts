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

    // ✅ Gemini 2.5 Flash — User-facing AI features (e.g. roadmaps, mock interviews, chat)
    this.fastModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // ✅ Gemini 2.5 Flash + Google Search Grounding — Live dynamic company research
    this.researchModel = genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash' },
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
      // Call Gemini 2.5 Pro with Google Search Grounding enabled
      const result = await this.researchModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} } as any],
      });

      const text = result.response.text();
      const parsed = this.parseJSON<CompanyResearch>(text, this.defaultCompanyResearch(company, role));

      // Attach grounding sources if available
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

      parsed.researchedAt = new Date().toISOString();
      return parsed;
    } catch (error) {
      console.error('Company research error:', error);
      return this.defaultCompanyResearch(company, role);
    }
  }

  private defaultCompanyResearch(company: string, role: string): CompanyResearch {
    return {
      company,
      role,
      oaFormat: {
        platform: 'HackerRank',
        duration: 'Varies',
        questionTypes: ['DSA problems'],
        tips: ['Practice consistently'],
      },
      interviewRounds: [],
      frequentTopics: ['Arrays', 'Dynamic Programming', 'System Design'],
      recentQuestions: [],
      preparationResources: [
        { title: 'LeetCode', url: 'https://leetcode.com', type: 'practice', description: 'Primary DSA practice platform' },
        { title: 'NeetCode', url: 'https://neetcode.io', type: 'video', description: 'Structured problem-solving roadmap' },
      ],
      salaryInsights: 'Check Glassdoor for latest compensation data.',
      difficulty: 'MEDIUM',
      offerRate: 'Data being gathered...',
      timeline: 'Typically 4-6 weeks from application to offer.',
      insiderTips: ['Prepare thoroughly', 'Practice mock interviews'],
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
      const result = await this.model.generateContent(prompt);
      const parsed = this.parseJSON<ResumeAnalysis>(result.response.text(), this.defaultResumeAnalysis());
      return parsed;
    } catch (error) {
      console.error('Resume-JD comparison error:', error);
      return this.defaultResumeAnalysis();
    }
  }

  private buildResumeJDPrompt(resumeText: string, jdText: string): string {
    return `You are an expert ATS (Applicant Tracking System) analyzer and career advisor.

JOB DESCRIPTION:
"""
${jdText}
"""

CANDIDATE RESUME:
"""
${resumeText}
"""

Analyze the match and return ONLY a valid JSON object:
{
  "atsScore": 78,
  "matchedSkills": ["Python", "React", "SQL"],
  "missingSkills": ["Docker", "Kubernetes", "AWS"],
  "matchedKeywords": ["agile", "microservices", "CI/CD"],
  "suggestions": [
    {
      "category": "Skills",
      "priority": "high",
      "suggestion": "Add Docker and Kubernetes experience",
      "impact": "These are required skills in the JD that are missing from your resume"
    }
  ],
  "skillsBreakdown": {
    "technical": 75,
    "experience": 80,
    "education": 90,
    "keywords": 65
  },
  "summary": "Your resume is a strong match for this role with 78% compatibility..."
}

Score rules: atsScore is 0-100, skillsBreakdown values are 0-100.
Return ONLY the JSON.`;
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
      const result = await this.model.generateContent(prompt);
      return this.parseJSON<StudyRoadmap>(result.response.text(), this.defaultRoadmap(params.availableDays));
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
    return `You are an expert interview coach creating a personalized study roadmap.

TARGET: ${params.company} - ${params.role}
EXPERIENCE LEVEL: ${params.experienceLevel}
AVAILABLE DAYS: ${params.availableDays}
DAILY HOURS: ${params.dailyHours}
${params.weakTopics?.length ? `WEAK AREAS: ${params.weakTopics.join(', ')}` : ''}
${params.topTopics?.length ? `FREQUENTLY ASKED: ${params.topTopics.join(', ')}` : ''}

Create a detailed study roadmap. Return ONLY valid JSON:
{
  "totalDays": ${params.availableDays},
  "overview": "Brief overview of the preparation strategy",
  "milestones": [
    {"day": 7, "title": "Foundation Complete", "description": "Master basic data structures"},
    {"day": 14, "title": "Algorithm Proficiency", "description": "..."}
  ],
  "days": [
    {
      "day": 1,
      "title": "Arrays & Strings Foundation",
      "topics": ["Arrays", "Two Pointers", "Sliding Window"],
      "tasks": [
        {"type": "study", "description": "Study array operations and time complexity", "duration": 45},
        {"type": "practice", "description": "Solve 3 easy array problems on LeetCode", "duration": 60, "difficulty": "easy"},
        {"type": "review", "description": "Review solutions and patterns", "duration": 15}
      ],
      "estimatedHours": ${params.dailyHours},
      "resources": ["LeetCode Arrays", "NeetCode Arrays playlist"]
    }
  ],
  "resources": [
    {"title": "LeetCode", "type": "practice", "url": "https://leetcode.com"},
    {"title": "NeetCode", "type": "video", "url": "https://neetcode.io"}
  ],
  "tips": ["Focus on patterns, not memorization", "Practice timed coding"]
}

Create plans for all ${params.availableDays} days. Day plans should be progressive (easy → hard).
Return ONLY the JSON.`;
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
