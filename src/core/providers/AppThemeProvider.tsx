import { type ReactNode, useEffect, useMemo } from "react";
import { ThemeProvider, DefaultTheme, DarkTheme } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { Platform } from "react-native";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { ready, colors: c, resolvedTheme, language } = usePreferences();
  const navigationTheme = useMemo(() => {
    const base = resolvedTheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: c.background,
        card: c.surface,
        text: c.ink,
        border: c.border,
        primary: c.primary,
        notification: c.danger,
      },
    };
  }, [c, resolvedTheme]);
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  useEffect(() => {
    if (!ready) return;
    if (Platform.OS === "web") {
      document.documentElement.lang = language;
      document.documentElement.style.colorScheme = resolvedTheme;
      document.documentElement.style.backgroundColor = c.background;
    } else {
      SystemUI.setBackgroundColorAsync(c.background).catch(() => {});
    }
  }, [c.background, language, ready, resolvedTheme]);
  if (!ready) return null;
  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      {children}
    </ThemeProvider>
  );
}
