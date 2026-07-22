<!--
Sync Impact Report
Version change: (none) → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles: I. Mobile-First & Gamified Experience; II. Randomized Quiz Engine & Replayability;
    III. Multimedia-Ready Content; IV. Immediate Visual Feedback; V. Extensible & PWA-Ready Architecture
  - Product Scope & Feature Priorities
  - Technology & Development Workflow
  - Governance
Removed sections: none (template placeholders only)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (generic Constitution Check gate references principles; no edits needed)
  ✅ .specify/templates/spec-template.md (no constitution-specific references found requiring changes)
  ✅ .specify/templates/tasks-template.md (task categories remain generic/compatible)
  ✅ .claude/skills/speckit-git-*/ (no agent-specific naming conflicts found)
Follow-up TODOs: none
-->

# Coroinhas Quiz Constitution

## Core Principles

### I. Mobile-First & Gamified Experience (NON-NEGOTIABLE)
Every screen MUST be designed and tested mobile-first, since the primary audience
(coroinhas e acólitos, jovens e adolescentes) will access the app predominantly on
phones. Layouts MUST remain usable and legible at small viewport widths before any
desktop refinement is considered. All core interactions (question answering, module
selection, results) MUST use gamification mechanics (scoring, titles, visual
feedback, progress indicators) rather than plain form-like presentation — the
product's purpose is to make liturgical learning engaging, not just informative.

**Rationale**: The target users are young acolytes who will disengage from a dry
quiz form; mobile-first, playful presentation is the core value proposition, not
an aesthetic add-on.

### II. Randomized Quiz Engine & Replayability
Each quiz session MUST draw a randomized subset of questions (default: 10) from a
larger question bank per module (30-50 questions minimum once a module is
considered complete). The selection algorithm MUST avoid predictable ordering or
repeated identical sessions in immediate succession. Adding, editing, or removing
questions in a module's bank MUST NOT require changes to the quiz engine itself —
question data and quiz logic MUST remain decoupled so new modules and content can
be authored independently.

**Rationale**: Replayability is the explicit product goal; a fixed or predictable
question order defeats the "cada sessão de jogo será única" requirement and reduces
long-term engagement.

### III. Multimedia-Ready Content
Questions and answer options MUST support both plain text and images without
custom per-question layout code. Images MUST be responsive (auto-resize, correct
aspect ratio, no layout breakage) across supported viewport sizes. The question
data model MUST treat text and image content as interchangeable inputs so that the
future "Quiz Inverso" (image-based answer options) can be implemented by extending
the data model, not by rewriting the rendering engine.

**Rationale**: Objetos litúrgicos are visual by nature (vasos sagrados, paramentos,
gestos) — text-only questions cannot adequately test this knowledge, and the
roadmap explicitly requires image-based answers later.

### IV. Immediate Visual Feedback
Every answer selection MUST produce an instant, unambiguous visual response
(color change and/or animation indicating correct/incorrect) before the user
advances to the next question. Feedback MUST render synchronously with the user's
tap/click — no perceptible delay, spinner, or blank state between selection and
feedback. Progress toward quiz completion (e.g., "3/10") MUST be visible at all
times during a quiz session.

**Rationale**: Immediate feedback is what makes the quiz feel like a game rather
than a test; delayed or missing feedback breaks the gamified loop the product
depends on.

### V. Extensible & PWA-Ready Architecture
New topic modules (beyond "Objetos Litúrgicos") MUST be addable by supplying a new
question bank and module metadata, without modifying shared quiz, feedback, or
ranking logic. The codebase MUST avoid hard-coding assumptions that only one
module or one question type will ever exist. Architectural and dependency choices
MUST NOT preclude a future conversion to an installable Progressive Web App
(offline caching, manifest, service worker) — avoid patterns that require a
persistent server connection for core quiz functionality.

**Rationale**: The stated secondary objective is a solid, expansible platform;
retrofitting modularity or PWA support later is far more costly than designing
for it from the start.

## Product Scope & Feature Priorities

Feature work MUST respect the following priority order when trade-offs are
necessary:

- **Alta**: Randomized quiz engine, multimedia question/answer support, immediate
  visual feedback. These are non-negotiable for any release.
- **Média**: Progress bar (current question / total), end-of-quiz ranking screen
  that awards a playful title based on score (e.g., "Visitante", "Cerimoniário
  Mestre"). These MUST ship but MAY be simplified in an initial release if needed.
- **Baixa**: "Quiz Inverso" (text prompt, image-based answer options). This is
  explicitly future scope — the data model (Principle III) MUST NOT block it, but
  implementation MAY be deferred indefinitely.

The first content module MUST be "Objetos Litúrgicos". Additional modules
(e.g., paramentos, gestos e ritos) are expected to follow the same module
contract established by the first.

## Technology & Development Workflow

The application is a React + Vite + TypeScript + Tailwind CSS (v4) single-page
web app, mobile-first by default. Tailwind utility classes MUST be used directly
in JSX; no additional CSS-in-JS or component-styling library MAY be introduced
without amending this constitution. Question banks MUST be defined as typed data
(TypeScript interfaces for `Question` and `Module`), keeping content changes
reviewable as plain data diffs separate from logic diffs. Any change that touches
quiz randomization, scoring, or ranking logic MUST be manually verified on a
mobile viewport before being considered complete, since automated visual testing
is not yet part of this project's tooling.

## Governance

This constitution supersedes ad-hoc conventions for this project. All feature
specs, plans, and task lists MUST verify alignment with the Core Principles above
before implementation begins; any deviation MUST be explicitly justified in the
relevant spec or plan under a "Complexity Tracking" or equivalent section.

**Amendment procedure**: Amendments are made by editing this file directly. Any
amendment MUST update the version number per the semantic versioning policy below
and MUST include a Sync Impact Report as an HTML comment at the top of this file
describing what changed and which dependent templates were reviewed.

**Versioning policy**: MAJOR versions require backward-incompatible changes to or
removal of a Core Principle. MINOR versions add a new principle or materially
expand existing guidance. PATCH versions cover clarifications and wording fixes
that do not change enforceable rules.

**Compliance review**: Every `/speckit.plan` execution MUST re-check its
Constitution Check gate against the current version of this file. Reviewers of
pull requests MUST confirm gamification, randomization, multimedia, feedback, and
extensibility requirements are met before approving merges.

**Version**: 1.0.0 | **Ratified**: 2026-07-21 | **Last Amended**: 2026-07-21
