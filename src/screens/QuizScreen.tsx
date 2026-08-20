import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image, StyleSheet, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import type { QuizSession } from "../types/quiz";
import { modules } from "../data/modules";
import { startSession, submitAnswer, advance, getScore } from "../lib/quizEngine";
import { saveSession, clearSession, loadMissHistory, recordMiss, clearMiss } from "../lib/storage";
import { colors, spacing, radius, accentColorFor } from "../theme/tokens";
import { GlyphIcon, type GlyphName } from "../components/GlyphIcon";

type Props = NativeStackScreenProps<RootStackParamList, "Quiz">;

const TILE_STYLES: { color: string; mark: GlyphName }[] = [
  { color: "#DE9A1F", mark: "star" },
  { color: "#7C3AED", mark: "dot" },
  { color: "#0891B2", mark: "triangle" },
  { color: "#EA580C", mark: "cross" },
];

type TileState = "idle" | "correct" | "wrong" | "neutral";

function currentStreak(session: QuizSession): number {
  let streak = 0;
  for (let i = session.answers.length - 1; i >= 0; i--) {
    if (!session.answers[i].correct) break;
    streak++;
  }
  return streak;
}

export function QuizScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { moduleId } = route.params;
  const mod = modules.find((m) => m.id === moduleId)!;
  const accent = accentColorFor(moduleId);

  const [session, setSession] = useState<QuizSession | null>(null);

  useEffect(() => {
    (async () => {
      const missHistory = await loadMissHistory();
      setSession(startSession(mod, 10, missHistory));
    })();
  }, []);

  useEffect(() => {
    if (session) { saveSession(session.moduleId, session); }
  }, [session]);

  const handleAnswer = useCallback((optionId: string) => {
    setSession((s) => {
      if (!s) return s;
      const current = s.questions[s.currentIndex];
      const next = submitAnswer(s, optionId);
      const answer = next.answers.find((a) => a.questionId === current.id);
      if (answer?.correct) clearMiss(current.id);
      else if (answer) recordMiss(current.id);
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    setSession((s) => {
      if (!s) return s;
      if (s.currentIndex < s.questions.length - 1) return advance(s);
      clearSession();
      navigation.replace("Result", { moduleId: s.moduleId, score: getScore(s), total: s.questions.length });
      return s;
    });
  }, [navigation]);

  const handleExit = useCallback(() => {
    const doExit = () => { clearSession(); navigation.goBack(); };
    if (Platform.OS === "web") {
      if (confirm("Sair agora? O progresso desta sessão será perdido.")) doExit();
    } else {
      Alert.alert("Sair do quiz?", "O progresso desta sessão será perdido.", [
        { text: "Continuar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: doExit },
      ]);
    }
  }, [navigation]);

  if (!session) return <View style={styles.screen} />;

  const q = session.questions[session.currentIndex];
  const currentAnswer = session.answers.find((a) => a.questionId === q.id);
  const answered = currentAnswer !== undefined;
  const isCorrect = answered && currentAnswer.correct;
  const score = getScore(session);
  const streak = currentStreak(session);

  const getState = (optionId: string): TileState => {
    if (!answered) return "idle";
    if (optionId === q.correctOptionId) return "correct";
    if (optionId === currentAnswer!.selectedOptionId) return "wrong";
    return "neutral";
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Progress pips */}
      <View style={styles.pipsSection}>
        <View style={styles.pipsHeader}>
          <Text style={styles.pipsLabel}>Pergunta {session.currentIndex + 1} de {session.questions.length}</Text>
          <Pressable onPress={handleExit} style={styles.exitBtn} accessibilityLabel="Sair do quiz">
            <GlyphIcon name="x" size={13} color={colors.albaMuted} />
          </Pressable>
        </View>
        <View style={styles.pipsRow}>
          {session.questions.map((question, i) => {
            const r = session.answers.find((a) => a.questionId === question.id);
            const isCurrent = i === session.currentIndex && !answered;
            let bg = colors.sanctumLight;
            if (r?.correct === true) bg = colors.viridis;
            else if (r?.correct === false) bg = colors.rubrum;
            else if (isCurrent) bg = accent;
            return <View key={question.id} style={[styles.pip, { backgroundColor: bg }]} />;
          })}
        </View>
      </View>

      {/* Question + tiles */}
      <ScrollView style={styles.questionArea} contentContainerStyle={styles.questionContent}>
        {q.image && (
          <View style={styles.imageBox}>
            <Image source={{ uri: q.image.src }} style={styles.image} resizeMode="contain" accessibilityLabel={q.image.alt} />
          </View>
        )}
        <Text style={styles.prompt}>{q.prompt}</Text>

        <View style={styles.tilesRow}>
          {q.options.slice(0, 2).map((opt, i) => renderTile(opt, TILE_STYLES[i], getState(opt.id), answered, handleAnswer))}
        </View>
        <View style={styles.tilesRow}>
          {q.options.slice(2, 4).map((opt, i) => renderTile(opt, TILE_STYLES[i + 2], getState(opt.id), answered, handleAnswer))}
        </View>
      </ScrollView>

      {/* Feedback footer */}
      {answered && (
        <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
          <View style={[styles.badge, { backgroundColor: isCorrect ? "rgba(34,184,122,0.14)" : "rgba(224,72,63,0.14)" }]}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: isCorrect ? colors.viridis : colors.rubrum }}>
              {isCorrect ? "Correto!" : "Ops!"}
            </Text>
            {isCorrect && streak >= 2 && <Text style={{ fontSize: 13, fontWeight: "800", color: colors.gold }}>🔥 {streak}x</Text>}
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.albaMuted }}>
              Pontuação: <Text style={{ color: accent, fontWeight: "800" }}>{score}</Text>
            </Text>
          </View>
          <Pressable style={[styles.nextBtn, { backgroundColor: accent }]} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {session.currentIndex < session.questions.length - 1 ? "Próxima →" : "Ver Resultado"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function renderTile(
  opt: { id: string; label: string; image?: { src: string; alt: string } },
  tile: { color: string; mark: GlyphName },
  state: TileState,
  answered: boolean,
  onPress: (id: string) => void,
) {
  const isWrong = state === "wrong";
  const isCorrect = state === "correct";
  const isDimmed = state === "neutral";
  return (
    <Pressable
      key={opt.id}
      style={[
        styles.tile,
        { backgroundColor: isWrong ? "#E4D9BE" : tile.color, opacity: isDimmed ? 0.4 : 1 },
        isCorrect && styles.tileCorrect,
      ]}
      disabled={answered}
      onPress={() => onPress(opt.id)}
      accessibilityLabel={opt.label}
    >
      <View style={[styles.tileIcon, { backgroundColor: isWrong ? "rgba(36,26,69,0.06)" : "rgba(255,255,255,0.24)" }]}>
        <GlyphIcon name={tile.mark} size={18} color={isWrong ? colors.albaMuted : "#FFFFFF"} />
      </View>
      {opt.image && <Image source={{ uri: opt.image.src }} style={styles.tileImg} resizeMode="cover" />}
      <Text style={[styles.tileLabel, isWrong && { color: colors.albaMuted }]} numberOfLines={3}>{opt.label}</Text>
      {(isCorrect || isWrong) && (
        <View style={[styles.tileBadge, { backgroundColor: isCorrect ? colors.viridis : colors.rubrum }]}>
          <GlyphIcon name={isCorrect ? "check" : "x"} size={13} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.altar },
  pipsSection: { padding: spacing.xl, paddingBottom: spacing.sm },
  pipsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  pipsLabel: { fontSize: 11, color: colors.albaMuted, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  exitBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(36,26,69,0.06)", alignItems: "center", justifyContent: "center" },
  pipsRow: { flexDirection: "row", gap: 5 },
  pip: { flex: 1, height: 7, borderRadius: radius.pill },
  questionArea: { flex: 1 },
  questionContent: { padding: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg, flexGrow: 1, justifyContent: "flex-end" },
  imageBox: { flex: 1, width: "100%", backgroundColor: colors.sanctum, borderRadius: 18, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  prompt: { fontSize: 20, fontWeight: "800", color: colors.alba, lineHeight: 28 },
  tilesRow: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, minHeight: 128, borderRadius: radius.xl, padding: 14, justifyContent: "space-between", position: "relative" },
  tileCorrect: { borderWidth: 3, borderColor: "rgba(36,26,69,0.45)" },
  tileIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  tileImg: { width: "100%", flex: 1, borderRadius: 10 },
  tileLabel: { fontSize: 15, fontWeight: "800", color: "#FFFFFF", lineHeight: 20, marginTop: spacing.sm },
  tileBadge: { position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  footer: { padding: spacing.xl, paddingTop: spacing.md, gap: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(36,26,69,0.08)" },
  badge: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: 14, paddingVertical: spacing.sm, borderRadius: radius.pill, alignSelf: "flex-start" },
  nextBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center", minHeight: 52 },
  nextBtnText: { color: "#0F0A27", fontSize: 15, fontWeight: "800" },
});
