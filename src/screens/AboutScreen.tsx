import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { modules } from "../data/modules";
import { colors, spacing, radius, accentColorFor } from "../theme/tokens";
import { GlyphIcon, type GlyphName } from "../components/GlyphIcon";
import { ScreenHeader } from "../components/ScreenHeader";

type Props = NativeStackScreenProps<RootStackParamList, "About">;

const TILE_STYLES: { color: string; mark: GlyphName }[] = [
  { color: "#DE9A1F", mark: "star" },
  { color: "#7C3AED", mark: "dot" },
  { color: "#0891B2", mark: "triangle" },
  { color: "#EA580C", mark: "cross" },
];

const HOW_IT_WORKS_STEPS = [
  "Cada sessão sorteia 10 perguntas do banco do módulo escolhido.",
  "Toque numa alternativa e veja na hora se acertou — sem espera.",
  "Ao final você recebe uma pontuação e um título de acordo com seu desempenho.",
  "Jogue de novo para pegar um conjunto novo de perguntas do mesmo módulo.",
];

export function AboutScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const availableModules = modules.filter((m) => m.status === "available");

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: spacing.xl + insets.top, paddingBottom: spacing.xxl + insets.bottom }]}
    >
      <ScreenHeader
        title="Como funciona"
        subtitle="As regras do jogo, em poucas linhas"
        backLabel="Início"
        onBack={() => navigation.goBack()}
      />

      {HOW_IT_WORKS_STEPS.map((text, i) => {
        const tile = TILE_STYLES[i % TILE_STYLES.length];
        return (
          <View key={i} style={styles.stepCard}>
            <View style={[styles.stepIcon, { backgroundColor: tile.color }]}>
              <GlyphIcon name={tile.mark} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.stepText}>{text}</Text>
          </View>
        );
      })}

      <Text style={styles.sectionLabel}>Módulos ativos</Text>

      {availableModules.map((mod) => {
        const accent = accentColorFor(mod.id);
        return (
          <View key={mod.id} style={styles.moduleCard}>
            <Text style={styles.moduleTitle}>{mod.title}</Text>
            <View style={[styles.moduleBadge, { backgroundColor: accent + "18" }]}>
              <Text style={[styles.moduleBadgeText, { color: accent }]}>
                {mod.questions.length} perguntas
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.altar },
  content: { padding: spacing.xl, gap: spacing.md },
  stepCard: {
    backgroundColor: colors.sanctum,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { flex: 1, fontSize: 14, color: colors.alba, lineHeight: 20, fontWeight: "600" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.albaMuted,
    marginTop: spacing.lg,
  },
  moduleCard: {
    backgroundColor: colors.sanctum,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  moduleTitle: { fontSize: 14, fontWeight: "800", color: colors.alba, flexShrink: 1 },
  moduleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  moduleBadgeText: { fontSize: 11, fontWeight: "700" },
});
