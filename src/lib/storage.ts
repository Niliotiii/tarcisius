import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QuizSession } from "../types/quiz";

const SESSION_KEY = "tarcisius:session";
const HISTORY_KEY = "tarcisius:history";

export interface StoredSession {
  moduleId: string;
  session: QuizSession;
}

export async function saveSession(moduleId: string, session: QuizSession): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ moduleId, session }));
  } catch {
    // Storage unavailable — session simply won't be resumable.
  }
}

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export async function loadMissHistory(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

async function saveMissHistory(history: Record<string, number>): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export async function recordMiss(questionId: string): Promise<void> {
  const history = await loadMissHistory();
  history[questionId] = (history[questionId] ?? 0) + 1;
  await saveMissHistory(history);
}

export async function clearMiss(questionId: string): Promise<void> {
  const history = await loadMissHistory();
  if (questionId in history) {
    delete history[questionId];
    await saveMissHistory(history);
  }
}
