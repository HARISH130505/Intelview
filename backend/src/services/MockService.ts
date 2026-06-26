import { prisma } from '../utils/prisma';
import { aiService } from './AIService';

export class MockService {
  async startSession(params: {
    userId: string;
    companyId?: string;
    companyName: string;
    role: string;
    type: string;
    difficulty: string;
    numQuestions?: number;
  }) {
    const numQuestions = params.numQuestions || 5;

    // Get top topics for company
    let topTopics: string[] = [];
    if (params.companyId) {
      const cqs = await prisma.companyQuestion.findMany({
        where: { companyId: params.companyId },
        include: { question: { include: { topics: { include: { topic: true } } } } },
        orderBy: { frequency: 'desc' },
        take: 15,
      });
      const freq: Record<string, number> = {};
      cqs.forEach(cq => cq.question.topics.forEach(qt => {
        freq[qt.topic.name] = (freq[qt.topic.name] || 0) + 1;
      }));
      topTopics = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t]) => t);
    }

    // Generate questions with AI
    const interviewSet = await aiService.generateMockInterview({
      company: params.companyName,
      role: params.role,
      type: params.type,
      difficulty: params.difficulty,
      numQuestions,
      topTopics,
    });

    // Create session in DB
    const session = await prisma.mockSession.create({
      data: {
        userId: params.userId,
        companyId: params.companyId,
        role: params.role,
        type: params.type as any,
        difficulty: params.difficulty as any,
        timeLimit: interviewSet.timeLimit,
        questions: {
          create: interviewSet.questions.map(q => ({
            questionText: q.text,
            questionType: q.type as any,
          })),
        },
      },
      include: { questions: true },
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
      where: { id: params.questionId, sessionId: params.sessionId },
    });

    if (!mockQuestion) throw new Error('Question not found in session');

    // Get AI evaluation
    const evaluation = await aiService.evaluateMockAnswer({
      question: mockQuestion.questionText,
      answer: params.answer,
      questionType: mockQuestion.questionType,
      difficulty: 'MEDIUM',
    });

    // Update question with answer and evaluation
    return prisma.mockQuestion.update({
      where: { id: params.questionId },
      data: {
        userAnswer: params.answer,
        aiEvaluation: evaluation as any,
        score: evaluation.score,
        timeTaken: params.timeTaken,
      },
    });
  }

  async completeSession(sessionId: string, userId: string) {
    const session = await prisma.mockSession.findFirst({
      where: { id: sessionId, userId },
      include: { questions: true },
    });

    if (!session) throw new Error('Session not found');

    const answeredQuestions = session.questions.filter(q => q.score !== null);
    const totalScore = answeredQuestions.length > 0
      ? Math.round(answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / answeredQuestions.length)
      : 0;

    // Generate overall feedback
    const allEvaluations = session.questions
      .filter(q => q.aiEvaluation)
      .map(q => JSON.stringify(q.aiEvaluation));
    
    const overallFeedback = {
      totalScore,
      questionsAttempted: answeredQuestions.length,
      totalQuestions: session.questions.length,
      summary: `You scored ${totalScore}/100. ${answeredQuestions.length}/${session.questions.length} questions answered.`,
      strengths: ['Good problem-solving approach'],
      improvements: ['Practice more edge cases'],
    };

    return prisma.mockSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        totalScore,
        feedback: overallFeedback as any,
      },
      include: { questions: true },
    });
  }

  async getSessionReport(sessionId: string, userId: string) {
    return prisma.mockSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        company: { select: { name: true, slug: true } },
        questions: true,
      },
    });
  }

  async getUserSessions(userId: string) {
    return prisma.mockSession.findMany({
      where: { userId },
      include: {
        company: { select: { name: true, slug: true, logo: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }
}

export const mockService = new MockService();
