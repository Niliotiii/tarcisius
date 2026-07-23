# Qualidade, Acessibilidade e Engajamento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cover the 8 gaps identified in the app review — automated tests, lint/SonarQube fixes, accessibility, session persistence, spaced-repetition-lite question weighting, result sharing, the "Quiz Inverso" data model, and an expanded visual question bank — entirely client-side, with zero backend (deployed as static assets on Cloudflare Workers).

**Architecture:** Vitest for pure-logic unit tests (`quizEngine.ts`, `ranking.ts`, new `storage.ts`, `share.ts`). Browser persistence via `localStorage` only (no server, no cookies). Question selection stays a pure function — `App.tsx` reads/writes `localStorage` and passes plain data into `quizEngine`, keeping the engine testable without mocking browser APIs.

**Tech Stack:** Vitest (new devDependency), existing React 19 + TypeScript + Vite stack, Web Share API with `navigator.clipboard` fallback, `localStorage`.

## Global Constraints

- No backend/server — the app is deployed as a static Cloudflare Workers asset bundle (`wrangler.jsonc`); every feature here must work from the client alone.
- Touch targets stay ≥48px (constitution FR-010) — any new interactive element (share button, etc.) must respect this.
- Tailwind utility classes are the project's styling convention, but this file uses inline `style={{}}` throughout (established pattern in `App.tsx`) — new UI in this plan follows the same inline-style convention for consistency, not Tailwind classes.
- `quizEngine.ts` and `ranking.ts` must remain framework-free pure functions (no React, no browser globals) — this is what makes them cheap to test and is not to be broken by this plan.
- All new/modified TypeScript must pass `npx tsc --noEmit` with zero errors before a task is considered done.

---

## File Structure

```text
package.json                          # add vitest devDependency + "test" script
vitest.config.ts                      # NEW — Vitest config (node environment, no plugins needed)
src/lib/quizEngine.ts                 # MODIFY — add optional missHistory param to startSession
src/lib/quizEngine.test.ts            # NEW — unit tests
src/lib/ranking.ts                    # unchanged (tested only)
src/lib/ranking.test.ts               # NEW — unit tests
src/lib/storage.ts                    # NEW — localStorage helpers (session persistence + miss history)
src/lib/storage.test.ts               # NEW — unit tests (with a manual localStorage mock, no jsdom)
src/lib/share.ts                      # NEW — share text builder + Web Share/clipboard helper
src/lib/share.test.ts                 # NEW — unit tests
src/types/quiz.ts                     # MODIFY — add optional `image` to QuestionOption (Quiz Inverso)
src/data/questions/objetos-liturgicos.ts  # MODIFY — 5 new image questions (+ 3 siblings, Task 11)
src/App.tsx                           # MODIFY — a11y, Readonly props, key fixes, ternary fix,
                                       #          persistence wiring, share button, image-option tile
```

---

### Task 1: Vitest infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `npm test` command; `vitest` importable in `*.test.ts` files (`describe`, `it`, `expect`, `vi`).

- [ ] **Step 1: Install Vitest**

Run: `npm install --save-dev vitest`
Expected: adds `vitest` under `devDependencies` in `package.json` and updates `package-lock.json`.

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add the test script**

Modify `package.json` — add to `"scripts"`:

```json
    "test": "vitest run",
```

Full `scripts` block becomes:

```json
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "format": "oxfmt",
    "test": "vitest run"
  },
```

- [ ] **Step 4: Verify the runner works with a throwaway test**

Create a temporary file `src/lib/_smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run: `npm test`
Expected: `1 passed` in the output.

- [ ] **Step 5: Delete the smoke test and commit**

```bash
rm src/lib/_smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add Vitest test runner"
```

---

### Task 2: Unit tests for the pure quiz logic (quizEngine + ranking)

**Files:**
- Test: `src/lib/quizEngine.test.ts`
- Test: `src/lib/ranking.test.ts`

**Interfaces:**
- Consumes: `startSession(module: Module, size?: number): QuizSession`, `submitAnswer(session, optionId: string): QuizSession`, `advance(session): QuizSession`, `getScore(session): number` from `@/lib/quizEngine`; `getRank(score: number, tiers?: RankTier[]): RankTier`, `rankTiers` from `@/lib/ranking`; `Module`, `Question`, `QuizSession` types from `@/types/quiz`.

- [ ] **Step 1: Write `ranking.test.ts` (write first — no dependency on Task 5's engine change)**

Create `src/lib/ranking.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getRank, rankTiers } from './ranking'

describe('rankTiers', () => {
  it('covers every integer score from 0 to 10 with no gaps or overlaps', () => {
    for (let score = 0; score <= 10; score++) {
      const matches = rankTiers.filter((t) => score >= t.minScore && score <= t.maxScore)
      expect(matches.length).toBe(1)
    }
  })
})

describe('getRank', () => {
  it('returns the lowest tier for score 0', () => {
    expect(getRank(0).title).toBe('Visitante da Igreja')
  })

  it('returns the highest tier for a perfect score', () => {
    expect(getRank(10).title).toBe('Guardião do Altar')
  })

  it('respects tier boundaries exactly', () => {
    expect(getRank(2).title).toBe('Visitante da Igreja')
    expect(getRank(3).title).toBe('Fiel Curioso')
  })

  it('throws when no tier covers the given score', () => {
    const gappedTiers = [{ minScore: 0, maxScore: 5, title: 'Only Half', description: '', stars: 1 }]
    expect(() => getRank(8, gappedTiers)).toThrow('No rank tier configured for score 8')
  })
})
```

- [ ] **Step 2: Run and confirm ranking tests pass**

Run: `npx vitest run src/lib/ranking.test.ts`
Expected: `3 passed` (3 `it` blocks across 2 `describe` blocks — actually 4 `it`s total, expect `4 passed`).

- [ ] **Step 3: Write `quizEngine.test.ts`**

Create `src/lib/quizEngine.test.ts`:

```ts
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
```

- [ ] **Step 4: Run and confirm all quizEngine tests pass**

Run: `npx vitest run src/lib/quizEngine.test.ts`
Expected: `10 passed`.

- [ ] **Step 5: Run the full suite and commit**

Run: `npm test`
Expected: all tests pass (ranking + quizEngine).

```bash
git add src/lib/quizEngine.test.ts src/lib/ranking.test.ts
git commit -m "test: add unit tests for quizEngine and ranking"
```

---

### Task 3: `storage.ts` — localStorage helpers for session persistence and miss history

**Files:**
- Create: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

**Interfaces:**
- Consumes: `QuizSession` type from `@/types/quiz`.
- Produces: `saveSession(moduleId: string, session: QuizSession): void`, `loadSession(): { moduleId: string; session: QuizSession } | null`, `clearSession(): void`, `recordMiss(questionId: string): void`, `clearMiss(questionId: string): void`, `loadMissHistory(): Record<string, number>` — all exported from `@/lib/storage`. Consumed by Task 6 (App.tsx wiring) and Task 4 (quizEngine's `missHistory` param shape).

- [ ] **Step 1: Write the failing test with a manual localStorage mock**

Create `src/lib/storage.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: FAIL — `Cannot find module './storage'`.

- [ ] **Step 3: Implement `storage.ts`**

Create `src/lib/storage.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: `8 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: add localStorage helpers for session and miss history"
```

---

### Task 4: Weighted question selection (spaced-repetition-lite)

**Files:**
- Modify: `src/lib/quizEngine.ts`
- Modify: `src/lib/quizEngine.test.ts`

**Interfaces:**
- Consumes: nothing new (accepts a plain `Record<string, number>` — no dependency on `storage.ts`, keeping the engine free of browser globals).
- Produces: `startSession(module: Module, size?: number, missHistory?: Record<string, number>): QuizSession` — the third parameter is new; existing 2-arg call sites keep working via the default `{}`.

- [ ] **Step 1: Write the failing test**

Add to `src/lib/quizEngine.test.ts`, inside the existing `describe('startSession', ...)` block (append as a new `it`):

```ts
  it('biases selection toward previously-missed questions', () => {
    const mod = makeModule(20)
    const missHistory = { q0: 3, q5: 1 }
    const session = startSession(mod, 10, missHistory)
    const ids = session.questions.map((q) => q.id)
    const missedIndices = ids.map((id, i) => (id in missHistory ? i : -1)).filter((i) => i >= 0)
    const cleanIndices = ids.map((id, i) => (id in missHistory ? -1 : i)).filter((i) => i >= 0)
    const maxMissedIndex = Math.max(...missedIndices)
    const minCleanIndex = Math.min(...cleanIndices)
    expect(maxMissedIndex).toBeLessThan(minCleanIndex)
  })

  it('with no miss history, behaves exactly as before (backward compatible)', () => {
    const session = startSession(makeModule(10), 10)
    expect(session.questions).toHaveLength(10)
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/quizEngine.test.ts -t "biases selection"`
Expected: FAIL — `startSession` only accepts 2 arguments today (extra arg is silently ignored by JS, so the *test* fails on the assertion, not a type error, since `.ts` files still run via `tsx`/esbuild in Vitest without strict arg-count checks at runtime — but `tsc --noEmit` would also flag the extra argument. Confirm the test fails with an assertion error.)

- [ ] **Step 3: Implement the change in `quizEngine.ts`**

Modify `src/lib/quizEngine.ts` — replace the `startSession` function:

```ts
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
```

(`Array.prototype.sort` is a stable sort per the ECMAScript spec, so ties — i.e. every question with no miss history — keep their post-shuffle random relative order. Only questions with `missHistory[id] > 0` get pulled toward the front.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/quizEngine.test.ts`
Expected: `12 passed`.

- [ ] **Step 5: Full typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add src/lib/quizEngine.ts src/lib/quizEngine.test.ts
git commit -m "feat: weight question selection toward previously-missed questions"
```

---

### Task 5: `share.ts` — result sharing (Web Share API + clipboard fallback)

**Files:**
- Create: `src/lib/share.ts`
- Test: `src/lib/share.test.ts`

**Interfaces:**
- Produces: `buildShareText(score: number, total: number, rankTitle: string): string`, `shareResult(text: string): Promise<'shared' | 'copied' | 'unavailable'>` — consumed by Task 6 (`ResultScreen`).

- [ ] **Step 1: Write the failing test**

Create `src/lib/share.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildShareText, shareResult } from './share'

describe('buildShareText', () => {
  it('includes score, total, and rank title', () => {
    const text = buildShareText(8, 10, 'Servidor Dedicado')
    expect(text).toContain('8/10')
    expect(text).toContain('Servidor Dedicado')
  })
})

describe('shareResult', () => {
  const originalNavigator = globalThis.navigator

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true })
  })

  it('uses navigator.share when available and resolves "shared"', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', { value: { share }, configurable: true })
    const result = await shareResult('hello')
    expect(share).toHaveBeenCalledWith({ text: 'hello' })
    expect(result).toBe('shared')
  })

  it('falls back to clipboard when navigator.share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText } }, configurable: true })
    const result = await shareResult('hello')
    expect(writeText).toHaveBeenCalledWith('hello')
    expect(result).toBe('copied')
  })

  it('returns "unavailable" when neither API exists', async () => {
    Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true })
    const result = await shareResult('hello')
    expect(result).toBe('unavailable')
  })

  it('falls back to clipboard if navigator.share rejects (user cancelled)', async () => {
    const share = vi.fn().mockRejectedValue(new Error('cancelled'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(globalThis, 'navigator', {
      value: { share, clipboard: { writeText } }, configurable: true,
    })
    const result = await shareResult('hello')
    expect(result).toBe('copied')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/share.test.ts`
Expected: FAIL — `Cannot find module './share'`.

- [ ] **Step 3: Implement `share.ts`**

Create `src/lib/share.ts`:

```ts
export function buildShareText(score: number, total: number, rankTitle: string): string {
  return `Fiz ${score}/${total} no quiz litúrgico do Tarcisius e virei "${rankTitle}"! 🙏`
}

export async function shareResult(text: string): Promise<'shared' | 'copied' | 'unavailable'> {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined

  if (nav?.share) {
    try {
      await nav.share({ text })
      return 'shared'
    } catch {
      // User cancelled the native share sheet, or it failed — try clipboard next.
    }
  }

  if (nav?.clipboard?.writeText) {
    try {
      await nav.clipboard.writeText(text)
      return 'copied'
    } catch {
      return 'unavailable'
    }
  }

  return 'unavailable'
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/share.test.ts`
Expected: `5 passed`.

- [ ] **Step 5: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors. (If `navigator.share`/`navigator.clipboard` aren't in the TS lib types being used, `nav?.share` / `nav?.clipboard?.writeText` optional-chaining on a wider `Navigator` type is still valid — both are standard in `lib.dom.d.ts`, already available since the project targets `DOM` in `tsconfig.json`.)

```bash
git add src/lib/share.ts src/lib/share.test.ts
git commit -m "feat: add result-sharing helper (Web Share API + clipboard fallback)"
```

---

### Task 6: Wire persistence, spaced repetition, and sharing into `App.tsx`

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `saveSession`, `loadSession`, `clearSession`, `recordMiss`, `clearMiss`, `loadMissHistory` from `@/lib/storage`; `buildShareText`, `shareResult` from `@/lib/share`; `startSession(module, size, missHistory)` from `@/lib/quizEngine` (Task 4's new signature).

- [ ] **Step 1: Add the new imports**

Modify `src/App.tsx` — the top of the file currently reads:

```ts
import { useState, useCallback, useMemo } from 'react'
import type { Module, Question, QuizSession } from '@/types/quiz'
import { modules } from '@/data/modules'
import { startSession, submitAnswer, advance, getScore } from '@/lib/quizEngine'
import { getRank } from '@/lib/ranking'
```

Replace with:

```ts
import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Module, Question, QuizSession } from '@/types/quiz'
import { modules } from '@/data/modules'
import { startSession, submitAnswer, advance, getScore } from '@/lib/quizEngine'
import { getRank } from '@/lib/ranking'
import { saveSession, loadSession, clearSession, recordMiss, clearMiss, loadMissHistory } from '@/lib/storage'
import { buildShareText, shareResult } from '@/lib/share'
```

- [ ] **Step 2: Resume an in-progress session on load, persist on change, and record misses**

Find the `App` component — it currently reads:

```tsx
export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)

  const startQuiz = useCallback((mod: Module) => {
    setActiveModule(mod)
    setSession(startSession(mod))
    setScreen('quiz')
  }, [])

  const handleAnswer = useCallback((optionId: string) => {
    setSession(s => (s ? submitAnswer(s, optionId) : s))
  }, [])

  const handleNext = useCallback(() => {
    setSession(s => {
      if (!s) return s
      if (s.currentIndex < s.questions.length - 1) {
        return advance(s)
      }
      setScreen('result')
      return s
    })
  }, [])

  const exitQuiz = useCallback(() => {
    if (window.confirm('Sair agora? O progresso desta sessão será perdido.')) {
      setSession(null)
      setScreen('modules')
    }
  }, [])

  const accentColor = activeModule ? accentColorFor(activeModule.id) : DEFAULT_ACCENT
  const score = useMemo(() => (session ? getScore(session) : 0), [session])

  if (screen === 'start') return <StartScreen onContinue={() => setScreen('modules')} onAbout={() => setScreen('about')} />
  if (screen === 'about') return <AboutScreen onBack={() => setScreen('start')} />
  if (screen === 'modules') return <ModulesScreen onSelect={startQuiz} onBack={() => setScreen('start')} />
  if (screen === 'result' && session) return (
    <ResultScreen
      score={score} total={session.questions.length}
      onRestart={() => activeModule && startQuiz(activeModule)}
      onModules={() => setScreen('modules')}
      accentColor={accentColor}
    />
  )
  if (screen === 'quiz' && session) return (
    <QuizScreen
      session={session} onAnswer={handleAnswer} onNext={handleNext} onExit={exitQuiz} accentColor={accentColor}
    />
  )
  return <StartScreen onContinue={() => setScreen('modules')} onAbout={() => setScreen('about')} />
}
```

Replace the whole thing with:

```tsx
export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)

  // Resume an interrupted session once, on first mount.
  useEffect(() => {
    const stored = loadSession()
    if (!stored) return
    const mod = modules.find((m) => m.id === stored.moduleId && m.status === 'available')
    if (!mod) {
      clearSession()
      return
    }
    setActiveModule(mod)
    setSession(stored.session)
    setScreen('quiz')
  }, [])

  // Persist the in-progress session on every change while on the quiz screen.
  useEffect(() => {
    if (screen === 'quiz' && session) {
      saveSession(session.moduleId, session)
    }
  }, [screen, session])

  const startQuiz = useCallback((mod: Module) => {
    setActiveModule(mod)
    setSession(startSession(mod, 10, loadMissHistory()))
    setScreen('quiz')
  }, [])

  const handleAnswer = useCallback((optionId: string) => {
    setSession((s) => {
      if (!s) return s
      const current = s.questions[s.currentIndex]
      const next = submitAnswer(s, optionId)
      const answer = next.answers.find((a) => a.questionId === current.id)
      if (answer?.correct) clearMiss(current.id)
      else if (answer) recordMiss(current.id)
      return next
    })
  }, [])

  const handleNext = useCallback(() => {
    setSession((s) => {
      if (!s) return s
      if (s.currentIndex < s.questions.length - 1) {
        return advance(s)
      }
      clearSession()
      setScreen('result')
      return s
    })
  }, [])

  const exitQuiz = useCallback(() => {
    if (window.confirm('Sair agora? O progresso desta sessão será perdido.')) {
      clearSession()
      setSession(null)
      setScreen('modules')
    }
  }, [])

  const accentColor = activeModule ? accentColorFor(activeModule.id) : DEFAULT_ACCENT
  const score = useMemo(() => (session ? getScore(session) : 0), [session])

  if (screen === 'start') return <StartScreen onContinue={() => setScreen('modules')} onAbout={() => setScreen('about')} />
  if (screen === 'about') return <AboutScreen onBack={() => setScreen('start')} />
  if (screen === 'modules') return <ModulesScreen onSelect={startQuiz} onBack={() => setScreen('start')} />
  if (screen === 'result' && session) return (
    <ResultScreen
      score={score} total={session.questions.length}
      onRestart={() => activeModule && startQuiz(activeModule)}
      onModules={() => setScreen('modules')}
      accentColor={accentColor}
    />
  )
  if (screen === 'quiz' && session) return (
    <QuizScreen
      session={session} onAnswer={handleAnswer} onNext={handleNext} onExit={exitQuiz} accentColor={accentColor}
    />
  )
  return <StartScreen onContinue={() => setScreen('modules')} onAbout={() => setScreen('about')} />
}
```

(The only functional difference from the "before" block is the two new `useEffect`s, `missHistory` in `startQuiz`, `recordMiss`/`clearMiss` in `handleAnswer`, and `clearSession()` calls in `handleNext` and `exitQuiz`.)

- [ ] **Step 3: Add the "Compartilhar resultado" button to `ResultScreen`**

Modify `src/App.tsx` — `ResultScreen`'s signature currently reads:

```tsx
function ResultScreen({ score, total, onRestart, onModules, accentColor }: {
  score: number; total: number; onRestart: () => void; onModules: () => void; accentColor: string;
}) {
  const rank = getRank(score)
```

Replace with (adds local share-feedback state):

```tsx
function ResultScreen({ score, total, onRestart, onModules, accentColor }: {
  score: number; total: number; onRestart: () => void; onModules: () => void; accentColor: string;
}) {
  const rank = getRank(score)
  const [shareState, setShareState] = useState<'idle' | 'shared' | 'copied'>('idle')

  const handleShare = useCallback(async () => {
    const text = buildShareText(score, total, rank.title)
    const result = await shareResult(text)
    if (result === 'shared' || result === 'copied') {
      setShareState(result)
      setTimeout(() => setShareState('idle'), 2500)
    }
  }, [score, total, rank.title])
```

Find the closing `</div>` of the "Actions" block — it currently ends with the "Trocar de Módulo" button followed by:

```tsx
          Trocar de Módulo
        </button>
      </div>
    </div>
  )
}
```

Replace with (adds the share button after "Trocar de Módulo", inside the same actions `<div>`):

```tsx
          Trocar de Módulo
        </button>
        <button
          onClick={handleShare}
          style={{
            width: '100%', padding: '13px', borderRadius: '16px', border: 'none',
            background: 'transparent', color: 'var(--color-alba-muted)',
            fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', minHeight: '48px',
          }}
        >
          {shareState === 'idle' && 'Compartilhar resultado'}
          {shareState === 'shared' && 'Compartilhado!'}
          {shareState === 'copied' && 'Copiado para a área de transferência!'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (`ResultScreen` now uses `useState`/`useCallback`, already imported at the top of the file.)

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open the app, play a module to completion, and confirm:
- Reloading the page mid-quiz resumes at the same question with the same shuffled options.
- The "Compartilhar resultado" button copies text to the clipboard (or opens the native share sheet on a mobile browser) and shows the "Copiado!"/"Compartilhado!" confirmation.
- Missing the same question twice in separate sessions makes it noticeably more likely to reappear (not deterministically testable by eye, but confirm no crash and that `localStorage` (`tarcisius:history`) accumulates counts via browser devtools).

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: persist in-progress sessions, weight misses, add result sharing"
```

---

### Task 7: Accessibility pass

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- No new exports — purely additive `aria-*` attributes and one live region.

- [ ] **Step 1: Add an `aria-live` region announcing correctness**

Find the feedback pill inside `QuizScreen` (the `<div>` showing "Correto!"/"Ops!" + score). It currently starts:

```tsx
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '99px',
            background: isCorrect ? 'rgba(34,184,122,0.14)' : 'rgba(224,72,63,0.14)',
            color: isCorrect ? 'var(--color-viridis)' : 'var(--color-rubrum)',
            fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 800, alignSelf: 'flex-start',
          }}>
```

Add `role="status" aria-live="polite"` to that same `<div>`:

```tsx
          <div
            role="status"
            aria-live="polite"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '99px',
              background: isCorrect ? 'rgba(34,184,122,0.14)' : 'rgba(224,72,63,0.14)',
              color: isCorrect ? 'var(--color-viridis)' : 'var(--color-rubrum)',
              fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 800, alignSelf: 'flex-start',
            }}
          >
```

(`role="status"` + `aria-live="polite"` makes screen readers announce "Correto! Pontuação: 4" or "Ops! Pontuação: 3" the moment it renders, without stealing focus — the standard pattern for transient feedback.)

- [ ] **Step 2: Label the answer tiles for screen readers**

Find `AnswerTile`'s `<button>` element (inside `function AnswerTile`). It currently starts:

```tsx
    <button
      onClick={onClick}
      disabled={disabled}
      className={isCorrect ? 'animate-tile-pop-correct' : isWrong ? 'animate-tile-shake-wrong' : undefined}
```

Add an `aria-label` reflecting both the answer text and its result state (the visible text already shows the label; screen readers need the correctness state that's otherwise conveyed only by color/icon):

```tsx
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={
        isCorrect ? `${label}, resposta correta`
          : isWrong ? `${label}, sua resposta, incorreta`
          : label
      }
      className={isCorrect ? 'animate-tile-pop-correct' : isWrong ? 'animate-tile-shake-wrong' : undefined}
```

- [ ] **Step 3: Label the exit and back-navigation buttons**

Find `ScreenHeader`'s back-link `<button>` — currently:

```tsx
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', padding: '10px 0', margin: '-10px 0 6px -2px',
```

Add `aria-label={backLabel}`:

```tsx
      <button
        onClick={onBack}
        aria-label={backLabel}
        style={{
          background: 'none', border: 'none', padding: '10px 0', margin: '-10px 0 6px -2px',
```

(The `QuizPips` exit `✕` button already has `aria-label="Sair do quiz"` from earlier work — verify it's still present; if not, add it back at the same spot.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (JSX attributes only, no type changes).

- [ ] **Step 5: Manual verification**

Run: `npm run dev`. On macOS, enable VoiceOver (Cmd+F5), tab through a quiz session, and confirm:
- Each answer tile is announced with its label and, after answering, whether it was correct/incorrect/the user's pick.
- The feedback pill's "Correto!"/"Ops!" is announced automatically without needing to tab to it.
- The back-link and exit buttons announce meaningful labels ("Início", "Sair do quiz") rather than just "button".

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "a11y: announce answer feedback and label interactive controls"
```

---

### Task 8: Fix SonarQube findings (readonly props, index keys, nested ternary)

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Wrap every component's prop type in `Readonly<>`**

For each of the following function signatures in `src/App.tsx`, wrap the inline prop type literal in `Readonly<{ ... }>`. Apply this mechanically to every one:

```tsx
// Before: function Monstrance({ size = 200, opacity = 0.9, color = '#E8B84B' }: { size?: number; opacity?: number; color?: string }) {
function Monstrance({ size = 200, opacity = 0.9, color = '#E8B84B' }: Readonly<{ size?: number; opacity?: number; color?: string }>) {

// Before: function GlyphIcon({ name, size = 16 }: { name: GlyphName; size?: number }) {
function GlyphIcon({ name, size = 16 }: Readonly<{ name: GlyphName; size?: number }>) {

// Before:
// function QuizPips({
//   total, currentIndex, results, accentColor, onExit,
// }: {
//   total: number; currentIndex: number; results: (boolean | null)[]; accentColor: string; onExit: () => void
// }) {
function QuizPips({
  total, currentIndex, results, accentColor, onExit,
}: Readonly<{
  total: number; currentIndex: number; results: (boolean | null)[]; accentColor: string; onExit: () => void
}>) {

// Before:
// function AnswerTile({
//   label, mark, color, state, disabled, onClick,
// }: {
//   label: string; mark: GlyphName; color: string; state: TileState; disabled: boolean; onClick: () => void
// }) {
function AnswerTile({
  label, mark, color, state, disabled, onClick,
}: Readonly<{
  label: string; mark: GlyphName; color: string; state: TileState; disabled: boolean; onClick: () => void
}>) {

// Before: function StarIcon({ filled }: { filled: boolean }) {
function StarIcon({ filled }: Readonly<{ filled: boolean }>) {

// Before:
// function ScreenHeader({
//   title, subtitle, backLabel, onBack,
// }: {
//   title: string; subtitle: string; backLabel: string; onBack: () => void
// }) {
function ScreenHeader({
  title, subtitle, backLabel, onBack,
}: Readonly<{
  title: string; subtitle: string; backLabel: string; onBack: () => void
}>) {

// Before: function StartScreen({ onContinue, onAbout }: { onContinue: () => void; onAbout: () => void }) {
function StartScreen({ onContinue, onAbout }: Readonly<{ onContinue: () => void; onAbout: () => void }>) {

// Before: function AboutScreen({ onBack }: { onBack: () => void }) {
function AboutScreen({ onBack }: Readonly<{ onBack: () => void }>) {

// Before: function ModulesScreen({ onSelect, onBack }: { onSelect: (mod: Module) => void; onBack: () => void }) {
function ModulesScreen({ onSelect, onBack }: Readonly<{ onSelect: (mod: Module) => void; onBack: () => void }>) {

// Before: function ModuleCard({ mod, index, onSelect }: { mod: Module; index: number; onSelect: (mod: Module) => void }) {
function ModuleCard({ mod, index, onSelect }: Readonly<{ mod: Module; index: number; onSelect: (mod: Module) => void }>) {

// Before:
// function QuizScreen({
//   session, onAnswer, onNext, onExit, accentColor,
// }: {
//   session: QuizSession; onAnswer: (optionId: string) => void; onNext: () => void; onExit: () => void; accentColor: string;
// }) {
function QuizScreen({
  session, onAnswer, onNext, onExit, accentColor,
}: Readonly<{
  session: QuizSession; onAnswer: (optionId: string) => void; onNext: () => void; onExit: () => void; accentColor: string;
}>) {

// Before:
// function ResultScreen({ score, total, onRestart, onModules, accentColor }: {
//   score: number; total: number; onRestart: () => void; onModules: () => void; accentColor: string;
// }) {
function ResultScreen({ score, total, onRestart, onModules, accentColor }: Readonly<{
  score: number; total: number; onRestart: () => void; onModules: () => void; accentColor: string;
}>) {
```

- [ ] **Step 2: Extract the nested ternary in `AnswerTile`**

Find, inside `AnswerTile`:

```tsx
      className={isCorrect ? 'animate-tile-pop-correct' : isWrong ? 'animate-tile-shake-wrong' : undefined}
```

Replace with a helper computed above the `return`:

```tsx
  const isDimmed = state === 'neutral'
  const isWrong = state === 'wrong'
  const isCorrect = state === 'correct'
  const tileAnimationClass = isCorrect
    ? 'animate-tile-pop-correct'
    : isWrong
      ? 'animate-tile-shake-wrong'
      : undefined
```

(This is the same ternary chain, just extracted to a named variable per Sonar's S3358 — it flags *nesting inside JSX expressions*, not ternaries per se, and a named intermediate value reads clearly either way.)

Then use it in the JSX:

```tsx
      className={tileAnimationClass}
```

- [ ] **Step 3: Replace array-index keys with stable keys**

Three spots use `key={i}` (or equivalent) purely because the index was convenient, not because the list is provably static. Fix each:

**3a — `Monstrance`'s ray lines** (each ray has a unique `x1,y1` pair; use that instead of index):

```tsx
// Before: <line key={i} x1={l.x1} ...
<line key={`${l.x1}-${l.y1}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={i % 2 === 0 ? 1.5 : 0.8} strokeLinecap="round" />
```

**3b — `QuizPips`'s pip row** (each pip corresponds 1:1 to a question in the session; thread the question id through instead of the loop index):

Find `QuizScreen`'s call site:

```tsx
      <QuizPips total={session.questions.length} currentIndex={session.currentIndex} results={results} accentColor={accentColor} onExit={onExit} />
```

Replace with (adds `questionIds`):

```tsx
      <QuizPips
        total={session.questions.length} currentIndex={session.currentIndex} results={results}
        questionIds={session.questions.map((q) => q.id)} accentColor={accentColor} onExit={onExit}
      />
```

In `QuizPips`, add `questionIds: string[]` to the (now `Readonly<>`-wrapped, per Step 1) prop type, and use it for the key:

```tsx
function QuizPips({
  total, currentIndex, results, questionIds, accentColor, onExit,
}: Readonly<{
  total: number; currentIndex: number; results: (boolean | null)[]; questionIds: string[]; accentColor: string; onExit: () => void
}>) {
```

```tsx
// Before: <div key={i} className={...} style={{ ... }} />
<div key={questionIds[i]} className={result !== null ? 'animate-pip-pop' : undefined} style={{ ... }} />
```

**3c — `AboutScreen`'s "how it works" steps** (the array is static hardcoded text — key by the text itself, which is unique per step):

```tsx
// Before: {HOW_IT_WORKS_STEPS.map((text, i) => {
{HOW_IT_WORKS_STEPS.map((text, i) => {
  const tile = TILE_STYLES[i % TILE_STYLES.length]
  return (
    <div key={text} style={{ ... }}>
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, play a full quiz session, confirm the progress pips still render/animate correctly (this is the one behavior-adjacent change — the `key` change must not break the pop animation on answer).

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: address SonarQube findings (readonly props, stable keys, ternary)"
```

---

### Task 9: "Quiz Inverso" data model — image-based answer options

**Files:**
- Modify: `src/types/quiz.ts`
- Modify: `src/App.tsx`
- Modify: `src/data/questions/objetos-liturgicos.ts` (one example question, to prove the mechanism end-to-end)

**Interfaces:**
- Produces: `QuestionOption.image?: QuestionImage` — when present, `AnswerTile` renders the image as the primary visual instead of relying on `label` alone.

- [ ] **Step 1: Extend the data model**

Modify `src/types/quiz.ts` — `QuestionOption` currently reads:

```ts
export interface QuestionOption {
  id: string
  label: string
}
```

Replace with:

```ts
export interface QuestionOption {
  id: string
  label: string
  image?: QuestionImage
}
```

(`QuestionImage` is already defined above this interface in the same file — no new type needed. `label` stays required even for image options: it becomes the accessible name via `aria-label`, per Task 7's pattern, so a "Quiz Inverso" option is never unlabeled for screen readers even though sighted users see only the photo.)

- [ ] **Step 2: Render an image variant in `AnswerTile`**

Modify `src/App.tsx` — `AnswerTile`'s prop type (already `Readonly<>`-wrapped per Task 8) gains an optional `image`:

```tsx
function AnswerTile({
  label, mark, color, state, disabled, onClick, image,
}: Readonly<{
  label: string; mark: GlyphName; color: string; state: TileState; disabled: boolean; onClick: () => void
  image?: QuestionImage
}>) {
```

Add the `QuestionImage` type to the existing type-only import at the top of the file:

```ts
import type { Module, Question, QuizSession, QuestionImage } from '@/types/quiz'
```

Inside `AnswerTile`, right after the opening `<button>` tag's icon-chip `<span>` (the 38×38px mark badge) and before the `<span>{label}</span>` line, insert a conditional image block, and hide the text label visually (but keep it for the DOM/`aria-label`) when an image is present:

```tsx
      {image && (
        <img
          src={image.src}
          alt=""
          aria-hidden="true"
          style={{
            width: '100%', height: '64px', objectFit: 'cover', borderRadius: '10px',
            marginTop: '-2px',
          }}
        />
      )}
      <span style={image ? { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' } : undefined}>
        {label}
      </span>
```

(`alt=""` + `aria-hidden="true"` on the `<img>` avoids double-announcing the answer to screen readers — the button's own `aria-label` from Task 7 Step 2 already carries `label` plus the correctness state, so the image is purely decorative from an accessibility standpoint. The visually-hidden `<span>` keeps `label` in the accessible name computation via the button's own text content as a fallback, without showing text over the photo.)

- [ ] **Step 3: Pass `image` through in `QuizScreen`'s render loop**

Find, inside `QuizScreen`:

```tsx
          {q.options.map((opt, i) => {
            const tile = TILE_STYLES[i % TILE_STYLES.length]
            return (
              <AnswerTile
                key={opt.id} label={opt.label} mark={tile.mark} color={tile.color}
                state={getState(opt.id)} disabled={answered} onClick={() => onAnswer(opt.id)}
              />
            )
          })}
```

Replace with:

```tsx
          {q.options.map((opt, i) => {
            const tile = TILE_STYLES[i % TILE_STYLES.length]
            return (
              <AnswerTile
                key={opt.id} label={opt.label} mark={tile.mark} color={tile.color}
                state={getState(opt.id)} disabled={answered} onClick={() => onAnswer(opt.id)}
                image={opt.image}
              />
            )
          })}
```

- [ ] **Step 4: Add one example question to prove it end-to-end**

Modify `src/data/questions/objetos-liturgicos.ts` — append one new question to the array (before the closing `]`), reusing an already-downloaded local image from `public/images/quiz/` as one option's image and three others without images (mixed layout is intentionally allowed — the tile only special-cases options that *have* an image):

```ts
  {
    id: 'ol-inv-01',
    prompt: 'Qual destas imagens mostra um cálice?',
    options: [
      { id: 'a', label: 'Turíbulo', image: { src: '/images/quiz/ol-img-02.jpg', alt: 'Turíbulo' } },
      { id: 'b', label: 'Cálice', image: { src: '/images/quiz/ol-img-01.jpg', alt: 'Cálice' } },
      { id: 'c', label: 'Ostensório', image: { src: '/images/quiz/ol-img-03.jpg', alt: 'Ostensório' } },
      { id: 'd', label: 'Píxide', image: { src: '/images/quiz/ol-img-04.jpg', alt: 'Píxide' } },
    ],
    correctOptionId: 'b',
  },
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, play "Objetos Litúrgicos" repeatedly (10-question random draw from 36 questions, so this may take a few tries) until `ol-inv-01` appears. Confirm:
- All 4 tiles show photos instead of text.
- Tapping the correct photo shows the green check/glow; tapping a wrong one shows red X/shake, same as text tiles.
- VoiceOver announces each tile's object name (from the hidden `label`) and, after answering, correctness — same as Task 7's text-tile behavior.

- [ ] **Step 7: Commit**

```bash
git add src/types/quiz.ts src/App.tsx src/data/questions/objetos-liturgicos.ts
git commit -m "feat: support image-based answer options (Quiz Inverso mechanism)"
```

---

### Task 10: Expand the visual question bank

**Files:**
- Modify: `src/data/questions/objetos-liturgicos.ts`
- Modify: `src/data/questions/vestes-liturgicas-insignias.ts`
- Modify: `src/data/questions/tempos-liturgicos.ts`
- Modify: `src/data/questions/estrutura-partes-missa.ts`
- Create (temp, deleted at the end): downloaded images under `public/images/quiz/`

This task is content-sourcing, not code — there is no test to write first. It reuses the exact working process from the original 40-image batch: dispatch research subagents to find and verify free-license Wikimedia Commons photos, then run the same download+compress pipeline already proven to work in this repo.

- [ ] **Step 1: Pick 5 new visually-identifiable subjects per module** (don't repeat anything already covered by the existing 10 image questions per module)

  - Objetos Litúrgicos: Caldeirinha (holy water pot), Naveta (incense boat), Corporal (altar linen), Manustérgio (lavabo towel), Cruz peitoral (pectoral cross)
  - Vestes Litúrgicas e Insígnias: Amito (amice), Solidéu (zucchetto), Anel episcopal (bishop's ring), Pálio (pallium), Véu do cálice
  - Tempos Litúrgicos: Domingo de Ramos (procession with palms), Sexta-feira Santa (veneration of the cross), Vigília Pascal (new fire/Easter vigil), Corpus Christi (procession with monstrance), Quarta-feira de Cinzas (ashes being applied, wide shot)
  - Estrutura da Missa: Ofertório (bread and wine presented), Rito de Paz (sign of peace handshake), Bênção final (final blessing gesture), Homilia (priest preaching from the ambo), Sinal da cruz (making the sign of the cross)

- [ ] **Step 2: Dispatch one research agent per module** (general-purpose subagent, one per module, run in parallel). Use this exact prompt template for each, substituting `{MODULE_TITLE}`, `{ID_PREFIX}`, and `{SUBJECT_LIST}` from Step 1's lists (e.g. for Objetos Litúrgicos: `{ID_PREFIX}` = `ol-img`, `{SUBJECT_LIST}` = "Caldeirinha, Naveta, Corporal, Manustérgio, Cruz peitoral"):

```text
Você vai pesquisar imagens reais e de licença livre (domínio público ou
CC-BY/CC-BY-SA) no Wikimedia Commons para criar 5 perguntas de quiz com
imagem sobre {MODULE_TITLE}, em português (pt-BR), para os seguintes
itens (um por pergunta, nesta ordem): {SUBJECT_LIST}.

Para CADA item:
1. Use WebSearch (site:commons.wikimedia.org ou site:upload.wikimedia.org)
   para achar uma foto real que mostre claramente o item.
2. Pegue a URL DIRETA do arquivo (começando com
   https://upload.wikimedia.org/wikipedia/commons/... terminando em
   .jpg/.jpeg/.png — não uma URL de página).
3. Use WebFetch nessa URL para confirmar que carrega uma imagem de fato.
   Se não carregar ou não for o item certo, procure outra.
4. Escreva um alt text objetivo em português.
5. Escreva a pergunta (prompt) pedindo para identificar o item.
6. Crie 4 alternativas (ids 'a'/'b'/'c'/'d'), uma certa e três distratoras
   plausíveis do mesmo campo semântico.

Sua ÚLTIMA mensagem deve conter APENAS um bloco de código TypeScript com
um array de 5 objetos neste formato, usando ids {ID_PREFIX}-11 até
{ID_PREFIX}-15 na ordem da lista acima:

```ts
{
  id: '{ID_PREFIX}-11',
  prompt: '...',
  image: { src: 'https://upload.wikimedia.org/wikipedia/commons/.../File.jpg', alt: '...' },
  options: [
    { id: 'a', label: '...' },
    { id: 'b', label: '...' },
    { id: 'c', label: '...' },
    { id: 'd', label: '...' },
  ],
  correctOptionId: 'b',
},
```
```

- [ ] **Step 3: Download and localize the images.** After all 4 agents return, extract each `{ id, src }` pair into `id|url` lines (one file per module, e.g. `/tmp/retry-list.txt`), then run this script (adjust the input filename per module or concatenate all 20 pairs into one file first):

```bash
#!/bin/bash
# Usage: bash download-quiz-images.sh <input-file-of-id|url-lines>
cd /Users/danilosaiter/tarcisius
while IFS='|' read -r id url; do
  [ -z "$id" ] && continue
  ext=$(echo "$url" | sed -E 's/.*\.([a-zA-Z]+)(\?.*)?$/\1/' | tr '[:upper:]' '[:lower:]')
  out="public/images/quiz/${id}.${ext}"
  code=$(curl -s -L -o "$out" -w "%{http_code}" \
    -A "Mozilla/5.0 (compatible; TarciusQuizApp/1.0; +educational use)" \
    "$url" --max-time 20)
  size=$(stat -f%z "$out" 2>/dev/null || echo 0)
  if [ "$code" = "200" ] && [ "$size" -gt 1000 ]; then
    echo "OK $id ($size bytes)"
  else
    echo "FAIL $id code=$code — retry this one later (Wikimedia rate limit: wait 600s)"
    rm -f "$out"
  fi
  sleep 15
done < "$1"
```

Run it, then compress every new file (both successes and any manual re-downloads) so file size stays well under 200KB:

```bash
cd public/images/quiz
for f in ol-img-1[1-5].jpg vli-img-1[1-5].jpg tl-img-1[1-5].jpg epm-img-1[1-5].jpg; do
  [ -f "$f" ] || continue
  sips -Z 800 -s formatOptions 68 "$f" --out "$f.tmp" >/dev/null 2>&1 && mv "$f.tmp" "$f"
done
```

If any download still returns `429` after one retry, wait 600 seconds (Wikimedia's `Retry-After` value) before trying that specific id again — do not loop retries back-to-back, it extends the block.

- [ ] **Step 4: Append the 5 new questions per file** (same object shape as the existing `*-img-*` entries), pointing `image.src` at the new local `/images/quiz/<id>.jpg` paths.

- [ ] **Step 5: Verify counts**

Run:
```bash
for f in src/data/questions/*.ts; do
  grep -oE "id: '[a-z-]+-img-[0-9]+'" "$f" | wc -l
done
```
Expected: `15` for each file (10 existing + 5 new).

- [ ] **Step 6: Typecheck, build, and manual spot-check**

```bash
npx tsc --noEmit
npm run build
ls dist/images/quiz | wc -l   # expect 60 (40 existing + 20 new)
```

Run `npm run dev`, play each module a few times, and confirm at least one of the new image questions renders correctly with its photo loading.

- [ ] **Step 7: Commit**

```bash
git add src/data/questions/*.ts public/images/quiz/*.jpg
git commit -m "feat: add 5 more image questions per module (20 total)"
```

---

## Dependencies & Execution Order

- Task 1 (Vitest) blocks Tasks 2, 3, 4, 5 (all need the test runner).
- Task 2 (quizEngine/ranking tests) should land before Task 4 (weighted selection) so the "no miss history = unchanged behavior" regression test already exists to catch breakage.
- Task 3 (storage.ts) and Task 5 (share.ts) are independent of each other and of Task 4 — can be done in any order, or in parallel by different people.
- Task 6 (App.tsx wiring) depends on Tasks 3, 4, and 5 all being merged (it imports from all three).
- Task 7 (a11y) and Task 8 (Sonar fixes) both touch `App.tsx` broadly — do them sequentially (7 then 8, or 8 then 7), not in parallel, to avoid merge conflicts on the same file. Order between them doesn't matter functionally.
- Task 9 (Quiz Inverso) touches `AnswerTile`'s prop type, which Task 8 also touches (wrapping it in `Readonly<>`) — do Task 8 before Task 9 so Task 9's diff is against the already-`Readonly<>`-wrapped signature shown in this plan.
- Task 10 (more images) is fully independent of every other task — can run any time, in parallel with everything else.

## Notes

- Every task ends with `npx tsc --noEmit` passing — this project has no other CI gate today, so that command plus `npm test` (once Task 1 lands) are the two checks to run before every commit.
- No task introduces a backend, a database, or a new hosting requirement — everything reads/writes `localStorage` or calls browser-native APIs (`navigator.share`, `navigator.clipboard`), consistent with the Cloudflare Workers static-asset deployment already in place.
