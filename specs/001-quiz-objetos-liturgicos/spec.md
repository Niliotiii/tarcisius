# Feature Specification: Quiz Litúrgico — Módulo Objetos Litúrgicos

**Feature Branch**: `001-quiz-objetos-liturgicos`
**Created**: 2026-07-21
**Status**: Draft
**Input**: User description: "Requisitos Técnicos e Stack (Next.js, Tailwind CSS, React Hooks, dados estáticos, hospedagem Vercel) e Requisitos de UX/UI (mobile-first, touch targets de 48px, gestão de imagens sem scroll excessivo, prevenção de cliques múltiplos durante feedback) para o quiz gamificado de conhecimentos litúrgicos, módulo Objetos Litúrgicos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jogar uma sessão de quiz randomizada (Priority: P1)

Um coroinha abre o aplicativo, escolhe o módulo "Objetos Litúrgicos" e responde a
10 perguntas selecionadas aleatoriamente do banco de perguntas do módulo,
recebendo feedback visual imediato a cada resposta e uma pontuação final com um
título lúdico.

**Why this priority**: Esta é a mecânica central do produto — sem ela não existe
quiz, gamificação, nem valor de aprendizado. Todo o restante do produto depende
desta jornada funcionar de ponta a ponta.

**Independent Test**: Pode ser testado integralmente selecionando o módulo
"Objetos Litúrgicos", respondendo às 10 perguntas apresentadas e verificando que
a tela final exibe a pontuação correta e um título correspondente ao desempenho.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela de módulos, **When** ele seleciona um módulo
   disponível, **Then** o sistema inicia uma sessão com 10 perguntas selecionadas
   aleatoriamente do banco daquele módulo.
2. **Given** o usuário está respondendo a uma pergunta, **When** ele toca em uma
   das alternativas, **Then** o sistema mostra imediatamente se a resposta está
   certa ou errada, destaca a alternativa correta, e bloqueia novas seleções
   naquela pergunta.
3. **Given** o usuário respondeu à décima pergunta, **When** ele avança, **Then**
   o sistema exibe a tela de resultado com a pontuação total e um título
   correspondente à faixa de desempenho.

---

### User Story 2 - Rejogar um módulo com perguntas diferentes (Priority: P2)

Um coroinha que já completou uma sessão quer jogar novamente o mesmo módulo e
espera receber um conjunto de perguntas diferente (ou em ordem diferente) para
manter o desafio interessante.

**Why this priority**: A replayability é um objetivo de produto explícito; sem
variação perceptível entre sessões, o valor de treino repetido cai
significativamente.

**Independent Test**: Pode ser testado jogando o mesmo módulo duas vezes
seguidas e confirmando que o conjunto e/ou a ordem das perguntas exibidas difere
entre as duas sessões.

**Acceptance Scenarios**:

1. **Given** o usuário terminou uma sessão, **When** ele escolhe "Jogar
   Novamente" no mesmo módulo, **Then** o sistema seleciona um novo conjunto
   aleatório de 10 perguntas do banco daquele módulo.
2. **Given** o banco de perguntas de um módulo tem mais de 10 perguntas, **When**
   duas sessões consecutivas são iniciadas, **Then** a ordem e/ou a seleção de
   perguntas apresentadas não é idêntica nas duas sessões.

---

### User Story 3 - Navegar entre módulos disponíveis e futuros (Priority: P3)

Um coroinha abre a tela de módulos e vê quais temas já estão disponíveis para
jogar e quais ainda estão bloqueados/"em breve", podendo escolher livremente
entre os disponíveis.

**Why this priority**: Suporta o objetivo secundário de uma plataforma
expansível — comunica progresso do produto e evita frustração ao tentar acessar
conteúdo inexistente.

**Independent Test**: Pode ser testado abrindo a tela de módulos e verificando
que módulos disponíveis são selecionáveis e módulos bloqueados exibem um
indicador visual e não iniciam uma sessão ao serem tocados.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela de módulos, **When** a tela carrega,
   **Then** cada módulo mostra título, descrição e status (disponível ou
   bloqueado).
2. **Given** um módulo está marcado como bloqueado, **When** o usuário toca
   nele, **Then** nenhuma sessão de quiz é iniciada.

---

### Edge Cases

- O que acontece quando o banco de perguntas de um módulo tem menos de 10
  perguntas? O sistema deve usar todas as perguntas disponíveis sem travar ou
  exibir perguntas duplicadas na mesma sessão.
- O que acontece quando uma pergunta com imagem é exibida em uma tela muito
  pequena? A imagem deve ser redimensionada automaticamente sem exigir rolagem
  para ver as alternativas de resposta.
- O que acontece se o usuário tocar rapidamente em mais de uma alternativa
  antes do feedback visual aparecer? Apenas a primeira seleção deve ser
  registrada; as demais devem ser ignoradas.
- O que acontece quando o usuário tenta selecionar um módulo bloqueado? A ação
  deve ser ignorada e o status "em breve" deve permanecer visível.
- O que acontece se o usuário sair no meio de uma sessão (fechar/atualizar a
  página)? O progresso da sessão em andamento pode ser perdido; não há
  requisito de retomada nesta fase.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir uma tela inicial que apresenta o produto e
  permite ao usuário avançar para a seleção de módulos.
- **FR-002**: O sistema DEVE exibir uma lista de módulos temáticos, cada um com
  título, descrição e status (disponível ou bloqueado/"em breve").
- **FR-003**: Ao iniciar ou reiniciar uma sessão, o sistema DEVE selecionar
  aleatoriamente 10 perguntas do banco de perguntas do módulo escolhido
  (banco mínimo de 30-50 perguntas por módulo lançado).
- **FR-004**: O sistema DEVE suportar perguntas compostas apenas por texto ou
  por texto e imagem, exibindo qualquer imagem redimensionada de forma que
  nenhuma alternativa de resposta exija rolagem vertical para ser vista.
- **FR-005**: Ao selecionar uma alternativa, o sistema DEVE exibir
  imediatamente um indicativo visual distinto para "correto" e "incorreto",
  incluindo a indicação da alternativa correta quando o usuário errar.
- **FR-006**: Após a primeira seleção em uma pergunta, o sistema DEVE impedir
  novas seleções naquela mesma pergunta enquanto o feedback visual estiver
  ativo.
- **FR-007**: O sistema DEVE exibir o progresso da sessão (por exemplo,
  "3/10") de forma visível durante toda a sessão de quiz.
- **FR-008**: Ao concluir a última pergunta, o sistema DEVE exibir a pontuação
  total obtida e atribuir um título lúdico correspondente à faixa de
  desempenho alcançada.
- **FR-009**: O sistema DEVE permitir que o usuário, a partir da tela de
  resultado, reinicie o mesmo módulo com um novo conjunto de perguntas ou
  retorne à tela de seleção de módulos.
- **FR-010**: Todos os controles interativos (cartões de módulo, botões de
  resposta, botões de navegação) DEVEM ter uma área de toque de pelo menos
  48px de altura.
- **FR-011**: O layout DEVE ser projetado e funcionar corretamente
  primeiramente em telas de celular, mantendo-se utilizável em telas maiores.
- **FR-012**: Módulos bloqueados DEVEM ser visualmente distintos dos
  disponíveis e NÃO DEVEM ser selecionáveis.

### Key Entities *(include if feature involves data)*

- **Módulo**: Representa um tema de conteúdo (ex.: "Objetos Litúrgicos").
  Atributos: identificador, título, subtítulo, descrição, status
  (disponível/bloqueado), banco de perguntas associado.
- **Pergunta**: Unidade avaliável dentro de um módulo. Atributos: enunciado
  (texto), imagem opcional, lista de alternativas, indicação da alternativa
  correta.
- **Sessão de Quiz**: Uma tentativa de jogo. Atributos: módulo associado,
  conjunto randomizado de 10 perguntas, respostas selecionadas, pontuação
  final.
- **Faixa de Título (Rank)**: Mapeamento entre intervalo de pontuação e um
  título lúdico exibido ao final da sessão (ex.: "Visitante da Igreja",
  "Guardião do Altar").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário consegue completar uma sessão de 10 perguntas em
  menos de 5 minutos.
- **SC-002**: 100% das respostas selecionadas recebem feedback visual sem
  atraso perceptível (sem estado de carregamento entre a seleção e o
  feedback).
- **SC-003**: Em pelo menos 90% das vezes em que o mesmo módulo é jogado duas
  vezes seguidas, o conjunto e/ou a ordem de perguntas exibidas não é
  idêntico entre as duas sessões.
- **SC-004**: 100% dos controles interativos atendem à área de toque mínima
  de 48px em viewports móveis.
- **SC-005**: O usuário visualiza sua pontuação e título atribuído em até 2
  segundos após responder à última pergunta, sem atraso perceptível.
- **SC-006**: Em telas de até 480px de largura, nenhuma alternativa de
  resposta fica oculta atrás de uma imagem que exija rolagem adicional para
  ser vista.

## Assumptions

- A criação e curadoria do conteúdo (texto e imagens das perguntas) é de
  responsabilidade de outra equipe/processo e está fora do escopo desta
  especificação; aqui assume-se apenas que os dados estarão disponíveis no
  formato de dados estático definido para o produto.
- O primeiro módulo disponível no lançamento é "Objetos Litúrgicos"; demais
  módulos podem aparecer como bloqueados/"em breve" como espaços reservados.
- Não há contas de usuário nem autenticação nesta fase — cada sessão de quiz é
  anônima e local à instância do navegador/dispositivo, sem persistência de
  histórico entre sessões.
- Os limiares de pontuação e os textos dos títulos de ranking (ex.:
  "Visitante", "Cerimoniário Mestre") podem ser ajustados por decisão de
  produto sem impacto na estrutura funcional descrita aqui.
- A stack técnica solicitada nos requisitos originais (Next.js, hospedagem
  Vercel) diverge da stack já ratificada na constituição do projeto e já em
  uso no protótipo atual. Decisão: manter React + Vite + TypeScript +
  Tailwind CSS (conforme constituição vigente) para este módulo; o pedido de
  migração para Next.js/Vercel não será adotado neste momento.
