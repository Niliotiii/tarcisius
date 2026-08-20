import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing } from "../theme/tokens";
import Svg, { Path } from "react-native-svg";

interface Props {
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
}

export function ScreenHeader({ title, subtitle, backLabel, onBack }: Props) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backButton} accessibilityLabel={backLabel} hitSlop={10}>
        <Svg width={9} height={14} viewBox="0 0 9 14" fill="none">
          <Path d="M7.5 1.5L2 7L7.5 12.5" stroke={colors.goldDim} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={styles.backLabel}>{backLabel}</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 10,
    minHeight: 44,
  },
  backLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.goldDim,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    fontStyle: "italic",
    color: colors.alba,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.albaMuted,
    fontWeight: "600",
    marginTop: 4,
  },
});
