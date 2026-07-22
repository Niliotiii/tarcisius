# Contract: Quiz Data Interface (`src/types/quiz.ts`)

Este projeto não expõe uma API externa nem um serviço de backend — a
"interface" relevante é o contrato de dados estáticos e tipados que o
motor de quiz (`src/lib/quizEngine.ts`, `src/lib/ranking.ts`) e os
componentes de apresentação (`src/components/*`) consomem. Autores de
conteúdo (equipe de outra área, conforme Assumptions da spec) devem seguir
este contrato ao adicionar módulos/perguntas sem tocar em lógica de
renderização ou de sorteio.

## TypeScript Interfaces (contrato)

```ts
export interface QuestionOption {
  id: string
  label: string
}

export interface QuestionImage {
  src: string
  alt: string
}

export interface Question {
  id: string
  prompt: string
  image?: QuestionImage
  options: QuestionOption[]
  correctOptionId: string
}

export type ModuleStatus = 'available' | 'locked'

export interface Module {
  id: string
  title: string
  subtitle: string
  description: string
  status: ModuleStatus
  questions: Question[]
}

export interface RankTier {
  minScore: number
  maxScore: number
  title: string
}

export interface AnsweredQuestion {
  questionId: string
  selectedOptionId: string
  correct: boolean
}

export interface QuizSession {
  moduleId: string
  questions: Question[]
  currentIndex: number
  answers: AnsweredQuestion[]
}
```

## Funções do engine (contrato de comportamento)

### `startSession(module: Module, size = 10): QuizSession`
- **Pre**: `module.status === 'available'`.
- **Post**: Retorna uma `QuizSession` com `questions` sorteadas
  (Fisher-Yates) contendo `min(size, module.questions.length)` perguntas
  sem duplicatas, `currentIndex = 0`, `answers = []`.
- Chamado tanto para iniciar quanto para "Jogar Novamente" (FR-003, FR-009).

### `submitAnswer(session: QuizSession, optionId: string): QuizSession`
- **Pre**: A pergunta em `session.currentIndex` ainda não tem entrada
  correspondente em `session.answers` (garante FR-006 — apenas a primeira
  seleção é registrada).
- **Post**: Retorna nova `QuizSession` com uma entrada adicionada a
  `answers` indicando se `optionId === correctOptionId` da pergunta atual.
  Chamadas subsequentes com a mesma pergunta atual são no-op (retornam a
  sessão inalterada) — implementa o edge case de duplo-toque.

### `advance(session: QuizSession): QuizSession`
- **Post**: Retorna nova `QuizSession` com `currentIndex + 1`. Camada de UI
  verifica `currentIndex === questions.length` para transicionar à tela de
  resultado.

### `getScore(session: QuizSession): number`
- **Post**: Retorna contagem de `answers` com `correct === true`.

### `getRank(score: number, tiers: RankTier[]): RankTier`
- **Pre**: `tiers` cobre contiguamente o intervalo `[0, questions.length
  máximo]` sem lacunas (ver data-model.md).
- **Post**: Retorna a `RankTier` cuja faixa contém `score`. Lança erro em
  desenvolvimento (assert) se nenhuma faixa cobrir o score — indica erro de
  configuração de dados, não estado de runtime esperado.

## Garantias de desacoplamento (Princípio II e V)

- Nenhuma função do engine importa componentes React.
- Nenhum componente React acessa `module.questions` diretamente para
  lógica de sorteio — sempre via `startSession`.
- Adicionar um novo módulo requer apenas: (1) um novo arquivo em
  `src/data/questions/`, (2) uma entrada em `src/data/modules.ts`. Nenhuma
  mudança em `src/lib/` ou `src/components/` é necessária.
