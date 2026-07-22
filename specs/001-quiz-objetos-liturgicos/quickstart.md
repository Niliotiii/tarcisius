# Quickstart: Quiz Litúrgico — Módulo Objetos Litúrgicos

## Rodando o projeto

```bash
npm install   # ou pnpm install
npm run dev   # ou pnpm dev
```

O Vite sobe o servidor de desenvolvimento na porta `$PORT` (padrão 8443)
com hot reload — edite os arquivos em `src/` e a página atualiza
automaticamente.

## Fluxo de verificação manual (obrigatório pela constituição)

Como o projeto ainda não tem testes automatizados configurados, toda
mudança em lógica de quiz/randomização/ranking DEVE ser verificada
manualmente em viewport mobile antes de ser considerada completa
(constituição §Technology & Development Workflow).

1. Abra a preview em uma largura ≤480px (DevTools → mobile emulation, ex.
   iPhone SE).
2. Na tela inicial, avance para a seleção de módulos.
3. Confirme que "Objetos Litúrgicos" aparece disponível e demais módulos
   (se houver) aparecem bloqueados/"em breve" e não iniciam sessão ao toque
   (FR-012).
4. Selecione "Objetos Litúrgicos" e confirme que uma sessão de 10
   perguntas é sorteada (FR-003).
5. Responda a uma pergunta:
   - Confirme feedback visual imediato (correto/incorreto) sem delay
     perceptível (FR-005, SC-002).
   - Tente tocar em outra alternativa após a primeira resposta — confirme
     que nada muda (FR-006, edge case de duplo-toque).
   - Confirme que o progresso ("N/10") está visível (FR-007).
   - Se a pergunta tiver imagem, confirme que todas as alternativas estão
     visíveis sem exigir rolagem (FR-004, SC-006).
6. Complete as 10 perguntas e confirme que a tela de resultado exibe
   pontuação e título lúdico em até 2s (FR-008, SC-005).
7. Toque em "Jogar Novamente" e confirme que o novo conjunto/ordem de
   perguntas difere da sessão anterior (FR-009; SC-003 exige isso em ≥90%
   das repetições, então rodar 2-3 vezes para checar).
8. Volte à seleção de módulos a partir da tela de resultado e confirme que
   funciona (FR-009).
9. Em toda a jornada, confirme visualmente que cartões de módulo, botões de
   resposta e botões de navegação têm altura de toque ≥48px (FR-010,
   SC-004) — pode ser medido via DevTools inspector.

## Adicionando um novo módulo (fluxo de conteúdo)

1. Criar `src/data/questions/<slug-do-modulo>.ts` exportando um array de
   `Question` (ver contrato em `contracts/quiz-data-contract.md`).
2. Adicionar uma entrada em `src/data/modules.ts` com `status: 'locked'`
   até o conteúdo estar pronto, depois trocar para `'available'`.
3. Nenhuma alteração em `src/lib/` ou `src/components/` é necessária —
   isso é o que garante o Princípio V (extensibilidade) da constituição.
