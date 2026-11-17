import {
  DEFAULT_FONT_SCALE,
  isValidFontScale,
} from "@/shared/theme/font-scale";
import { type StoredPreferences } from "./types";
export const DEFAULT_PREFERENCES: StoredPreferences = {
  themeMode: "system",
  language: "en",
  fontScale: DEFAULT_FONT_SCALE,
};
/** Preserve existing v1 theme/language settings when the font preference is absent. */
export function parseStoredPreferences(saved: unknown): StoredPreferences {
  if (typeof saved !== "object" || saved === null)
    return { ...DEFAULT_PREFERENCES };
  const prefs = saved as Record<string, unknown>;
  return {
    themeMode:
      prefs.themeMode === "light" ||
      prefs.themeMode === "dark" ||
      prefs.themeMode === "system"
        ? prefs.themeMode
        : DEFAULT_PREFERENCES.themeMode,
    language:
      prefs.language === "en" || prefs.language === "hi"
        ? prefs.language
        : DEFAULT_PREFERENCES.language,
    fontScale: isValidFontScale(prefs.fontScale)
      ? prefs.fontScale
      : DEFAULT_FONT_SCALE,
  };
}
