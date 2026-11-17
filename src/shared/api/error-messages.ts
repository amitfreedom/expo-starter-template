import { isCancel, isAxiosError } from "axios";
import { isMessageKey, type MessageKey } from "@/shared/i18n/messages";
import { ApiError, normalizeApiError } from "./api-error";
type Translate = (
  key: MessageKey,
  params?: Record<string, string | number>,
) => string;
export function getErrorMessage(
  error: unknown,
  t: Translate,
  fallback: MessageKey = "Something went wrong. Please try again.",
): string | null {
  if (error === null || error === undefined || error === "" || isCancel(error))
    return null;
  if (!(error instanceof ApiError) && isAxiosError(error))
    return getErrorMessage(normalizeApiError(error), t, fallback);
  if (error instanceof ApiError) {
    // Safe backend business messages can be localized by Accept-Language.
    // Infrastructure failures always use our localized, user-facing message.
    if (["validation", "conflict"].includes(error.kind)) {
      return isMessageKey(error.message) ? t(error.message) : error.message;
    }
    return t(error.messageKey);
  }
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";
  if (isMessageKey(message)) return t(message);
  return t(fallback);
}
export function getFieldErrorMessage(
  error: unknown,
  field: string,
  t: Translate,
): string | undefined {
  if (
    !(error instanceof ApiError) ||
    !["validation", "conflict"].includes(error.kind)
  )
    return;
  const messages = error.fieldErrors?.[field];
  return messages
    ?.map((message) => (isMessageKey(message) ? t(message) : message))
    .join("\n");
}
