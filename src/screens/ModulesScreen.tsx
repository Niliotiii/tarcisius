import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { modules } from "../data/modules";
import type { Module } from "../types/quiz";
import { colors, spacing, radius, accentColorFor } from "../theme/tokens";
import { GlyphIcon, type GlyphName } from "../components/GlyphIcon";
import { ScreenHeader } from "../components/ScreenHeader";

type Props = NativeStackScreenProps<RootStackParamList, "Modules">;

const MODULE_GLYPHS: GlyphName[] = ["star", "dot", "triangle", "cross"];

export function ModulesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const handleSelect = (mod: Module) => {
    navigation.navigate("Quiz", { moduleId: mod.id });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: spacing.xl + insets.top, paddingBottom: spacing.xxl + insets.bottom }]}
    >
      <ScreenHeader
        title="Módulos"
        subtitle="Escolha um tema para estudar"
        backLabel="Início"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.row}>
        {modules.slice(0, 2).map((mod, idx) => (
          <ModuleCard key={mod.id} mod={mod} glyph={MODULE_GLYPHS[idx]} onSelect={handleSelect} />
        ))}
      </View>
      <View style={styles.row}>
        {modules.slice(2, 4).map((mod, idx) => (
          <ModuleCard key={mod.id} mod={mod} glyph={MODULE_GLYPHS[idx + 2]} onSelect={handleSelect} />
        ))}
      </View>
    </ScrollView>
  );
}

function ModuleCard({ mod, glyph, onSelect }: { mod: Module; glyph: GlyphName; onSelect: (m: Module) => void }) {
  const locked = mod.status === "locked";
  const accent = accentColorFor(mod.id);

  if (locked) {
    return (
      <View style={styles.lockedCard}>
        <View style={styles.lockedIcon}>
          <GlyphIcon name="lock" size={16} color={colors.albaMuted} />
        </View>
        <View>
          <Text style={styles.lockedLabel}>Em breve</Text>
          <Text style={styles.lockedTitle}>{mod.title}</Text>
          <Text style={styles.lockedDescription} numberOfLines={2}>{mod.description}</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.moduleCard, { backgroundColor: accent }, pressed && { opacity: 0.9 }]}
      onPress={() => onSelect(mod)}
    >
      <View style={styles.moduleIcon}>
        <GlyphIcon name={glyph} size={17} color="#FFFFFF" />
      </View>
      <View>
        <Text style={styles.moduleTitle}>{mod.title}</Text>
        <Text style={styles.moduleDescription} numberOfLines={3}>{mod.description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.altar },
  content: { padding: spacing.xl, gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  moduleCard: {
    flex: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: "space-between",
  },
  moduleIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleTitle: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 },
  moduleDescription: { fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 17 },
  lockedCard: {
    flex: 1,
    backgroundColor: colors.sanctumLight,
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: "space-between",
    opacity: 0.7,
  },
  lockedIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(36,26,69,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockedLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", color: colors.albaMuted, marginBottom: 4 },
  lockedTitle: { fontSize: 15, fontWeight: "800", color: colors.albaMuted, marginBottom: 4 },
  lockedDescription: { fontSize: 12, color: colors.albaMuted, lineHeight: 16 },
});
