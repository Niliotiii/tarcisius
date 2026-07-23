import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveSession, loadSession, clearSession,
  recordMiss, clearMiss, loadMissHistory,
} from './storage'
import type { QuizSession } from '@/types/quiz'

// Minimal in-memory localStorage — avoids pulling in jsdom/happy-dom just for
// two string-keyed methods.
class MemoryStorage {
  private store = new Map<string, string>()
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null }
  setItem(key: string, value: string) { this.store.set(key, value) }
  removeItem(key: string) { this.store.delete(key) }
  clear() { this.store.clear() }
}

beforeEach(() => {
  ;(globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage()
})

const session: QuizSession = {
  moduleId: 'objetos-liturgicos',
  questions: [],
  currentIndex: 2,
  answers: [],
}

describe('session persistence', () => {
  it('returns null when nothing is saved', () => {
    expect(loadSession()).toBeNull()
  })

  it('round-trips a saved session', () => {
    saveSession('objetos-liturgicos', session)
    expect(loadSession()).toEqual({ moduleId: 'objetos-liturgicos', session })
  })

  it('clears the saved session', () => {
    saveSession('objetos-liturgicos', session)
    clearSession()
    expect(loadSession()).toBeNull()
  })
})

describe('miss history', () => {
  it('starts empty', () => {
    expect(loadMissHistory()).toEqual({})
  })

  it('increments a question miss count each time it is recorded', () => {
    recordMiss('ol-01')
    recordMiss('ol-01')
    recordMiss('ol-02')
    expect(loadMissHistory()).toEqual({ 'ol-01': 2, 'ol-02': 1 })
  })

  it('removes a question from history when cleared', () => {
    recordMiss('ol-01')
    clearMiss('ol-01')
    expect(loadMissHistory()).toEqual({})
  })

  it('clearing a question not in history is a no-op', () => {
    clearMiss('never-missed')
    expect(loadMissHistory()).toEqual({})
  })
})
