# Phase 0 Research: Quiz Litúrgico — Módulo Objetos Litúrgicos

Nenhum item da spec ficou marcado como `NEEDS CLARIFICATION`. Este documento
resolve as decisões técnicas implícitas necessárias para o Technical Context
e o design de Fase 1.

## 1. Seleção aleatória de perguntas sem repetição previsível

- **Decision**: Usar um shuffle Fisher-Yates sobre o array completo de
  perguntas do módulo e cortar os primeiros N (10, ou o total disponível se
  menor que 10), a cada início/reinício de sessão.
- **Rationale**: Fisher-Yates é O(n), não tem viés de distribuição
  (diferente de `Array.sort(() => Math.random() - 0.5)`), e é trivial de
  implementar sem dependências externas. Atende SC-003 (≥90% das sessões
  consecutivas divergem em conjunto/ordem) e o edge case de bancos com
  menos de 10 perguntas (FR-003, Edge Cases).
- **Alternatives considered**:
  - `sort` com comparador aleatório — rejeitado por viés conhecido de
    distribuição e por não garantir shuffle uniforme.
  - Sorteio com seed persistida (para permitir "replay exato") — rejeitado
    por não haver requisito de retomada/replay determinístico (Assumptions:
    sessões são anônimas e sem histórico).

## 2. Modelo de dados para perguntas com imagem opcional

- **Decision**: `Question.image` como campo opcional (`string | undefined`
  para a URL/import da imagem), com `alt` obrigatório quando presente.
  Alternativas (`options`) permanecem sempre texto nesta fase.
- **Rationale**: Atende Princípio III (texto e imagem como inputs
  interchangeable no nível da pergunta) sem sobre-engenharia — o roadmap de
  "Quiz Inverso" (alternativas como imagem) é Baixa prioridade e não deve
  bloquear o lançamento do módulo atual. Estruturar `options` como um array
  de objetos (`{ id, label }`) em vez de strings soltas já deixa a porta
  aberta para adicionar `imageUrl` por alternativa no futuro sem migração de
  schema.
- **Alternatives considered**:
  - Union type `TextQuestion | ImageQuestion` — rejeitado por adicionar
    complexidade de type-narrowing sem benefício real, já que o único campo
    que varia é a presença da imagem no enunciado.

## 3. Prevenção de cliques múltiplos durante feedback

- **Decision**: Estado local `selectedOptionId: string | null` por pergunta
  atual; ao setar, o componente de alternativas passa a ignorar novos
  cliques (`disabled` via prop derivada de `selectedOptionId !== null`) até a
  navegação para a próxima pergunta resetar o estado.
- **Rationale**: Atende FR-006 e o edge case de duplo-toque. Não requer
  debounce nem lock assíncrono, pois toda a lógica é síncrona (sem chamadas
  de rede) — Princípio IV.
- **Alternatives considered**: Debounce por tempo (ex.: ignorar cliques por
  300ms) — rejeitado por ser mais frágil (dependente de timing) que
  simplesmente derivar o estado "bloqueado" da resposta já selecionada.

## 4. Gestão de imagem sem exigir rolagem (FR-004, SC-006)

- **Decision**: Imagem da pergunta renderizada com `max-height` limitado
  (ex.: `max-h-[35vh]` via Tailwind) e `object-contain`, dentro de um layout
  flex-column onde a lista de alternativas sempre ocupa o espaço restante
  abaixo da imagem, com o container de pergunta+imagem+alternativas
  ajustando-se à viewport (`min-h-dvh` na tela de quiz).
- **Rationale**: `max-height` relativo à viewport garante que a imagem nunca
  empurre as alternativas para fora da área visível em telas pequenas
  (≤480px), atendendo SC-006 sem exigir media queries por breakpoint
  específico.
- **Alternatives considered**: Scroll interno apenas na área da imagem —
  rejeitado porque a spec exige que a alternativa não fique oculta atrás da
  imagem "sem rolagem adicional", ou seja, o requisito é eliminar a
  necessidade de scroll, não escondê-lo dentro de um sub-container.

## 5. Cálculo de título lúdico (Rank)

- **Decision**: Tabela estática ordenada de faixas `{ minScore, maxScore,
  title }` percorrida linearmente para encontrar a faixa correspondente à
  pontuação final (0-10 acertos).
- **Rationale**: Estrutura simples, sem dependências, fácil de ajustar por
  decisão de produto (Assumptions) sem tocar em lógica de quiz — mantém
  ranking desacoplado do engine (Princípio V).
- **Alternatives considered**: Fórmula matemática (ex.: `score * 10`) em vez
  de títulos textuais — rejeitado porque a spec exige explicitamente um
  "título lúdico" (FR-008), não apenas um número.

## 6. Roteamento entre telas

- **Decision**: State machine simples em `App.tsx` usando `useState` com um
  union type de telas (`'home' | 'module-select' | 'quiz' | 'result'`) e
  dados de contexto (`selectedModuleId`, `lastSession`) passados como props.
  Sem React Router.
- **Rationale**: Apenas 4 telas, sem necessidade de URLs profundas,
  histórico do navegador ou deep-linking nesta fase (Assumptions: sem contas
  nem persistência). Introduzir um router adicionaria uma dependência não
  justificada pelo escopo atual.
- **Alternatives considered**: `react-router-dom` — rejeitado por
  over-engineering para 4 telas lineares sem requisito de URL/deep-link.
