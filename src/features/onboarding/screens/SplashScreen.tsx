import { createStyles } from "./SplashScreen.styles";
import { router } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { Brand } from "@/shared/components/Brand";
import { Button } from "@/shared/components/Button";
import { PreferencesPage } from "@/features/preferences";
import { useUI } from "@/shared/theme/useUI";
export default function SplashScreen() {
  const { c, s, t, language } = useUI();
  const styles = useMemo(() => createStyles(c), [c]);
  return (
    <PreferencesPage>
      <Brand />
      <View style={styles.art}>
        <View style={styles.orbit} />
        <View style={styles.orbitSmall} />
        <View style={styles.leaf}>
          <Text style={styles.star}>✳</Text>
        </View>
        <View style={styles.tag}>
          <View style={styles.dot} />
          <Text style={styles.tagText}>{t("A fresh start, made simple.")}</Text>
        </View>
        <View style={styles.spark}>
          <Text style={{ color: c.primary, fontSize: 28 }}>✦</Text>
        </View>
      </View>
      <Text style={s.eyebrow}>{t("YOUR NEXT CHAPTER")}</Text>
      <Text
        style={[
          s.title,
          { fontSize: 44, lineHeight: language === "hi" ? 62 : 50 },
        ]}
      >
        {t("Good things")}
        {"\n"}
        {t("start here.")}
      </Text>
      <Text style={[s.subtitle, { maxWidth: 300 }]}>
        {t("A little space for big possibilities. Make yourself at home.")}
      </Text>
      <View style={{ gap: 17, marginTop: 34 }}>
        <Button
          title={t("Let’s get started  →")}
          onPress={() => router.push("/signup")}
        />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 5,
          }}
        >
          <Text style={{ color: c.muted, fontSize: 13 }}>
            {t("Already part of the community?")}
          </Text>
          <Text
            accessibilityRole="link"
            onPress={() => router.push("/login")}
            style={s.link}
          >
            {t("Log in")}
          </Text>
        </View>
      </View>
      <Text style={styles.footer}>{t("BUILT FOR YOUR EVERYDAY")}</Text>
    </PreferencesPage>
  );
}
