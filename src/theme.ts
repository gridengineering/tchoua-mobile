export type MemberThemeId = "forest" | "midnight" | "aurora" | "ocean" | "sable" | "neon";

export type MemberTheme = {
  id: MemberThemeId;
  name: string;
  tagline: string;
  dark: boolean;
  swatches: [string, string, string];
};

export const MEMBER_THEMES: MemberTheme[] = [
  { id: "forest", name: "Forêt", tagline: "Nature & confiance", dark: false, swatches: ["#0d3d28", "#d4a343", "#f8fafc"] },
  { id: "midnight", name: "Minuit", tagline: "Sombre & focalisé", dark: true, swatches: ["#0f172a", "#38bdf8", "#8b5cf6"] },
  { id: "aurora", name: "Aurore", tagline: "Violet créatif", dark: false, swatches: ["#7c3aed", "#ec4899", "#faf7ff"] },
  { id: "ocean", name: "Océan", tagline: "Bleu analytique", dark: false, swatches: ["#0369a1", "#06b6d4", "#f2f9fd"] },
  { id: "sable", name: "Sable", tagline: "Chaleur terre", dark: false, swatches: ["#b45309", "#d97706", "#fdf8f0"] },
  { id: "neon", name: "Néon", tagline: "Cyber & contraste", dark: true, swatches: ["#a3e635", "#f0abfc", "#07070c"] },
];

export const DEFAULT_MEMBER_THEME: MemberThemeId = "forest";

export function isMemberTheme(value: unknown): value is MemberThemeId {
  return typeof value === "string" && MEMBER_THEMES.some((t) => t.id === value);
}

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  terracotta: string;
  background: string;
  surface: string;
  text: string;
  white: string;
  black: string;
  gray: string;
  lightGray: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  dark: boolean;
}

const BASE_PALETTE = {
  terracotta: "#7c2d12",
  white: "#ffffff",
  black: "#1a1a1a",
  gray: "#6b7280",
  lightGray: "#e5e7eb",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
};

const THEME_PALETTES: Record<MemberThemeId, ThemeColors> = {
  forest: {
    ...BASE_PALETTE,
    primary: "#0d3d28",
    primaryLight: "#1a5c3a",
    secondary: "#e68a00",
    background: "#fdfcf9",
    surface: "#ffffff",
    text: "#1a1a1a",
    dark: false,
  },
  midnight: {
    ...BASE_PALETTE,
    primary: "#0f172a",
    primaryLight: "#1e293b",
    secondary: "#38bdf8",
    background: "#0b1120",
    surface: "#1e293b",
    text: "#f8fafc",
    gray: "#94a3b8",
    lightGray: "#334155",
    dark: true,
  },
  aurora: {
    ...BASE_PALETTE,
    primary: "#7c3aed",
    primaryLight: "#8b5cf6",
    secondary: "#ec4899",
    background: "#faf7ff",
    surface: "#ffffff",
    text: "#1e1b4b",
    dark: false,
  },
  ocean: {
    ...BASE_PALETTE,
    primary: "#0369a1",
    primaryLight: "#0284c7",
    secondary: "#06b6d4",
    background: "#f2f9fd",
    surface: "#ffffff",
    text: "#0c4a6e",
    dark: false,
  },
  sable: {
    ...BASE_PALETTE,
    primary: "#b45309",
    primaryLight: "#d97706",
    secondary: "#e68a00",
    background: "#fdf8f0",
    surface: "#ffffff",
    text: "#451a03",
    dark: false,
  },
  neon: {
    ...BASE_PALETTE,
    primary: "#18181b",
    primaryLight: "#27272a",
    secondary: "#a3e635",
    background: "#07070c",
    surface: "#18181b",
    text: "#fafafa",
    gray: "#a1a1aa",
    lightGray: "#27272a",
    dark: true,
  },
};

export function getThemeColors(themeId: MemberThemeId = DEFAULT_MEMBER_THEME): ThemeColors {
  return THEME_PALETTES[themeId] ?? THEME_PALETTES.forest;
}

export const COLORS = THEME_PALETTES.forest;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SHADOW = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
};
