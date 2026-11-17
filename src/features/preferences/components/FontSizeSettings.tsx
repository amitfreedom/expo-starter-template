import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
import {
  DEFAULT_FONT_SCALE,
  FONT_SCALE_STEP,
  FONT_SIZE_OPTIONS,
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
} from "@/shared/theme/font-scale";
export function FontSizeSettings() {
  const { colors: c, fontScale, setFontScale, t } = usePreferences();
  return (
    <View style={{ gap: 12 }}>
      <AppText variant="label">{t("Font size")}</AppText>
      <AppText variant="caption" color="muted">
        {t("Adjust text size across the app.")}
      </AppText>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t("Font size")}
        style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
      >
        {FONT_SIZE_OPTIONS.map((option) => {
          const selected = fontScale === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={t(option.label)}
              accessibilityState={{ checked: selected }}
              aria-checked={selected}
              onPress={() => setFontScale(option.value)}
              style={{
                flexBasis: "45%",
                flexGrow: 1,
                minHeight: 48,
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selected ? c.primary : c.border,
                backgroundColor: selected ? c.mint : c.background,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <AppText
                variant="caption"
                weight={selected ? "bold" : "medium"}
                color={selected ? "primary" : "ink"}
                style={{ flexShrink: 1, textAlign: "center" }}
              >
                {t(option.label)}
              </AppText>
              {selected && <Feather name="check" size={12} color={c.primary} />}
            </Pressable>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Button
          title="−"
          accessibilityLabel={t("Decrease font size")}
          size="sm"
          fullWidth={false}
          variant="outline"
          disabled={fontScale <= MIN_FONT_SCALE}
          onPress={() => setFontScale((current) => current - FONT_SCALE_STEP)}
        />
        <AppText
          variant="bodySmall"
          weight="semibold"
          accessibilityLiveRegion="polite"
          role="status"
        >
          {Math.round(fontScale * 100)}%
        </AppText>
        <Button
          title="+"
          accessibilityLabel={t("Increase font size")}
          size="sm"
          fullWidth={false}
          variant="outline"
          disabled={fontScale >= MAX_FONT_SCALE}
          onPress={() => setFontScale((current) => current + FONT_SCALE_STEP)}
        />
      </View>
      <View
        style={{
          backgroundColor: c.background,
          borderRadius: 12,
          padding: 12,
          gap: 6,
        }}
      >
        <AppText variant="caption" color="muted">
          {t("Font preview")}
        </AppText>
        <AppText testID="font-size-preview">{t("Make room to grow.")}</AppText>
      </View>
      <Button
        title={t("Reset to default")}
        variant="ghost"
        size="sm"
        disabled={fontScale === DEFAULT_FONT_SCALE}
        onPress={() => setFontScale(DEFAULT_FONT_SCALE)}
      />
    </View>
  );
}
