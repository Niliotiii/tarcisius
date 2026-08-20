# tarcisius

React Native + Expo + react-native-web project (Quiz Litúrgico).

## Development Server

Run `npm run web` to start the Expo web dev server.

## Key Files

- `App.tsx` - Root component (SafeAreaProvider + NavigationContainer)
- `index.ts` - Expo entry point (registerRootComponent)
- `src/navigation/RootNavigator.tsx` - Stack navigator
- `src/screens/` - All screen components
- `src/components/` - Reusable UI components
- `src/theme/tokens.ts` - Design tokens
- `src/lib/` - Business logic (quizEngine, ranking, storage, share, pwa)
- `src/data/` - Modules and question banks
- `app.json` - Expo configuration
- `babel.config.js` - Babel preset (babel-preset-expo)
- `public/` - Static assets served at root (images, manifest, sw.js)

## Styling

This project uses **React Native StyleSheet** for styling. All UI is built
with React Native primitives (View, Text, Pressable, ScrollView) and
react-native-svg for icons/graphics. No CSS or Tailwind.
