import { AppText as Text } from "@/shared/components/AppText";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useUI } from "@/shared/theme/useUI";
import { router } from "expo-router";
export function WelcomeCard() {
  const { c, t } = useUI();
  return (
    <View
      style={{
        backgroundColor: c.hero,
        borderRadius: 25,
        padding: 25,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          right: -25,
          top: -25,
          width: 150,
          height: 150,
          borderRadius: 75,
          borderWidth: 22,
          borderColor: "#FFFFFF0C",
        }}
      />
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        <View
          style={{
            width: 6,
            height: 6,
            backgroundColor: c.lime,
            borderRadius: 3,
          }}
        />
        <Text
          style={{
            color: c.lime,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 1.6,
          }}
        >
          {t("ALL SETTLED IN")}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 27,
          lineHeight: 34,
          fontWeight: "600",
          color: c.onHero,
          marginTop: 20,
          letterSpacing: -0.7,
        }}
      >
        {t("Your space.")}
        {"\n"}
        {t("Your possibilities.")}
      </Text>
      <Text
        style={{
          color: c.heroMuted,
          fontSize: 13,
          lineHeight: 21,
          marginTop: 10,
          maxWidth: 250,
        }}
      >
        {t("You’ve taken the first step. Let’s make the next one count.")}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.navigate("/profile")}
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          gap: 16,
          alignItems: "center",
          backgroundColor: c.lime,
          paddingVertical: 12,
          paddingHorizontal: 17,
          borderRadius: 11,
          marginTop: 22,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: c.onLime }}>
          {t("View your profile")}
        </Text>
        <Feather name="arrow-up-right" size={16} color={c.onLime} />
      </Pressable>
    </View>
  );
}
