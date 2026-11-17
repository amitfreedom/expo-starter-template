import { useState } from "react";
import { View } from "react-native";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { typography, type TextVariant } from "@/shared/theme/typography";
import { useUI } from "@/shared/theme/useUI";
export function TypographyExamples() {
  const { s, t } = useUI();
  const [scale, setScale] = useState(1);
  return (
    <View style={[s.card, { gap: 14 }]}>
      <AppText variant="title">{t("Typography and scale")}</AppText>
      <AppText variant="bodySmall" color="muted">
        {t("Semantic text sizes with responsive and device font scaling.")}
      </AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(
          [
            { label: "Small", scale: 0.85 },
            { label: "Default", scale: 1 },
            { label: "Large", scale: 1.15 },
          ] as const
        ).map((option) => (
          <Button
            key={option.label}
            title={t(option.label)}
            size="sm"
            fullWidth={false}
            variant={scale === option.scale ? "secondary" : "outline"}
            accessibilityState={{ selected: scale === option.scale }}
            onPress={() => setScale(option.scale)}
          />
        ))}
      </View>
      {(Object.keys(typography) as TextVariant[]).map((variant) => (
        <View key={variant} style={{ gap: 4 }}>
          <AppText variant="caption" color="muted">
            {variant} · {typography[variant].fontSize}
          </AppText>
          <AppText variant={variant} scale={scale}>
            {t("Make room to grow.")}
          </AppText>
        </View>
      ))}
    </View>
  );
}
