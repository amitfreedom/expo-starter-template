import { useState } from "react";
import { View } from "react-native";
import { AppText } from "@/shared/components/AppText";
import { Field } from "@/shared/components/Field";
import { MultilineField } from "@/shared/components/MultilineField";
import { Button } from "@/shared/components/Button";
import { useUI } from "@/shared/theme/useUI";
export function FormExamples() {
  const { s, t } = useUI();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(false);
  return (
    <View style={[s.card, { gap: 18 }]}>
      <AppText variant="title">{t("Input fields")}</AppText>
      <Field
        label={t("Sample name")}
        value={name}
        onChangeText={(value) => {
          setName(value);
          setChecked(false);
        }}
        placeholder={t("Enter your name")}
        error={
          checked && name.trim().length < 2
            ? t("Please enter your full name.")
            : undefined
        }
      />
      <MultilineField
        label={t("Your note")}
        value={note}
        onChangeText={setNote}
        placeholder={t("Write a few lines...")}
        helperText={t("A reusable multiline input.")}
        maxLength={500}
      />
      <Field
        label={t("Disabled field")}
        value={t("Read-only example")}
        disabled
      />
      <Button
        title={t("Validate fields")}
        variant="outline"
        onPress={() => setChecked(true)}
      />
      {checked && name.trim().length >= 2 && (
        <AppText role="status" variant="bodySmall" color="primary">
          {t("Looks good!")}
        </AppText>
      )}
    </View>
  );
}
