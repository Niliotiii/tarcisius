import type { QuizSession } from '@/types/quiz'

const SESSION_KEY = 'tarcisius:session'
const HISTORY_KEY = 'tarcisius:history'

export interface StoredSession {
  moduleId: string
  session: QuizSession
}

export function saveSession(moduleId: string, session: QuizSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ moduleId, session }))
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) — the
    // session simply won't be resumable; not fatal to gameplay.
  }
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as StoredSession) : null
  } catch {
    return null
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

export function loadMissHistory(): Record<string, number> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    return {}
  }
}

function saveMissHistory(history: Record<string, number>): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // ignore
  }
}

export function recordMiss(questionId: string): void {
  const history = loadMissHistory()
  history[questionId] = (history[questionId] ?? 0) + 1
  saveMissHistory(history)
}

export function clearMiss(questionId: string): void {
  const history = loadMissHistory()
  if (questionId in history) {
    delete history[questionId]
    saveMissHistory(history)
  }
}
