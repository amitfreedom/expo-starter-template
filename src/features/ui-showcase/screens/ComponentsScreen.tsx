import { router } from "expo-router";
import { View } from "react-native";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { PreferencesPage } from "@/features/preferences";
import { useUI } from "@/shared/theme/useUI";
import { TypographyExamples } from "../components/TypographyExamples";
import { FormExamples } from "../components/FormExamples";
import { ButtonExamples } from "../components/ButtonExamples";
import { OverlayExamples } from "../components/OverlayExamples";
export default function ComponentsScreen() {
  const { t } = useUI();
  return (
    <PreferencesPage>
      <View style={{ gap: 24 }}>
        <Button
          title={t("← Back")}
          variant="ghost"
          fullWidth={false}
          size="sm"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/profile")
          }
        />
        <AppText variant="h1" accessibilityRole="header">
          {t("UI Components")}
        </AppText>
        <AppText variant="bodySmall" color="muted">
          {t("Reusable building blocks for your next app.")}
        </AppText>
        <TypographyExamples />
        <FormExamples />
        <ButtonExamples />
        <OverlayExamples />
      </View>
    </PreferencesPage>
  );
}
