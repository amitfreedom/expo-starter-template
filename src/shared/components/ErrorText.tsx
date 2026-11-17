import { AppText } from "./AppText";
import { getErrorMessage } from "@/shared/api/error-messages";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
export function ErrorText({ error }: { error: unknown }) {
  const { t } = usePreferences();
  const message = getErrorMessage(error, t);
  return message ? (
    <AppText variant="bodySmall" color="danger" accessibilityRole="alert">
      {message}
    </AppText>
  ) : null;
}
