import { FontSizeSettings } from "./FontSizeSettings";
import { AppText as Text } from "@/shared/components/AppText";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useUI } from "@/shared/theme/useUI";
export function PreferencesPanel({
  collapsible = false,
}: {
  collapsible?: boolean;
}) {
  const {
    c,
    s,
    t,
    themeMode,
    language,
    setThemeMode,
    setLanguage,
    storageError,
  } = useUI();
  const [expanded, setExpanded] = useState(!collapsible);
  return (
    <View style={[s.card, { gap: 18 }]}>
      {collapsible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Theme and language")}
          accessibilityState={{ expanded }}
          onPress={() => setExpanded(!expanded)}
          style={[s.row, { minHeight: 28, gap: 12 }]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              flex: 1,
            }}
          >
            <Feather name="sliders" size={18} color={c.primary} />
            <Text style={[s.label, { flexShrink: 1 }]}>
              {t("Theme and language")}
            </Text>
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={c.muted}
          />
        </Pressable>
      ) : (
        <Text style={s.sectionTitle}>{t("Preferences")}</Text>
      )}
      {expanded && (
        <>
          <View style={{ gap: 8 }}>
            <Text style={s.label}>{t("Appearance")}</Text>
            <Text style={{ fontSize: 12, color: c.muted, lineHeight: 20 }}>
              {t("Choose how Nest looks.")}
            </Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel={t("Appearance")}
              style={{ flexDirection: "row", gap: 8 }}
            >
              {(
                [
                  { value: "light", label: "Light", icon: "sun" },
                  { value: "dark", label: "Dark", icon: "moon" },
                  { value: "system", label: "System", icon: "monitor" },
                ] as const
              ).map((option) => {
                const selected = themeMode === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityLabel={t(option.label)}
                    accessibilityState={{ checked: selected }}
                    onPress={() => setThemeMode(option.value)}
                    style={{
                      flex: 1,
                      minHeight: 82,
                      borderRadius: 13,
                      paddingVertical: 13,
                      paddingHorizontal: 5,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 9,
                      backgroundColor: selected ? c.mint : c.background,
                      borderWidth: 1,
                      borderColor: selected ? c.primary : c.border,
                    }}
                  >
                    <Feather
                      name={option.icon}
                      size={19}
                      color={selected ? c.primary : c.muted}
                    />
                    <Text
                      style={{
                        color: selected ? c.primary : c.ink,
                        fontSize: 12,
                        lineHeight: 19,
                        fontWeight: selected ? "700" : "500",
                      }}
                    >
                      {t(option.label)}
                    </Text>
                    {selected && (
                      <Feather
                        name="check"
                        size={10}
                        color={c.primary}
                        style={{ position: "absolute", right: 5, top: 5 }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ color: c.muted, fontSize: 11, lineHeight: 19 }}>
              {t("System follows your device appearance.")}
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: c.border }} />
          <View style={{ gap: 9 }}>
            <Text style={s.label}>{t("Language")}</Text>
            <Text style={{ fontSize: 12, color: c.muted, lineHeight: 20 }}>
              {t("Choose your preferred language.")}
            </Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel={t("Language")}
              style={{ flexDirection: "row", gap: 8 }}
            >
              {(
                [
                  { value: "en", label: "English" },
                  { value: "hi", label: "हिन्दी" },
                ] as const
              ).map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ checked: language === option.value }}
                  onPress={() => setLanguage(option.value)}
                  style={{
                    flex: 1,
                    minHeight: 50,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 9,
                    padding: 10,
                    borderRadius: 12,
                    backgroundColor:
                      language === option.value ? c.mint : c.background,
                    borderWidth: 1,
                    borderColor:
                      language === option.value ? c.primary : c.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      flexShrink: 1,
                      minWidth: 0,
                      color: language === option.value ? c.primary : c.ink,
                      fontWeight: language === option.value ? "700" : "500",
                    }}
                  >
                    {option.label}
                  </Text>
                  {language === option.value && (
                    <Feather name="check" size={14} color={c.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: c.border }} />
          <FontSizeSettings />
          <Text
            accessibilityRole={storageError ? "alert" : undefined}
            style={{
              color: storageError ? c.danger : c.muted,
              fontSize: 11,
              lineHeight: 19,
            }}
          >
            {t(
              storageError
                ? "Could not save preferences. Changes apply for this session."
                : "Preferences are saved on this device.",
            )}
          </Text>
        </>
      )}
    </View>
  );
}
