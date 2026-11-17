import { GettingStartedChecklist } from "../components/GettingStartedChecklist";
import { WelcomeCard } from "../components/WelcomeCard";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Brand } from "@/shared/components/Brand";
import { PreferencesPage } from "@/features/preferences";
import { useUI } from "@/shared/theme/useUI";
import { useAuth } from "@/features/auth";
export default function HomeScreen() {
  const { c, s, t } = useUI();
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("Good morning")
      : hour < 18
        ? t("Good afternoon")
        : t("Good evening");
  return (
    <PreferencesPage>
      <View style={s.row}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("View your profile")}
          onPress={() => router.navigate("/profile")}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: c.mint,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: c.primary, fontWeight: "700" }}>
            {user?.name.slice(0, 2).toUpperCase()}
          </Text>
        </Pressable>
      </View>
      <View style={{ marginTop: 35, marginBottom: 27 }}>
        <Text style={s.eyebrow}>{t("YOUR EVERYDAY, A LITTLE BETTER")}</Text>
        <Text style={[s.title, { fontSize: 30 }]}>
          {greeting},{"\n"}
          {user?.name.split(" ")[0] || t("friend")}{" "}
          <Text style={{ color: c.primary }}>✦</Text>
        </Text>
        <Text style={s.subtitle}>{t("A new day. A little room to grow.")}</Text>
      </View>
      <WelcomeCard />
      <View style={{ marginTop: 28, gap: 15 }}>
        <Text style={s.sectionTitle}>{t("Make it yours")}</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate("/activity")}
            style={[s.card, { flex: 1, padding: 18 }]}
          >
            <Feather name="activity" size={22} color={c.primary} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: c.ink,
                marginTop: 18,
              }}
            >
              {t("Your activity")}
            </Text>
            <Text style={{ fontSize: 11, color: c.muted, marginTop: 7 }}>
              {t("See your journey ↗")}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate("/profile")}
            style={[s.card, { flex: 1, padding: 18 }]}
          >
            <Feather name="sliders" size={22} color={c.primary} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: c.ink,
                marginTop: 18,
              }}
            >
              {t("Your account")}
            </Text>
            <Text style={{ fontSize: 11, color: c.muted, marginTop: 7 }}>
              {t("The little details ↗")}
            </Text>
          </Pressable>
        </View>
      </View>
      <GettingStartedChecklist />
      <View style={{ alignItems: "center", marginTop: 32 }}>
        <Text style={{ fontSize: 10, color: c.muted, letterSpacing: 1 }}>
          {t("SMALL STEPS. GOOD THINGS.")}
        </Text>
      </View>
    </PreferencesPage>
  );
}
