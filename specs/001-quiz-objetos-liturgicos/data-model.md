# Phase 1 Data Model: Quiz Litúrgico — Módulo Objetos Litúrgicos

Todas as entidades são dados estáticos tipados em TypeScript (sem
persistência em banco de dados), conforme constituição §Technology &
Development Workflow.

## Module

Representa um tema de conteúdo selecionável na tela de módulos.

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | `string` | sim | Slug único (ex.: `"objetos-liturgicos"`) |
| `title` | `string` | sim | Título exibido no cartão do módulo |
| `subtitle` | `string` | sim | Subtítulo curto |
| `description` | `string` | sim | Descrição exibida no cartão/tela |
| `status` | `'available' \| 'locked'` | sim | Controla seleção (FR-002, FR-012) |
| `questions` | `Question[]` | sim (quando `status === 'available'`) | Banco de perguntas do módulo; pode ser array vazio para módulos bloqueados/placeholder |

**Validation rules**:
- Módulos com `status === 'locked'` NÃO DEVEM iniciar sessão ao serem
  tocados (FR-012) — aplicado na camada de UI (`ModuleSelectScreen`), não no
  tipo em si.
- Módulos com `status === 'available'` DEVEM ter `questions.length >= 1`
  (idealmente 30-50 por Princípio II); menos de 10 é permitido e tratado
  pelo engine (usa todas as disponíveis — Edge Cases).

## Question

Unidade avaliável dentro de um módulo.

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | `string` | sim | Único dentro do módulo |
| `prompt` | `string` | sim | Enunciado em texto |
| `image` | `{ src: string; alt: string } \| undefined` | não | Imagem opcional do enunciado (Princípio III) |
| `options` | `QuestionOption[]` | sim | 2+ alternativas |
| `correctOptionId` | `string` | sim | Deve corresponder a um `id` em `options` |

## QuestionOption

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `id` | `string` | sim | Único dentro da pergunta |
| `label` | `string` | sim | Texto da alternativa (todas as alternativas são texto nesta fase — Quiz Inverso é fora de escopo) |

**Validation rules**:
- Exatamente um `option.id` em `options` deve ser igual a
  `correctOptionId`.
- `options.length >= 2`.

## QuizSession (estado em memória, não persistido)

Representa uma tentativa de jogo, vivendo apenas no estado do componente
`QuizScreen` durante a sessão ativa.

| Campo | Tipo | Notas |
|-------|------|-------|
| `moduleId` | `string` | Módulo associado |
| `questions` | `Question[]` | Conjunto randomizado (até 10) sorteado no início da sessão (FR-003) |
| `currentIndex` | `number` | Índice da pergunta atual (0-based); exibido como `currentIndex + 1` / `questions.length` (FR-007) |
| `answers` | `Array<{ questionId: string; selectedOptionId: string; correct: boolean }>` | Cresce a cada resposta |
| `score` | `number` (derivado) | `answers.filter(a => a.correct).length` |

**State transitions**:
1. `idle` → sessão criada com `questions` sorteadas, `currentIndex = 0`,
   `answers = []`.
2. Usuário seleciona uma opção → `answers` recebe entrada para a pergunta
   atual; UI trava novas seleções até avançar (FR-005, FR-006).
3. Avançar → `currentIndex += 1`. Se `currentIndex === questions.length`,
   sessão transiciona para tela de resultado (FR-008).
4. Na tela de resultado, "Jogar Novamente" recria uma nova `QuizSession` com
   novo sorteio (FR-009); "Voltar aos módulos" descarta a sessão.

Não há persistência entre sessões nem entre recarregamentos de página
(Assumptions).

## RankTier

Mapeamento estático entre faixa de pontuação e título lúdico exibido ao
final da sessão.

| Campo | Tipo | Notas |
|-------|------|-------|
| `minScore` | `number` | Inclusive |
| `maxScore` | `number` | Inclusive |
| `title` | `string` | Título lúdico (ex.: "Visitante da Igreja", "Guardião do Altar") |

**Validation rules**:
- Faixas DEVEM cobrir contiguamente `0` até `questions.length` máximo (10)
  sem sobreposição nem lacunas.
- Ajustável por decisão de produto sem impacto na estrutura funcional
  (Assumptions).

## Relacionamentos

```
Module 1───* Question
Question 1───* QuestionOption
QuizSession *───1 Module (via moduleId)
QuizSession 1───* Question (subconjunto sorteado, cópia por valor)
Score (derivado de QuizSession.answers) ───> RankTier (lookup por faixa)
```
