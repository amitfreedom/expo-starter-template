import { useMemo } from "react";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
import { createStyles } from "./styles";
export function useUI() {
  const preferences = usePreferences();
  const c = preferences.colors;
  const styles = useMemo(() => {
    const base = createStyles(c);
    if (preferences.language === "en") return base;
    return {
      ...base,
      eyebrow: { ...base.eyebrow, letterSpacing: 0, lineHeight: 22 },
      title: { ...base.title, letterSpacing: 0, lineHeight: 50 },
      sectionTitle: { ...base.sectionTitle, letterSpacing: 0, lineHeight: 28 },
    };
  }, [c, preferences.language]);
  return { ...preferences, c, s: styles };
}
