import { Text } from "react-native";
import { isMessageKey } from "@/shared/i18n/messages";
import { useUI } from "@/shared/theme/useUI";
export function ErrorText({ message }: { message: string }) {
  const { c, t } = useUI();
  return message ? (
    <Text accessibilityRole="alert" style={{ color: c.danger, lineHeight: 21 }}>
      {isMessageKey(message)
        ? t(message)
        : t("Something went wrong. Please try again.")}
    </Text>
  ) : null;
}
