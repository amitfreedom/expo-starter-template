import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Button } from "@/shared/components/Button";
import { PreferencesPage, PreferencesPanel } from "@/features/preferences";
import { useUI } from "@/shared/theme/useUI";
import { useAuth } from "@/features/auth";
export default function ProfileScreen() {
  const { c, s, t } = useUI();
  const { user, signOut } = useAuth();
  const [showInfo, setShowInfo] = useState(false);
  return (
    <PreferencesPage showPreferences={false}>
      <Text style={[s.eyebrow, { marginTop: 20 }]}>
        {t("YOUR OWN LITTLE CORNER")}
      </Text>
      <Text style={s.title}>{t("Your profile.")}</Text>
      <Text style={s.subtitle}>
        {t("The details that make this space yours.")}
      </Text>
      <View
        style={[
          s.card,
          { marginTop: 30, alignItems: "center", paddingVertical: 32 },
        ]}
      >
        <View
          style={{
            width: 82,
            height: 82,
            borderRadius: 28,
            backgroundColor: c.mint,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: c.primary, fontSize: 28, fontWeight: "600" }}>
            {user?.name.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={[s.sectionTitle, { marginTop: 18 }]}>{user?.name}</Text>
        <Text style={{ color: c.muted, fontSize: 13, marginTop: 8 }}>
          {user?.email}
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 5,
            alignItems: "center",
            backgroundColor: c.mint,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 20,
            marginTop: 18,
          }}
        >
          <Feather name="check-circle" size={12} color={c.primary} />
          <Text style={{ fontSize: 10, color: c.primary, fontWeight: "600" }}>
            {t("Verified demo account")}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: 24 }}>
        <PreferencesPanel />
      </View>
      <Text style={[s.sectionTitle, { marginTop: 30, marginBottom: 15 }]}>
        {t("Account details")}
      </Text>
      <View style={[s.card, { gap: 20 }]}>
        <View style={s.row}>
          <Text style={{ color: c.muted, fontSize: 13 }}>{t("Full name")}</Text>
          <Text
            style={{
              color: c.ink,
              fontSize: 13,
              flexShrink: 1,
              marginLeft: 20,
            }}
          >
            {user?.name}
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: c.border }} />
        <View style={{ gap: 8 }}>
          <Text style={{ color: c.muted, fontSize: 13 }}>
            {t("Email address")}
          </Text>
          <Text style={{ color: c.ink, fontSize: 13 }}>{user?.email}</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showInfo }}
        onPress={() => setShowInfo(!showInfo)}
        style={[s.card, { marginTop: 15 }]}
      >
        <View style={s.row}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Feather name="info" size={18} color={c.primary} />
            <Text style={{ color: c.ink, fontSize: 13 }}>
              {t("About this template")}
            </Text>
          </View>
          <Feather
            name={showInfo ? "chevron-up" : "chevron-down"}
            size={16}
            color={c.muted}
          />
        </View>
        {showInfo && (
          <Text style={s.subtitle}>
            {t(
              "Nest is an Expo starter with splash, login, signup, OTP verification, and bottom navigation. Authentication is simulated. Sessions reset when the app reloads.",
            )}
          </Text>
        )}
      </Pressable>
      <View style={{ marginTop: 28 }}>
        <Button title={t("Log out")} secondary onPress={signOut} />
      </View>
      <Text
        style={{
          color: c.muted,
          fontSize: 10,
          textAlign: "center",
          marginTop: 25,
        }}
      >
        {t("NEST · EXPO STARTER · V1.0.0")}
      </Text>
    </PreferencesPage>
  );
}
