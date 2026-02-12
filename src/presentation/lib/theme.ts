import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

export const THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 0%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(228 19% 14%)", // neutral-950
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(216 100% 23%)", // blue-ant-900
    primary: "hsl(216 100% 50%)", // blue-ant-700
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(218 100% 96%)", // blue-ant-100
    secondaryForeground: "hsl(228 19% 14%)", // neutral-950
    muted: "hsl(225 40% 95%)", // neutral-100
    mutedForeground: "hsl(222 12% 41%)", // neutral-800
    accent: "hsl(210 100% 98%)", // blue-ant-50
    accentForeground: "hsl(228 19% 14%)", // neutral-950
    destructive: "hsl(0 85% 61%)", // red-500
    destructiveForeground: "hsl(0 0% 100%)",
    warning: "hsl(30 100% 64%)", // orange-ant-600
    warningForeground: "hsl(0 0% 100%)",
    border: "hsl(223 33% 90%)", // neutral-300
    input: "hsl(223 33% 90%)", // neutral-300
    ring: "hsl(226 28% 76%)", // neutral-600
    radius: "0.25rem",
    chart1: "hsl(12 77% 61%)",
    chart2: "hsl(172 59% 39%)",
    chart3: "hsl(197 38% 24%)",
    chart4: "hsl(43 74% 66%)",
    chart5: "hsl(27 88% 67%)",
  },
  dark: {
    background: "hsl(228 19% 14%)", // neutral-950
    foreground: "hsl(220 100% 99%)", // neutral-50
    card: "hsl(222 22% 23%)", // neutral-900
    cardForeground: "hsl(220 100% 99%)", // neutral-50
    popover: "hsl(222 22% 23%)", // neutral-900
    popoverForeground: "hsl(220 100% 99%)", // neutral-50
    primary: "hsl(217 100% 65%)", // blue-ant-600
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(222 12% 41%)", // neutral-800
    secondaryForeground: "hsl(220 100% 99%)", // neutral-50
    muted: "hsl(222 12% 41%)", // neutral-800
    mutedForeground: "hsl(225 31% 87%)", // neutral-400
    accent: "hsl(222 12% 41%)", // neutral-800
    accentForeground: "hsl(220 100% 99%)", // neutral-50
    destructive: "hsl(0 64% 31%)", // red-900
    destructiveForeground: "hsl(0 100% 98%)", // red-50
    warning: "hsl(28 100% 70%)", // orange-ant-500
    warningForeground: "hsl(30 100% 24%)", // orange-ant-950
    border: "hsl(222 12% 41%)", // neutral-800
    input: "hsl(222 12% 41%)", // neutral-800
    ring: "hsl(217 100% 65%)", // blue-ant-600
    radius: "0.25rem",
    chart1: "hsl(220 70% 50%)",
    chart2: "hsl(160 60% 45%)",
    chart3: "hsl(30 80% 55%)",
    chart4: "hsl(280 65% 60%)",
    chart5: "hsl(340 76% 55%)",
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
