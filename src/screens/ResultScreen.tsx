import React, { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { getRank } from "../lib/ranking";
import { buildShareText, shareResult } from "../lib/share";
import { colors, spacing, radius, accentColorFor } from "../theme/tokens";
import { StarIcon } from "../components/StarIcon";
import Svg, { Circle } from "react-native-svg";

type Props = NativeStackScreenProps<RootStackParamList, "Result">;

export function ResultScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { moduleId, score, total } = route.params;
  const accent = accentColorFor(moduleId);
  const rank = getRank(score);
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied">("idle");

  const pct = Math.round((score / total) * 100);
  const ringR = 54;
  const circ = 2 * Math.PI * ringR;
  const offset = circ - (pct / 100) * circ;

  const handleShare = useCallback(async () => {
    const text = buildShareText(score, total, rank.title);
    const result = await shareResult(text);
    if (result !== "unavailable") {
      setShareState(result);
      setTimeout(() => setShareState("idle"), 2500);
    }
  }, [score, total, rank.title]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: spacing.xxl + insets.top, paddingBottom: spacing.xl + insets.bottom }]}
    >
      {/* Score ring */}
      <View style={styles.ringWrap}>
        <Svg width={130} height={130} viewBox="0 0 130 130">
          <Circle cx={65} cy={65} r={ringR} stroke={colors.sanctumLight} strokeWidth={10} fill="none" />
          <Circle cx={65} cy={65} r={ringR} stroke={accent} strokeWidth={10} fill="none"
            strokeLinecap="round" strokeDasharray={`${circ}`} strokeDashoffset={offset}
            rotation={-90} origin="65, 65" />
        </Svg>
        <View style={styles.ringLabel}>
          <Text style={[styles.scoreNum, { color: accent }]}>{score}</Text>
          <Text style={styles.scoreTotal}>de {total}</Text>
        </View>
      </View>

      {/* Stars */}
      <View style={styles.starsRow}>
        {[1, 2, 3].map((s) => <StarIcon key={s} filled={s <= rank.stars} />)}
      </View>

      {/* Rank card */}
      <View style={[styles.rankCard, { borderColor: accent + "30" }]}>
        <Text style={[styles.rankLabel, { color: accent }]}>Seu Título</Text>
        <Text style={styles.rankTitle}>{rank.title}</Text>
        <Text style={styles.rankDesc}>{rank.description}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: colors.viridis }]}>{score}</Text>
          <Text style={styles.statLbl}>Acertos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statVal, { color: colors.rubrum }]}>{total - score}</Text>
          <Text style={styles.statLbl}>Erros</Text>
        </View>
      </View>

      {/* Actions */}
      <Pressable style={[styles.primaryBtn, { backgroundColor: accent }]} onPress={() => navigation.replace("Quiz", { moduleId })}>
        <Text style={styles.primaryBtnText}>Jogar Novamente</Text>
      </Pressable>

      <Pressable style={styles.outlineBtn} onPress={() => navigation.navigate("Modules")}>
        <Text style={styles.outlineBtnText}>Trocar de Módulo</Text>
      </Pressable>

      <Pressable style={styles.textBtn} onPress={handleShare}>
        <Text style={styles.textBtnText}>
          {shareState === "idle" ? "Compartilhar resultado" : shareState === "shared" ? "Compartilhado!" : "Copiado!"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.altar },
  content: { padding: spacing.xl, alignItems: "center" },
  ringWrap: { position: "relative", width: 130, height: 130, alignItems: "center", justifyContent: "center", marginBottom: spacing.xl },
  ringLabel: { position: "absolute", alignItems: "center" },
  scoreNum: { fontSize: 36, fontWeight: "800", fontStyle: "italic" },
  scoreTotal: { fontSize: 12, color: colors.albaMuted, fontWeight: "600" },
  starsRow: { flexDirection: "row", gap: 6, marginBottom: spacing.xl },
  rankCard: { backgroundColor: colors.sanctum, borderWidth: 1, borderRadius: radius.xl, padding: 20, alignItems: "center", width: "100%", marginBottom: spacing.lg },
  rankLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: spacing.sm },
  rankTitle: { fontSize: 24, fontWeight: "800", fontStyle: "italic", color: colors.alba, marginBottom: spacing.md, textAlign: "center" },
  rankDesc: { fontSize: 14, color: colors.albaMuted, lineHeight: 21, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: spacing.md, width: "100%", marginBottom: spacing.xl },
  statCard: { flex: 1, backgroundColor: colors.sanctum, borderRadius: 14, padding: spacing.lg, alignItems: "center" },
  statVal: { fontSize: 32, fontWeight: "800", fontStyle: "italic" },
  statLbl: { fontSize: 12, color: colors.albaMuted, fontWeight: "600", marginTop: spacing.xs },
  primaryBtn: { width: "100%", paddingVertical: spacing.lg, borderRadius: radius.lg, alignItems: "center", minHeight: 52 },
  primaryBtnText: { color: "#0F0A27", fontSize: 16, fontWeight: "800" },
  outlineBtn: { width: "100%", paddingVertical: 14, borderRadius: radius.lg, borderWidth: 1.5, borderColor: "rgba(155,110,243,0.25)", backgroundColor: colors.sanctum, alignItems: "center", minHeight: 48, marginTop: spacing.md },
  outlineBtnText: { color: colors.albaMuted, fontSize: 14, fontWeight: "700" },
  textBtn: { width: "100%", paddingVertical: spacing.md, alignItems: "center", minHeight: 48, marginTop: spacing.sm },
  textBtnText: { color: colors.albaMuted, fontSize: 13, fontWeight: "700" },
});
