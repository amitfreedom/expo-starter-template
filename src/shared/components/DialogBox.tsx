import { useState } from "react";
import { View } from "react-native";
import { Overlay } from "./overlays/Overlay";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { ErrorText } from "./ErrorText";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
export type DialogBoxProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};
function DialogContent({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel,
  cancelLabel,
  destructive = false,
}: DialogBoxProps) {
  const { t } = usePreferences();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function confirm() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Overlay
      visible={visible}
      title={title}
      onClose={onClose}
      dismissible={!loading}
      alert
      size="sm"
      footer={
        <View style={{ gap: 8 }}>
          <Button
            title={confirmLabel ?? t("Confirm")}
            onPress={confirm}
            loading={loading}
            danger={destructive}
          />
          <Button
            title={cancelLabel ?? t("Cancel")}
            variant="ghost"
            onPress={onClose}
            disabled={loading}
          />
        </View>
      }
    >
      <AppText variant="bodySmall" color="muted">
        {message}
      </AppText>
      <ErrorText error={error} />
    </Overlay>
  );
}

export function DialogBox(props: DialogBoxProps) {
  return props.visible ? <DialogContent {...props} /> : null;
}
