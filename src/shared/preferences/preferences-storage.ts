import AsyncStorage from "@react-native-async-storage/async-storage";
import { type StoredPreferences } from "./types";
const STORAGE_KEY = "@nest/preferences/v1";
export const DEFAULT_PREFERENCES: StoredPreferences = {
  themeMode: "system",
  language: "en",
};
export async function readPreferences(): Promise<StoredPreferences> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_PREFERENCES };
  const saved: unknown = JSON.parse(raw);
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
  };
}
export function writePreferences(
  preferences: StoredPreferences,
): Promise<void> {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
