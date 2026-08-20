export const colors = {
  altar: "#F7F1E3",
  sanctum: "#FFFFFF",
  sanctumLight: "#ECE2CC",
  gold: "#E8B84B",
  goldDim: "#A07E2A",
  violet: "#9B6EF3",
  violetDim: "#6B4AB3",
  rubrum: "#E0483F",
  viridis: "#22B87A",
  alba: "#241A45",
  albaMuted: "#6B6089",
  cyan: "#5EC8E0",

  modules: {
    "objetos-liturgicos": "#E8B84B",
    "vestes-liturgicas-insignias": "#9B6EF3",
    "tempos-liturgicos": "#4ADE80",
    "estrutura-partes-missa": "#5EC8E0",
  } as Record<string, string>,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 14, lg: 16, xl: 20, pill: 999 };

export const type = {
  display: { fontSize: 38, fontWeight: "800" as const },
  title: { fontSize: 26, fontWeight: "800" as const },
  body: { fontSize: 15, lineHeight: 22 },
  small: { fontSize: 13, color: colors.albaMuted },
  label: { fontSize: 12, fontWeight: "700" as const, letterSpacing: 0.8 },
};

export const motion = { fast: 150, medium: 250, slow: 350 };

export function accentColorFor(moduleId: string): string {
  return colors.modules[moduleId] ?? colors.gold;
}
