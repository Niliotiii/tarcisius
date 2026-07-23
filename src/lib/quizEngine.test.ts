import { describe, it, expect } from 'vitest'
import { startSession, submitAnswer, advance, getScore } from './quizEngine'
import type { Module, Question } from '@/types/quiz'

function makeQuestion(id: string, correctOptionId = 'a'): Question {
  return {
    id,
    prompt: `Prompt ${id}`,
    options: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
      { id: 'd', label: 'D' },
    ],
    correctOptionId,
  }
}

function makeModule(questionCount: number): Module {
  return {
    id: 'test-module',
    title: 'Test',
    subtitle: 'Test',
    description: 'Test',
    status: 'available',
    questions: Array.from({ length: questionCount }, (_, i) => makeQuestion(`q${i}`)),
  }
}

describe('startSession', () => {
  it('draws exactly `size` questions from a larger bank', () => {
    const session = startSession(makeModule(30), 10)
    expect(session.questions).toHaveLength(10)
  })

  it('uses all available questions when the bank is smaller than `size`', () => {
    const session = startSession(makeModule(6), 10)
    expect(session.questions).toHaveLength(6)
  })

  it('never draws the same question twice in one session', () => {
    const session = startSession(makeModule(30), 10)
    const ids = session.questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(10)
  })

  it('starts at index 0 with no answers', () => {
    const session = startSession(makeModule(10), 10)
    expect(session.currentIndex).toBe(0)
    expect(session.answers).toEqual([])
  })

  it('shuffles option order independently of the source data', () => {
    // Run many sessions; across enough trials the correct option should not
    // always land in the same array position (source data always has it at index 0).
    const positions = new Set<number>()
    for (let i = 0; i < 50; i++) {
      const session = startSession(makeModule(1), 1)
      const q = session.questions[0]
      positions.add(q.options.findIndex((o) => o.id === q.correctOptionId))
    }
    expect(positions.size).toBeGreaterThan(1)
  })

  it('produces a different question order across repeated calls (replayability)', () => {
    const mod = makeModule(30)
    const orders = new Set<string>()
    for (let i = 0; i < 20; i++) {
      orders.add(startSession(mod, 10).questions.map((q) => q.id).join(','))
    }
    expect(orders.size).toBeGreaterThan(1)
  })
})

describe('submitAnswer', () => {
  it('records a correct answer', () => {
    const session = startSession(makeModule(1), 1)
    const questionId = session.questions[0].id
    const correctOptionId = session.questions[0].correctOptionId
    const result = submitAnswer(session, correctOptionId)
    expect(result.answers).toEqual([{ questionId, selectedOptionId: correctOptionId, correct: true }])
  })

  it('records an incorrect answer', () => {
    const session = startSession(makeModule(1), 1)
    const wrongOptionId = session.questions[0].options.find((o) => o.id !== session.questions[0].correctOptionId)!.id
    const result = submitAnswer(session, wrongOptionId)
    expect(result.answers[0].correct).toBe(false)
  })

  it('ignores a second answer to the same question (no double-click regression)', () => {
    const session = startSession(makeModule(1), 1)
    const first = submitAnswer(session, session.questions[0].options[0].id)
    const second = submitAnswer(first, session.questions[0].options[1].id)
    expect(second.answers).toHaveLength(1)
    expect(second).toBe(first)
  })
})

describe('advance', () => {
  it('increments currentIndex by one', () => {
    const session = startSession(makeModule(10), 10)
    expect(advance(session).currentIndex).toBe(1)
  })
})

describe('getScore', () => {
  it('counts only correct answers', () => {
    const session = startSession(makeModule(3), 3)
    let s = submitAnswer(session, session.questions[0].correctOptionId)
    const wrongId = session.questions[1].options.find((o) => o.id !== session.questions[1].correctOptionId)!.id
    s = submitAnswer(advance(s), wrongId)
    expect(getScore(s)).toBe(1)
  })
})
