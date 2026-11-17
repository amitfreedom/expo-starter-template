import { type MessageKey } from "@/shared/i18n/messages";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { AppModal } from "@/shared/components/AppModal";
import { DialogBox } from "@/shared/components/DialogBox";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { Field } from "@/shared/components/Field";
import { useUI } from "@/shared/theme/useUI";
export function OverlayExamples() {
  const { c, s, t } = useUI();
  const [modal, setModal] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<MessageKey | null>(null);
  const [fail, setFail] = useState(false);
  return (
    <View style={[s.card, { gap: 14 }]}>
      <AppText variant="title">{t("Overlays")}</AppText>
      <Button
        title={t("Open modal")}
        variant="secondary"
        onPress={() => setModal(true)}
      />
      <Button
        title={t("Open dialog")}
        variant="outline"
        onPress={() => {
          setFail(false);
          setDialog(true);
        }}
      />
      <Button
        title={t("Try dialog error")}
        variant="ghost"
        onPress={() => {
          setFail(true);
          setDialog(true);
        }}
      />
      <Button
        title={t("Open bottom sheet")}
        variant="outline"
        onPress={() => setSheet(true)}
      />
      {result && (
        <AppText role="status" variant="bodySmall" color="primary">
          {t(result)}
        </AppText>
      )}
      <AppModal
        visible={modal}
        onClose={() => setModal(false)}
        title={t("Reusable modal")}
        footer={<Button title={t("Done")} onPress={() => setModal(false)} />}
      >
        <AppText variant="bodySmall" color="muted">
          {t("Use this modal for any custom content.")}
        </AppText>
        <Field
          label={t("Modal input")}
          value={value}
          onChangeText={setValue}
          placeholder={t("Enter your name")}
        />
      </AppModal>
      <DialogBox
        visible={dialog}
        title={t("Confirm action")}
        message={t("This example demonstrates a reusable confirmation dialog.")}
        onClose={() => setDialog(false)}
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (fail) throw new Error("Please try again.");
          setResult("Action confirmed");
        }}
      />
      <BottomSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title={t("Choose an option")}
        size="sm"
      >
        <AppText variant="bodySmall" color="muted">
          {t("Swipe the handle down or choose an option.")}
        </AppText>
        {(["First option", "Second option", "Third option"] as const).map(
          (label) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              onPress={() => {
                setResult(label);
                setSheet(false);
              }}
              style={{
                padding: 16,
                minHeight: 48,
                borderRadius: 12,
                backgroundColor: c.mint,
              }}
            >
              <AppText variant="bodySmall" color="primary">
                {t(label)}
              </AppText>
            </Pressable>
          ),
        )}
      </BottomSheet>
    </View>
  );
}
