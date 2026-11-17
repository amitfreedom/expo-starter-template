import { type MessageKey } from "@/shared/i18n/messages";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Loader } from "@/shared/components/Loader";
import { useUI } from "@/shared/theme/useUI";
export function ButtonExamples() {
  const { s, t } = useUI();
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState<MessageKey | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function simulateLoading() {
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setPressed("Loading complete");
    }, 800);
  }
  return (
    <View style={[s.card, { gap: 14 }]}>
      <AppText variant="title">{t("Buttons and loaders")}</AppText>
      {(
        [
          { variant: "primary", label: "Primary button" },
          { variant: "secondary", label: "Secondary button" },
          { variant: "outline", label: "Outline button" },
          { variant: "ghost", label: "Ghost button" },
        ] as const
      ).map(({ variant, label }) => (
        <Button
          key={variant}
          title={t(label)}
          variant={variant}
          onPress={() => setPressed(label)}
        />
      ))}
      <Button title={t("Disabled button")} disabled />
      <Button
        title={t("Try loading state")}
        loading={loading}
        onPress={simulateLoading}
      />
      <Loader size="small" label={t("Inline loader")} />
      {pressed && (
        <AppText role="status" variant="caption" color="primary">
          {t(pressed)}
        </AppText>
      )}
    </View>
  );
}
