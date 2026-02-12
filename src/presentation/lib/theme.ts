import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

export const THEME = {
  light: {
    background: "hsl(40 33% 98%)", // cream-50
    foreground: "hsl(16 14% 14%)", // cream-900
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(16 14% 14%)", // cream-900
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(18 12% 21%)", // cream-800
    primary: "hsl(13 52% 40%)", // terracotta-600
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(34 22% 90%)", // cream-200
    secondaryForeground: "hsl(18 12% 21%)", // cream-800
    muted: "hsl(37 28% 95%)", // cream-100
    mutedForeground: "hsl(22 8% 40%)", // cream-600
    accent: "hsl(20 80% 97%)", // terracotta-50
    accentForeground: "hsl(16 14% 14%)", // cream-900
    destructive: "hsl(358 58% 47%)", // red-600
    destructiveForeground: "hsl(0 0% 100%)",
    warning: "hsl(33 68% 46%)", // amber-500
    warningForeground: "hsl(0 0% 100%)",
    success: "hsl(154 25% 38%)", // sage-600
    successForeground: "hsl(0 0% 100%)",
    border: "hsl(30 17% 83%)", // cream-300
    input: "hsl(30 17% 83%)", // cream-300
    ring: "hsl(16 52% 70%)", // terracotta-300
    radius: "0.25rem",
  },
  dark: {
    background: "hsl(14 16% 9%)", // cream-950
    foreground: "hsl(40 33% 98%)", // cream-50
    card: "hsl(16 14% 14%)", // cream-900
    cardForeground: "hsl(40 33% 98%)", // cream-50
    popover: "hsl(16 14% 14%)", // cream-900
    popoverForeground: "hsl(40 33% 98%)", // cream-50
    primary: "hsl(15 48% 58%)", // terracotta-400
    primaryForeground: "hsl(14 16% 9%)", // cream-950
    secondary: "hsl(18 12% 21%)", // cream-800
    secondaryForeground: "hsl(40 33% 98%)", // cream-50
    muted: "hsl(18 12% 21%)", // cream-800
    mutedForeground: "hsl(27 11% 68%)", // cream-400
    accent: "hsl(18 12% 21%)", // cream-800
    accentForeground: "hsl(40 33% 98%)", // cream-50
    destructive: "hsl(0 62% 55%)", // red-500
    destructiveForeground: "hsl(5 85% 97%)", // red-50
    warning: "hsl(35 65% 54%)", // amber-400
    warningForeground: "hsl(20 45% 13%)", // amber-950
    success: "hsl(150 18% 60%)", // sage-400
    successForeground: "hsl(162 20% 11%)", // sage-950
    border: "hsl(18 12% 21%)", // cream-800
    input: "hsl(18 12% 21%)", // cream-800
    ring: "hsl(14 50% 48%)", // terracotta-500
    radius: "0.25rem",
  },
};

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
