import { prisma } from '../utils/prisma';
import { aiService } from './AIService';
import { resolveUserId } from '../utils/userResolver';

export class MockService {
  async startSession(params: {
    userId?: string;
    companyId?: string;
    companyName: string;
    role: string;
    type: string;
    difficulty: string;
    numQuestions?: number;
  }) {
    const internalUserId = await resolveUserId(params.userId);
    const numQuestions = params.numQuestions || 5;

    // Resolve company from DB
    let resolvedCompanyId = params.companyId;
    let companyName = params.companyName.trim();

    if (!resolvedCompanyId) {
      const company = await prisma.company.findFirst({
        where: {
          OR: [
            { slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
            { name: { equals: companyName, mode: 'insensitive' } },
          ],
        },
      });
      if (company) {
        resolvedCompanyId = company.id;
        companyName = company.name;
      }
    }

    // Get top topics and actual questions asked at this company
    let topTopics: string[] = [];
    let realQuestions: string[] = [];

    if (resolvedCompanyId) {
      const cqs = await prisma.companyQuestion.findMany({
        where: { companyId: resolvedCompanyId },
        include: { question: { include: { topics: { include: { topic: true } } } } },
        orderBy: { frequency: 'desc' },
        take: 15,
      });

      const freq: Record<string, number> = {};
      cqs.forEach((cq) => {
        if (cq.question?.text) realQuestions.push(cq.question.text);
        cq.question?.topics?.forEach((qt) => {
          freq[qt.topic.name] = (freq[qt.topic.name] || 0) + 1;
        });
      });

      topTopics = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([t]) => t);
    }

    // Generate questions with Gemini AI
    const interviewSet = await aiService.generateMockInterview({
      company: companyName,
      role: params.role,
      type: params.type,
      difficulty: params.difficulty,
      numQuestions,
      topTopics,
      userWeaknesses: realQuestions.slice(0, 3),
    });

    // Create session in DB
    const session = await prisma.mockSession.create({
      data: {
        userId: internalUserId,
        companyId: resolvedCompanyId,
        role: params.role,
        type: (params.type as any) || 'CODING',
        difficulty: (params.difficulty as any) || 'MEDIUM',
        timeLimit: interviewSet.timeLimit || 60,
        status: 'IN_PROGRESS',
        questions: {
          create: interviewSet.questions.map((q) => ({
            questionText: q.text,
            questionType: (q.type as any) || (params.type as any) || 'CODING',
          })),
        },
      },
      include: {
        company: { select: { name: true, slug: true, logo: true, tier: true } },
        questions: true,
      },
    });

    return { session, interviewSet };
  }

  async submitAnswer(params: {
    sessionId: string;
    questionId: string;
    answer: string;
    timeTaken?: number;
  }) {
    const mockQuestion = await prisma.mockQuestion.findFirst({
      where: {
        id: params.questionId,
        sessionId: params.sessionId,
      },
    });

    if (!mockQuestion) throw new Error('Question not found in this session');

    // Get AI evaluation from Gemini
    const evaluation = await aiService.evaluateMockAnswer({
      question: mockQuestion.questionText,
      answer: params.answer,
      questionType: mockQuestion.questionType,
      difficulty: 'MEDIUM',
    });

    // Update question with candidate answer and evaluation
    const updated = await prisma.mockQuestion.update({
      where: { id: params.questionId },
      data: {
        userAnswer: params.answer,
        aiEvaluation: evaluation as any,
        score: evaluation.score,
        timeTaken: params.timeTaken,
      },
    });

    return updated;
  }

  async completeSession(sessionId: string, userId?: string) {
    const session = await prisma.mockSession.findFirst({
      where: { id: sessionId },
      include: {
        questions: true,
        company: { select: { name: true, slug: true } },
      },
    });

    if (!session) throw new Error('Session not found');

    const answeredQuestions = session.questions.filter((q) => q.score !== null);
    const totalScore =
      answeredQuestions.length > 0
        ? Math.round(
            answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) /
              answeredQuestions.length
          )
        : 0;

    // Calculate aggregated metrics
    let communicationAvg = 0;
    let correctnessAvg = 0;
    let optimizationAvg = 0;
    let conceptualAvg = 0;
    const strengthsSet = new Set<string>();
    const improvementsSet = new Set<string>();

    answeredQuestions.forEach((q) => {
      const evalData = q.aiEvaluation as any;
      if (evalData) {
        if (evalData.communication) communicationAvg += evalData.communication;
        if (evalData.correctness) correctnessAvg += evalData.correctness;
        if (evalData.optimization) optimizationAvg += evalData.optimization;
        if (evalData.conceptualUnderstanding) conceptualAvg += evalData.conceptualUnderstanding;
        evalData.strengths?.forEach((s: string) => strengthsSet.add(s));
        evalData.improvements?.forEach((im: string) => improvementsSet.add(im));
      }
    });

    const count = answeredQuestions.length || 1;
    communicationAvg = Math.round(communicationAvg / count) || totalScore;
    correctnessAvg = Math.round(correctnessAvg / count) || totalScore;
    optimizationAvg = Math.round(optimizationAvg / count) || totalScore;
    conceptualAvg = Math.round(conceptualAvg / count) || totalScore;

    let recommendation = 'No Hire';
    if (totalScore >= 85) recommendation = 'Strong Hire';
    else if (totalScore >= 75) recommendation = 'Hire';
    else if (totalScore >= 60) recommendation = 'Lean Hire';

    const overallFeedback = {
      totalScore,
      recommendation,
      questionsAttempted: answeredQuestions.length,
      totalQuestions: session.questions.length,
      metrics: {
        communication: communicationAvg,
        correctness: correctnessAvg,
        optimization: optimizationAvg,
        conceptualUnderstanding: conceptualAvg,
      },
      summary: `You scored ${totalScore}/100 with a '${recommendation}' evaluation. Attempted ${answeredQuestions.length} of ${session.questions.length} questions for ${session.company?.name || 'interview'}.`,
      strengths: Array.from(strengthsSet).slice(0, 5),
      improvements: Array.from(improvementsSet).slice(0, 5),
    };

    return prisma.mockSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        totalScore,
        feedback: overallFeedback as any,
      },
      include: {
        company: { select: { name: true, slug: true, logo: true, tier: true } },
        questions: true,
      },
    });
  }

  async getSessionReport(sessionId: string, _userId?: string) {
    return prisma.mockSession.findFirst({
      where: { id: sessionId },
      include: {
        company: { select: { name: true, slug: true, logo: true, tier: true } },
        questions: true,
      },
    });
  }

  async getUserSessions(userId?: string) {
    const internalUserId = await resolveUserId(userId);
    return prisma.mockSession.findMany({
      where: { userId: internalUserId },
      include: {
        company: { select: { name: true, slug: true, logo: true, tier: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }
}

export const mockService = new MockService();
