import { type Language } from "@/shared/i18n/messages";
export type ThemeMode = "light" | "dark" | "system";
export type StoredPreferences = { themeMode: ThemeMode; language: Language };
