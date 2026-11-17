import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
import { createStyles } from "./styles";
export function useUI() {
  const preferences = usePreferences();
  const { width } = useWindowDimensions();
  const c = preferences.colors;
  const styles = useMemo(
    () => createStyles(c, preferences.language, width),
    [c, preferences.language, width],
  );
  return { ...preferences, c, s: styles };
}
