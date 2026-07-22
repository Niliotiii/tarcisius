# Implementation Plan: Quiz Litúrgico — Módulo Objetos Litúrgicos

**Branch**: `001-quiz-objetos-liturgicos` | **Date**: 2026-07-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-quiz-objetos-liturgicos/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Um quiz gamificado, mobile-first, de perguntas de múltipla escolha sobre o
módulo "Objetos Litúrgicos". A cada sessão o app sorteia 10 perguntas de um
banco estático (mínimo 30-50 perguntas), dá feedback visual instantâneo por
alternativa, bloqueia novas seleções após a primeira resposta, mostra
progresso ("3/10") e, ao final, calcula uma pontuação e um título lúdico. A
navegação inclui: tela inicial → seleção de módulos (com módulos
bloqueados/"em breve") → sessão de quiz → tela de resultado (jogar
novamente ou voltar aos módulos). Toda a lógica roda no cliente, sem
backend nem persistência entre sessões, usando a stack já ratificada na
constituição do projeto (React + Vite + TypeScript + Tailwind CSS v4),
com dados de módulos/perguntas definidos como dados estáticos tipados
para permitir expansão futura sem alterar a engine do quiz.

## Technical Context

**Language/Version**: TypeScript 5.7 (React 19)
**Primary Dependencies**: React 19, Vite 8, Tailwind CSS v4 (via `@tailwindcss/vite`), `@vitejs/plugin-react`
**Storage**: N/A — dados estáticos em módulos TypeScript (arrays tipados de `Module`/`Question`), sem backend nem banco de dados
**Testing**: Verificação manual em viewport mobile (conforme constituição); sem framework de testes automatizados configurado no projeto no momento
**Target Platform**: Navegador web (mobile-first), single-page app estática
**Project Type**: Single-page web application (frontend único, sem backend)
**Performance Goals**: Feedback de resposta síncrono e perceptivelmente instantâneo (sem loading state); tela de resultado em até 2s após a última resposta (SC-005)
**Constraints**: Touch targets ≥48px de altura (FR-010); nenhuma alternativa de resposta pode ficar oculta atrás de imagem em telas ≤480px sem exigir rolagem (FR-004, SC-006); sessão de quiz é local ao navegador, sem persistência entre sessões
**Scale/Scope**: 1 módulo disponível no lançamento ("Objetos Litúrgicos") com banco de 30-50 perguntas; demais módulos aparecem bloqueados como placeholders; 3 telas principais (módulos, quiz, resultado) + tela inicial

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|-----------|-----------|
| I. Mobile-First & Gamified Experience | PASS — spec exige mobile-first (FR-011), touch targets 48px (FR-010), pontuação + título lúdico (FR-008), progresso visível (FR-007) |
| II. Randomized Quiz Engine & Replayability | PASS — FR-003 exige sorteio aleatório de 10 perguntas por sessão a partir de um banco de 30-50; dados de perguntas serão decoplados da engine (arrays tipados separados dos componentes de quiz) |
| III. Multimedia-Ready Content | PASS — FR-004 exige suporte a perguntas texto-only e texto+imagem, com imagem responsiva; modelo de dados (`Question`) tratará imagem como campo opcional interchangeable, preparando terreno para "Quiz Inverso" futuro sem quebrar o engine |
| IV. Immediate Visual Feedback | PASS — FR-005/FR-006 exigem feedback síncrono e bloqueio de novas seleções; nenhuma chamada de rede está envolvida no fluxo de resposta, então não há risco de estado de loading |
| V. Extensible & PWA-Ready Architecture | PASS — módulos adicionais são adicionados via novo banco de dados + metadata, sem alterar lógica de quiz/feedback/ranking (FR-002, FR-012); stack cliente-only não impede conversão futura para PWA |

Nenhuma violação identificada. Nenhuma entrada necessária em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-quiz-objetos-liturgicos/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main.tsx                     # React entry point (existing)
├── App.tsx                      # Top-level screen router/state machine (existing, to be adapted)
├── index.css                    # Global styles + Tailwind import (existing)
├── types/
│   └── quiz.ts                  # Module, Question, QuizSession, RankTier interfaces
├── data/
│   ├── modules.ts                # Module registry (metadata + status + question bank reference)
│   └── questions/
│       └── objetos-liturgicos.ts # Question bank for the "Objetos Litúrgicos" module (30-50 questions)
├── lib/
│   ├── quizEngine.ts             # Random question selection, shuffling/no-repeat-in-session logic
│   └── ranking.ts                # Score → rank title mapping
├── components/
│   ├── HomeScreen.tsx            # Tela inicial (FR-001)
│   ├── ModuleSelectScreen.tsx    # Lista de módulos (FR-002, FR-012)
│   ├── QuizScreen.tsx            # Sessão de quiz (FR-003 a FR-007)
│   ├── QuestionCard.tsx          # Enunciado + imagem opcional + alternativas
│   └── ResultScreen.tsx          # Pontuação + título + ações (FR-008, FR-009)
└── vite-env.d.ts                 # (existing)
```

**Structure Decision**: Single-project frontend (Option 1, adaptado). Não há
backend nem projeto separado — tudo vive em `src/` do projeto Vite existente.
Dados de módulos/perguntas ficam isolados em `src/data/` como TypeScript
tipado, mantendo-os desacoplados da lógica de quiz (`src/lib/`) e dos
componentes de apresentação (`src/components/`), conforme Princípio II e V da
constituição. `App.tsx` existente será adaptado para atuar como o roteador de
telas (state machine simples: home → module-select → quiz → result), sem
introduzir um router externo dado o escopo de 4 telas.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Nenhuma violação — seção não aplicável.
