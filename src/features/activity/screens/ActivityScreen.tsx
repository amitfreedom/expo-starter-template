import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { PreferencesPage } from "@/features/preferences";
import { useUI } from "@/shared/theme/useUI";
export default function ActivityScreen() {
  const { c, s, t } = useUI();
  return (
    <PreferencesPage>
      <Text style={[s.eyebrow, { marginTop: 20 }]}>
        {t("ONE STEP AT A TIME")}
      </Text>
      <Text style={s.title}>{t("Your activity.")}</Text>
      <Text style={s.subtitle}>
        {t("Every little step is part of your story.")}
      </Text>
      <View
        style={[
          s.card,
          { marginTop: 30, backgroundColor: c.mint, borderWidth: 0 },
        ]}
      >
        <Feather name="trending-up" size={28} color={c.primary} />
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>
          {t("Off to a good start")}
        </Text>
        <Text style={s.subtitle}>
          {t(
            "Your account is ready to explore. This sample timeline shows where your app’s activity can live.",
          )}
        </Text>
      </View>
      <Text style={[s.sectionTitle, { marginTop: 32, marginBottom: 22 }]}>
        {t("Getting started")}
      </Text>
      {[
        {
          icon: "check-circle" as const,
          title: t("Email verified"),
          body: t("You completed the demo verification."),
        },
        {
          icon: "user-check" as const,
          title: t("You’re all set"),
          body: t("Your demo session is ready to go."),
        },
        {
          icon: "sun" as const,
          title: t("A fresh beginning"),
          body: t("Welcome to your new space."),
        },
      ].map((item, i) => (
        <View key={item.title} style={{ flexDirection: "row", gap: 17 }}>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 15,
                backgroundColor: c.mint,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name={item.icon} size={18} color={c.primary} />
            </View>
            {i < 2 && (
              <View
                style={{
                  width: 1,
                  flex: 1,
                  backgroundColor: c.border,
                  minHeight: 35,
                }}
              />
            )}
          </View>
          <View style={{ flex: 1, paddingTop: 3, paddingBottom: 30 }}>
            <Text style={{ fontSize: 15, color: c.ink, fontWeight: "600" }}>
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: c.muted,
                lineHeight: 20,
                marginTop: 7,
              }}
            >
              {item.body}
            </Text>
            <Text style={{ color: c.primary, fontSize: 10, marginTop: 9 }}>
              {t("DEMO ACTIVITY")}
            </Text>
          </View>
        </View>
      ))}
    </PreferencesPage>
  );
}
