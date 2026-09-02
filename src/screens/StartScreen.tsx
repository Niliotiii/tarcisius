import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { colors, spacing, radius } from "../theme/tokens";
import { Monstrance } from "../components/Monstrance";

type Props = NativeStackScreenProps<RootStackParamList, "Start">;

export function StartScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: spacing.xxl + insets.top, paddingBottom: spacing.xl + insets.bottom }]}>
      <View style={styles.identity}>
        <Monstrance size={160} color={colors.gold} />
        <Text style={styles.title}>Tarcisius</Text>
        <Text style={styles.subtitle}>QUIZ LITÚRGICO</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>
          Treine seu conhecimento sobre a liturgia da Igreja Católica de forma divertida.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate("Modules")}
      >
        <Text style={styles.primaryButtonText}>Escolher Módulo</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("About")}
      >
        <Text style={styles.secondaryButtonText}>Como funciona?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.altar,
    padding: spacing.xl,
  },
  identity: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 44,
    fontWeight: "800",
    fontStyle: "italic",
    color: colors.gold,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.albaMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: spacing.xs,
  },
  divider: {
    width: 36,
    height: 1,
    backgroundColor: colors.goldDim,
    opacity: 0.6,
    marginVertical: spacing.lg,
  },
  description: {
    fontSize: 14,
    color: colors.albaMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: "center",
    minHeight: 52,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: "#0F0A27",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    minHeight: 44,
  },
  secondaryButtonText: {
    color: colors.albaMuted,
    fontSize: 13,
    fontWeight: "700",
  },
});
