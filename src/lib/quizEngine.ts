import type { Module, QuizSession, Question } from '@/types/quiz'

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function startSession(
  module: Module,
  size = 10,
  missHistory: Record<string, number> = {},
): QuizSession {
  const shuffled = shuffle(module.questions)
  const weighted = [...shuffled].sort(
    (a, b) => (missHistory[b.id] ?? 0) - (missHistory[a.id] ?? 0),
  )
  const questions: Question[] = weighted
    .slice(0, size)
    .map((question) => ({ ...question, options: shuffle(question.options) }))
  return {
    moduleId: module.id,
    questions,
    currentIndex: 0,
    answers: [],
  }
}

export function submitAnswer(session: QuizSession, optionId: string): QuizSession {
  const currentQuestion = session.questions[session.currentIndex]
  const alreadyAnswered = session.answers.some((a) => a.questionId === currentQuestion.id)
  if (alreadyAnswered) return session

  return {
    ...session,
    answers: [
      ...session.answers,
      {
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        correct: optionId === currentQuestion.correctOptionId,
      },
    ],
  }
}

export function advance(session: QuizSession): QuizSession {
  return { ...session, currentIndex: session.currentIndex + 1 }
}

export function getScore(session: QuizSession): number {
  return session.answers.filter((a) => a.correct).length
}
