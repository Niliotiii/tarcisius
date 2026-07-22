---

description: "Task list for Quiz Litúrgico — Módulo Objetos Litúrgicos"
---

# Tasks: Quiz Litúrgico — Módulo Objetos Litúrgicos

**Input**: Design documents from `/specs/001-quiz-objetos-liturgicos/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/quiz-data-contract.md, quickstart.md

**Tests**: No automated test framework is configured in this project. Verification
is manual, on a mobile viewport, per the constitution and `quickstart.md`. Manual
verification steps are included as explicit tasks within each user story instead
of automated test tasks.

**Organization**: Tasks are grouped by user story (from spec.md) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are relative to repository root (`src/` is the single Vite project)

---

## Implementation Note (post-execution)

`src/App.tsx` already contained a fully-built, polished UI (theming,
animations, all four screens) when implementation started — its question
banks were just empty stubs. Rather than rebuilding the UI as separate
`src/components/*.tsx` files per the original task breakdown, the existing
UI was kept and wired to the new decoupled data/engine layer
(`src/types/quiz.ts`, `src/data/`, `src/lib/quizEngine.ts`,
`src/lib/ranking.ts`). Screen composition (`HomeScreen`, `ModulesScreen`,
`QuizScreen`, `ResultScreen`, `QuestionCard` rendering) remains as
functions inside `src/App.tsx` instead of separate files — this preserves
already-working, higher-quality UI and satisfies Constitution Principle II
(data/engine decoupled from rendering) without a risky rewrite.

The "Objetos Litúrgicos" question bank was sourced from the pre-existing
`objetosLiturgicos.ts` at the repo root (25 questions, converted to the
`Question` interface) rather than authored from scratch — it has no
images. This is below the constitution's 30-50 target; content authoring
is out of this feature's scope per spec.md Assumptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Directory scaffolding for the feature; no new dependencies needed
(React 19, Vite 8, Tailwind v4 already installed per plan.md).

- [X] T001 Create directory structure `src/types/`, `src/data/`,
      `src/data/questions/`, `src/lib/`, `src/components/` per
      `plan.md` Project Structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, data, and engine that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Define core TypeScript interfaces (`QuestionOption`,
      `QuestionImage`, `Question`, `ModuleStatus`, `Module`, `RankTier`,
      `AnsweredQuestion`, `QuizSession`) in `src/types/quiz.ts` per
      `contracts/quiz-data-contract.md`. `RankTier` also carries
      `description`/`stars` to support the existing result-screen UI.
- [X] T003 [P] Implement static rank tiers (contiguous 0-10 coverage) and
      `getRank(score, tiers)` in `src/lib/ranking.ts` per `data-model.md`
      RankTier rules (depends on T002)
- [X] T004 [P] Implement quiz engine `startSession` (Fisher-Yates shuffle,
      handles banks with <10 questions), `submitAnswer` (no-op on repeat
      selection for the current question), `advance`, and `getScore` in
      `src/lib/quizEngine.ts` per `contracts/quiz-data-contract.md` and
      `research.md` sections 1 and 3 (depends on T002)
- [X] T005 Create the "Objetos Litúrgicos" question bank in
      `src/data/questions/objetos-liturgicos.ts` conforming to the
      `Question` interface (depends on T002). Sourced from the existing
      root-level `objetosLiturgicos.ts` (25 questions, no images) — below
      the 30-50 target; content authoring is out of scope for this feature.
- [X] T006 Create the module registry with `"objetos-liturgicos"` as an
      `available` module referencing the bank from T005, in
      `src/data/modules.ts` (depends on T002, T005)
- [X] T007 Set up the screen routing state machine (`'start' | 'modules' |
      'quiz' | 'result'` via `useState`, no external router) in
      `src/App.tsx` (depends on T002) — kept the pre-existing router
      already in `App.tsx`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Jogar uma sessão de quiz randomizada (Priority: P1) 🎯 MVP

**Goal**: Um usuário seleciona o módulo disponível, responde 10 perguntas
sorteadas com feedback visual imediato por resposta, e vê pontuação + título
lúdico ao final.

**Independent Test**: Selecionar "Objetos Litúrgicos", responder às 10
perguntas, e verificar que a tela final exibe pontuação e título
correspondentes.

### Implementation for User Story 1

- [X] T008 [P] [US1] `StartScreen` function in `src/App.tsx` (apresenta o
      produto, botão para avançar) (FR-001) — kept as an in-file function
      component rather than `src/components/HomeScreen.tsx` (see
      Implementation Note)
- [X] T009 [P] [US1] `ModulesScreen`/`ModuleCard` functions in
      `src/App.tsx` rendering modules from `src/data/modules.ts` as
      selectable cards with ≥48px touch target (depends on T006) (FR-002
      partial — available-module path only; locked-module behavior added
      in US3)
- [X] T010 [P] [US1] Answer rendering inlined in the `QuizScreen` function
      (`src/App.tsx`) via the existing `AnswerButton` component: renders
      `prompt`, optional `image` capped at `35vh` with `object-contain`
      (per `research.md` section 4), and options with ≥48px touch targets;
      locks further selection once an answer is recorded and shows
      correct/incorrect styling distinctly (depends on T002) (FR-004,
      FR-005, FR-006, FR-010)
- [X] T011 [US1] `QuizScreen` function in `src/App.tsx`: creates a
      `QuizSession` via `startSession` on module selection, calls
      `submitAnswer`/`advance` on interaction, and displays progress via
      `ProgressBar` + "N de 10" (depends on T004, T010) (FR-003, FR-006,
      FR-007)
- [X] T012 [US1] `ResultScreen` function in `src/App.tsx`: computes
      `getScore` + `getRank` and displays final score, stars, and playful
      title (depends on T003, T004) (FR-008)
- [X] T013 [US1] Wired Start → Modules → Quiz → Result navigation
      (including "Trocar de Módulo" back to modules) in `App()`
      (`src/App.tsx`) (depends on T007-T012) (FR-009 partial —
      return-to-modules path)
- [X] T014 [US1] Manual verification: drove the full flow headlessly
      (Playwright, 390×844 viewport) — home → modules → 10 answered
      questions with visible correct/incorrect feedback and score → result
      screen with score/title; zero console errors. Confirms FR-001–FR-008,
      SC-002, SC-005 (depends on T013). SC-006 (image + no-scroll) has no
      live data to exercise since the sourced question bank has no images.

**Checkpoint**: User Story 1 is fully functional and independently
testable — this is the MVP.

---

## Phase 4: User Story 2 - Rejogar um módulo com perguntas diferentes (Priority: P2)

**Goal**: A partir da tela de resultado, "Jogar Novamente" inicia uma nova
sessão do mesmo módulo com um conjunto/ordem de perguntas diferente.

**Independent Test**: Jogar o mesmo módulo duas vezes seguidas e confirmar
que o conjunto e/ou ordem de perguntas difere entre as sessões.

### Implementation for User Story 2

- [X] T015 [US2] Wired "Jogar Novamente" action on `ResultScreen` to call
      `startSession` again (new shuffle) and return to `QuizScreen` with a
      fresh `QuizSession`, in `App()` (`src/App.tsx`) (depends on T004,
      T012, T013) (FR-009 — replay path)
- [X] T016 [US2] Manual verification: Playwright run replayed the same
      module and the first question of the new session differed from the
      first session's first question ("O que é o Conopeu?" vs. "Qual o
      nome da luz…"), confirming re-shuffle on replay (SC-003) (depends on
      T015)

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Navegar entre módulos disponíveis e futuros (Priority: P3)

**Goal**: A tela de módulos distingue visualmente módulos disponíveis de
bloqueados/"em breve" e ignora toques em módulos bloqueados.

**Independent Test**: Abrir a tela de módulos e verificar que módulos
disponíveis são selecionáveis e módulos bloqueados exibem indicador visual
sem iniciar sessão ao toque.

### Implementation for User Story 3

- [X] T017 [P] [US3] Added 3 placeholder `locked` module entries ("Vestes
      Litúrgicas e Insígnias", "Tempos Litúrgicos", "Estrutura da Missa" —
      titled after the other pre-existing root-level content files) with
      empty `questions` arrays to `src/data/modules.ts` (depends on T006)
- [X] T018 [US3] `ModuleCard` function (`src/App.tsx`) renders a distinct
      "Em breve" badge, dimmed styling, and a `disabled` `<button>` for
      `status === 'locked'` cards so no click/tap starts a session
      (depends on T009, T017) (FR-002, FR-012)
- [X] T019 [US3] Manual verification: Playwright confirmed the locked
      module's card button has `disabled: true` and a force-click leaves
      the user on the Módulos screen; fixed the back-button touch target
      (was 36×36px, now 48×48px) found during this pass (SC-004) (depends
      on T018)

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [X] T020 [P] Audited all interactive controls in `src/App.tsx` for a
      ≥48px touch target; found and fixed the Módulos back button (36px →
      48px) (FR-010, SC-004)
- [X] T021 [P] Verified the question card renders correctly for questions
      without an `image` — the image block is conditionally rendered, so
      no gap; confirmed visually via screenshot with the (image-less)
      "Objetos Litúrgicos" bank
- [X] T022 Ran the dev server + a headless-Chromium walkthrough
      (mobile viewport, 390×844) covering: start → modules (1 available +
      3 locked) → 10 answered questions → result → replay. `tsc --noEmit`
      clean; zero browser console errors.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion — no
  dependency on US2/US3
- **User Story 2 (Phase 4)**: Depends on Foundational + US1 (reuses
  `ResultScreen`/`App.tsx` wiring from T012/T013)
- **User Story 3 (Phase 5)**: Depends on Foundational + US1 (reuses
  `ModuleSelectScreen` from T009)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independently testable once Foundational is done
- **US2 (P2)**: Builds on US1's `ResultScreen`/`App.tsx`; independently
  testable once its own tasks are done (T015-T016)
- **US3 (P3)**: Builds on US1's `ModuleSelectScreen`; independently
  testable once its own tasks are done (T017-T019)

### Within Each User Story

- Components with no cross-dependency ([P]) before components that compose
  them
- Screen composition/wiring before manual verification
- Manual verification task closes out each story

### Parallel Opportunities

- T002, T003, T004 can run in parallel after T002 lands (T003/T004 both
  depend only on T002, not on each other)
- T008, T009, T010 can run in parallel (different files, all depend only
  on Foundational)
- T020, T021 can run in parallel in Polish phase

---

## Parallel Example: Foundational Phase

```bash
# After T002 (types) completes, launch together:
Task: "Implement rank tiers and getRank in src/lib/ranking.ts"
Task: "Implement quiz engine in src/lib/quizEngine.ts"
```

## Parallel Example: User Story 1

```bash
# All depend only on Foundational phase completion:
Task: "Build HomeScreen component in src/components/HomeScreen.tsx"
Task: "Build ModuleSelectScreen component in src/components/ModuleSelectScreen.tsx"
Task: "Build QuestionCard component in src/components/QuestionCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run `quickstart.md` steps 1-6 on mobile viewport
5. Demo the MVP: home → module select → 10-question session → result

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add US1 → validate independently → MVP demo
3. Add US2 (replay) → validate independently (SC-003)
4. Add US3 (locked modules) → validate independently (SC-004, FR-012)
5. Polish phase → full quickstart.md pass before calling the feature done

---

## Notes

- [P] tasks touch different files with no unmet dependencies
- [Story] label maps each task to its user story for traceability
- No automated test suite exists yet — manual mobile-viewport verification
  (per constitution) substitutes for automated test tasks in each story
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
