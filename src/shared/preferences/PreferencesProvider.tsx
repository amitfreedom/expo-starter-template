import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, type Palette } from "@/shared/theme/palettes";
import {
  translate,
  type Language,
  type MessageKey,
} from "@/shared/i18n/messages";
import { type ThemeMode } from "./types";
import {
  DEFAULT_PREFERENCES,
  readPreferences,
  writePreferences,
} from "./preferences-storage";
type Preferences = {
  themeMode: ThemeMode;
  language: Language;
  resolvedTheme: "light" | "dark";
  colors: Palette;
  ready: boolean;
  storageError: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
};
const PreferencesContext = createContext<Preferences | null>(null);
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    DEFAULT_PREFERENCES.themeMode,
  );
  const [language, setLanguage] = useState<Language>(
    DEFAULT_PREFERENCES.language,
  );
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    readPreferences()
      .then((preferences) => {
        if (!active) return;
        setThemeMode(preferences.themeMode);
        setLanguage(preferences.language);
      })
      .catch(() => {
        if (active) setStorageError(true);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    // Serialize writes so rapid changes cannot restore an older selection.
    writes.current = writes.current
      .then(() => writePreferences({ themeMode, language }))
      .then(() => setStorageError(false))
      .catch(() => setStorageError(true));
  }, [themeMode, language, ready]);
  const resolvedTheme =
    themeMode === "system"
      ? systemTheme === "dark"
        ? "dark"
        : "light"
      : themeMode;
  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  );
  return (
    <PreferencesContext.Provider
      value={{
        themeMode,
        language,
        resolvedTheme,
        colors: resolvedTheme === "dark" ? darkColors : lightColors,
        ready,
        storageError,
        setThemeMode,
        setLanguage,
        t,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences requires PreferencesProvider");
  return value;
}
