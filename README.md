# Tarcisius

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

- React Native + Expo SDK 57
- react-native-web (para rodar no browser)
- React Navigation (native-stack)
- react-native-svg
- AsyncStorage
- TypeScript

## Rodando localmente

```bash
npm install
npm run web
```

O Expo sobe o servidor de desenvolvimento web.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run web` | Servidor de dev para web |
| `npm run start` | Expo Go (mobile) |
| `npm run ios` | Abre no simulador iOS |
| `npm run android` | Abre no emulador Android |
| `npm run build:web` | Gera o build de produção em `dist/` |

## Deploy (web)

```bash
npm run build:web
```

Os assets estáticos ficam em `dist/` — basta servir com qualquer CDN
ou hosting estático (Cloudflare Pages, Vercel, Netlify, etc.).

## Estrutura do projeto

```text
App.tsx                 # Entry point (SafeAreaProvider + Navigation)
index.ts                # registerRootComponent
src/
├── navigation/
│   └── RootNavigator.tsx   # Stack navigator (Start, About, Modules, Quiz, Result)
├── screens/
│   ├── StartScreen.tsx
│   ├── AboutScreen.tsx
│   ├── ModulesScreen.tsx
│   ├── QuizScreen.tsx
│   └── ResultScreen.tsx
├── components/
│   ├── GlyphIcon.tsx
│   ├── Monstrance.tsx
│   ├── ScreenHeader.tsx
│   └── StarIcon.tsx
├── theme/
│   └── tokens.ts          # Design tokens (colors, spacing, radius)
├── types/
│   └── quiz.ts            # Contrato de dados
├── data/
│   ├── modules.ts         # Registro de módulos
│   └── questions/         # Bancos de perguntas por módulo
└── lib/
    ├── quizEngine.ts      # Sorteio, respostas, avanço, pontuação
    ├── ranking.ts         # Faixas de pontuação → título
    ├── storage.ts         # AsyncStorage wrapper
    ├── share.ts           # Share API (RN + web)
    └── pwa.ts             # Registro do service worker (PWA)
```

Adicionar um módulo novo não exige alterar `lib/` nem os componentes —
basta um novo arquivo em `src/data/questions/` e uma entrada em
`src/data/modules.ts`.
