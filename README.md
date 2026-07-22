# Tarcisius — Quiz Litúrgico

Quiz gamificado de conhecimentos litúrgicos para coroinhas e acólitos. A
cada sessão, o app sorteia 10 perguntas de múltipla escolha de um módulo
temático, dá feedback visual imediato a cada resposta e atribui uma
pontuação e um título lúdico ao final.

Em honra de São Tarcísio, mártir acólito.

## Módulos disponíveis

- **Objetos Litúrgicos** — vasos sagrados, alfaias e paramentos do altar
- **Vestes Litúrgicas e Insígnias** — paramentos e cores dos ministros do altar
- **Tempos Litúrgicos** — cores e ciclos do ano litúrgico
- **Estrutura da Missa** — ritos e partes da celebração eucarística

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Deploy: Cloudflare Workers (assets estáticos), via Wrangler

## Rodando localmente

```bash
npm install
npm run dev
```

O Vite sobe o servidor de desenvolvimento em `http://localhost:8443`
(porta configurável via `$PORT`), com hot reload.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run format` | Formata o código com `oxfmt` |

## Deploy

O projeto é publicado como um Worker de assets estáticos na Cloudflare
(config em `wrangler.jsonc`). Deploy manual:

```bash
npm run build
npx wrangler deploy
```

Em produção, o deploy é automático a cada push em `main` via Cloudflare
Workers Builds.

## Estrutura do projeto

```text
src/
├── App.tsx              # Telas e roteamento (início → módulos → quiz → resultado)
├── types/quiz.ts         # Contrato de dados (Module, Question, QuizSession, RankTier)
├── data/
│   ├── modules.ts         # Registro de módulos
│   └── questions/         # Bancos de perguntas por módulo
└── lib/
    ├── quizEngine.ts       # Sorteio de perguntas, respostas, avanço, pontuação
    └── ranking.ts           # Faixas de pontuação → título lúdico
```

Adicionar um módulo novo não exige alterar `lib/` nem os componentes de
tela — basta um novo arquivo em `src/data/questions/` e uma entrada em
`src/data/modules.ts`.

## Documentação do desenvolvimento

O histórico de especificação, plano e tarefas desta feature está em
`specs/001-quiz-objetos-liturgicos/`.
