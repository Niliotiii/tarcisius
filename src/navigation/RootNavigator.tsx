import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StartScreen } from "../screens/StartScreen";
import { AboutScreen } from "../screens/AboutScreen";
import { ModulesScreen } from "../screens/ModulesScreen";
import { QuizScreen } from "../screens/QuizScreen";
import { ResultScreen } from "../screens/ResultScreen";

export type RootStackParamList = {
  Start: undefined;
  About: undefined;
  Modules: undefined;
  Quiz: { moduleId: string };
  Result: { moduleId: string; score: number; total: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { flex: 1, width: "100%" },
      }}
    >
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Modules" component={ModulesScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}
