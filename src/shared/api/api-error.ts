import { AxiosHeaders, isAxiosError } from "axios";
import { type MessageKey } from "@/shared/i18n/messages";
export type FieldErrors = Record<string, string[]>;
export type ApiErrorKind =
  | "network"
  | "timeout"
  | "authentication"
  | "authorization"
  | "validation"
  | "not-found"
  | "conflict"
  | "rate-limit"
  | "server"
  | "configuration"
  | "unknown";
const GENERIC_MESSAGE: MessageKey = "Something went wrong. Please try again.";
const DEFAULT_MESSAGES: Record<ApiErrorKind, MessageKey> = {
  network: "Unable to connect. Check your internet connection.",
  timeout: "The request timed out. Please try again.",
  authentication: "Your session has expired. Please log in again.",
  authorization: "You do not have permission to do this.",
  validation: "Please check the information you entered.",
  "not-found": "The requested information could not be found.",
  conflict: "This information conflicts with an existing record.",
  "rate-limit": "Too many requests. Please try again later.",
  server: "The server is unavailable. Please try again later.",
  configuration:
    "The app could not connect to the server. Please try again later.",
  unknown: "Request failed. Please try again.",
};
function classify(status?: number, code?: string): ApiErrorKind {
  // An HTTP response takes precedence over any backend-supplied error code.
  if (status === 400 || status === 422) return "validation";
  if (status === 401) return "authentication";
  if (status === 403) return "authorization";
  if (status === 404) return "not-found";
  if (status === 408) return "timeout";
  if (status === 409) return "conflict";
  if (status === 429) return "rate-limit";
  if (status !== undefined) return status >= 500 ? "server" : "unknown";
  if (code === "TIMEOUT") return "timeout";
  if (code === "NETWORK_ERROR") return "network";
  if (
    [
      "API_NOT_CONFIGURED",
      "INVALID_API_URL",
      "ERR_INVALID_URL",
      "ERR_BAD_OPTION",
      "ERR_BAD_OPTION_VALUE",
      "ERR_NOT_SUPPORT",
    ].includes(code ?? "")
  )
    return "configuration";
  return "unknown";
}
export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly kind: ApiErrorKind;
  readonly messageKey: MessageKey;
  readonly fieldErrors?: FieldErrors;
  readonly details?: unknown;
  readonly retryAfterSeconds?: number;
  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      kind?: ApiErrorKind;
      fieldErrors?: FieldErrors;
      details?: unknown;
      retryAfterSeconds?: number;
      messageKey?: MessageKey;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.kind = options.kind ?? classify(options.status, options.code);
    this.messageKey =
      options.messageKey ??
      (options.code === "AUTH_REQUIRED"
        ? "Please log in to continue."
        : DEFAULT_MESSAGES[this.kind]);
    this.fieldErrors = options.fieldErrors;
    this.details = options.details;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
  get retryable() {
    return (
      (this.status === undefined &&
        (this.kind === "network" || this.kind === "timeout")) ||
      [408, 500, 502, 503, 504].includes(this.status ?? 0)
    );
  }
}
function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
function cleanMessage(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  const message = value.trim();
  // HTML responses/stack traces are diagnostic information, not UI messages.
  if (
    !message ||
    message.length > 500 ||
    /<\/?[a-z][^>]*>/i.test(message) ||
    /\n\s*at\s/.test(message)
  )
    return;
  return message;
}
function messageList(value: unknown): string[] {
  return (Array.isArray(value) ? value : [value])
    .map(cleanMessage)
    .filter((message): message is string => !!message);
}
function readFieldErrors(value: unknown): FieldErrors | undefined {
  const payload = record(value);
  if (!payload) return;
  const entries = Object.entries(payload)
    .map(([key, value]) => [key, messageList(value)] as const)
    .filter(([, messages]) => messages.length > 0);
  return entries.length ? Object.fromEntries(entries) : undefined;
}
export function parseRetryAfter(
  value: unknown,
  now = Date.now(),
): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return;
  const text = String(value).trim();
  if (!text) return;
  if (/^\d+$/.test(text)) {
    const seconds = Number(text);
    return Number.isSafeInteger(seconds) ? seconds : undefined;
  }
  if (/^-?\d+(\.\d+)?$/.test(text)) return;
  const date = Date.parse(text);
  return Number.isFinite(date)
    ? Math.max(0, Math.ceil((date - now) / 1000))
    : undefined;
}
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!isAxiosError(error)) return new ApiError(GENERIC_MESSAGE);
  const status = error.response?.status;
  const body: unknown = error.response?.data;
  const payload = record(body);
  const nested = record(payload?.error);
  const fields = readFieldErrors(payload?.errors ?? nested?.errors);
  const timeout = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
  const configuration = [
    "ERR_INVALID_URL",
    "ERR_BAD_OPTION",
    "ERR_BAD_OPTION_VALUE",
    "ERR_NOT_SUPPORT",
  ].includes(error.code ?? "");
  const code = timeout
    ? "TIMEOUT"
    : !error.response && !configuration
      ? "NETWORK_ERROR"
      : (cleanMessage(payload?.code ?? nested?.code) ?? error.code);
  const kind = classify(status, code);
  const message =
    cleanMessage(payload?.message) ??
    cleanMessage(nested?.message) ??
    cleanMessage(payload?.detail) ??
    cleanMessage(payload?.title);
  const messageKey: MessageKey =
    kind === "authentication"
      ? error.config?.authMode === "none"
        ? "Authentication failed. Please check your details."
        : AxiosHeaders.from(error.config?.headers).has("Authorization")
          ? DEFAULT_MESSAGES.authentication
          : "Please log in to continue."
      : DEFAULT_MESSAGES[kind];
  return new ApiError(message ?? messageKey, {
    messageKey,
    status,
    code,
    kind,
    fieldErrors: fields,
    details: body,
    retryAfterSeconds: parseRetryAfter(error.response?.headers["retry-after"]),
  });
}
