import {
  AxiosHeaders,
  isAxiosError,
  isCancel,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { normalizeApiError } from "./api-error";
export type ApiLogWriter = (json: string) => void;
export type ApiLogger = ReturnType<typeof createApiLogger>;
const REDACTED = "[REDACTED]";
const sensitiveKey = (key: string) =>
  /authorization|cookie|token|password|passwd|secret|credential|apikey|verificationcode|otp|^pin$|^code$/.test(
    key.replace(/[^a-z0-9]/gi, "").toLowerCase(),
  );

/** Return a detached, bounded JSON value without modifying request or response data. */
export function sanitizeLogValue(value: unknown): unknown {
  const seen = new WeakSet<object>();
  let remaining = 500;
  function visit(input: unknown, depth: number): unknown {
    if (--remaining < 0 || depth > 8) return "[Truncated]";
    if (
      input == null ||
      typeof input === "number" ||
      typeof input === "boolean"
    )
      return input ?? null;
    if (typeof input === "bigint") return input.toString();
    if (typeof input === "string") {
      // Axios transforms request JSON into a string before a response/error arrives.
      if (/^\s*[\[{]/.test(input)) {
        try {
          return visit(JSON.parse(input), depth + 1);
        } catch {
          /* Treat non-JSON as text. */
        }
      }
      return (
        input
          .replace(/\bBearer\s+[^\s"',;]+/gi, `Bearer ${REDACTED}`)
          .slice(0, 4000) + (input.length > 4000 ? " [Truncated]" : "")
      );
    }
    if (typeof input !== "object") return `[${typeof input}]`;
    if (seen.has(input)) return "[Circular]";
    if (typeof FormData !== "undefined" && input instanceof FormData)
      return "[FormData body omitted]";
    if (typeof Blob !== "undefined" && input instanceof Blob)
      return { type: "Blob", size: input.size };
    if (input instanceof ArrayBuffer || ArrayBuffer.isView(input))
      return "[Binary body omitted]";
    if (input instanceof Date)
      return Number.isNaN(input.getTime())
        ? "[Invalid date]"
        : input.toISOString();
    if (
      typeof URLSearchParams !== "undefined" &&
      input instanceof URLSearchParams
    ) {
      return Array.from(input.entries())
        .slice(0, 100)
        .map(([key, value]) => [
          key,
          sensitiveKey(key) ? REDACTED : visit(value, depth + 1),
        ]);
    }
    if (
      !Array.isArray(input) &&
      Object.getPrototypeOf(input) !== Object.prototype &&
      Object.getPrototypeOf(input) !== null
    )
      return "[Non-JSON object omitted]";
    seen.add(input);
    let result: unknown;
    if (Array.isArray(input)) {
      result = input.slice(0, 100).map((item) => visit(item, depth + 1));
      if (input.length > 100) (result as unknown[]).push("[Truncated]");
    } else {
      const entries = Object.entries(input)
        .slice(0, 100)
        .map(([key, value]) => [
          key,
          sensitiveKey(key) ? REDACTED : visit(value, depth + 1),
        ]);
      if (Object.keys(input).length > 100) entries.push(["__truncated", true]);
      result = Object.fromEntries(entries);
    }
    seen.delete(input);
    return result;
  }
  return visit(value, 0);
}
function sanitizeUrl(value: string): string {
  try {
    const absolute = /^[a-z][a-z\d+.-]*:/i.test(value);
    const url = new URL(value, "https://api-log.invalid");
    if (url.username) url.username = REDACTED;
    if (url.password) url.password = REDACTED;
    // Fragments are not sent to the server and may contain OAuth credentials.
    url.hash = "";
    for (const key of Array.from(url.searchParams.keys()))
      if (sensitiveKey(key)) url.searchParams.set(key, REDACTED);
    return absolute ? url.toString() : `${url.pathname}${url.search}`;
  } catch {
    return "[Invalid URL]";
  }
}
function requestUrl(config: InternalAxiosRequestConfig): string {
  const path = config.url ?? "";
  const url =
    /^[a-z][a-z\d+.-]*:/i.test(path) || /^[\\/]{2}/.test(path)
      ? path
      : `${(config.baseURL ?? "").replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  return sanitizeUrl(url);
}
function payload(value: unknown): unknown {
  if (
    typeof value === "string" &&
    !/^\s*[\[{]/.test(value) &&
    /^[^=\s]+=[\s\S]*/.test(value)
  ) {
    return sanitizeLogValue(new URLSearchParams(value));
  }
  return sanitizeLogValue(value);
}
export function createApiLogger({
  enabled,
  write = (json) => console.log(json),
}: {
  enabled: boolean;
  write?: ApiLogWriter;
}) {
  const requests = new WeakMap<
    InternalAxiosRequestConfig,
    { id: string; startedAt: number; method: string; url: string }
  >();
  let sequence = 0;
  function metadata(config?: InternalAxiosRequestConfig) {
    if (!config)
      return {
        id: `api-${Date.now().toString(36)}-${++sequence}`,
        startedAt: Date.now(),
        method: null,
        url: null,
      };
    const saved = requests.get(config);
    if (saved) return saved;
    const next = {
      id: `api-${Date.now().toString(36)}-${++sequence}`,
      startedAt: Date.now(),
      method: (config.method ?? "GET").toUpperCase(),
      url: requestUrl(config),
    };
    requests.set(config, next);
    return next;
  }
  function emit(build: () => Record<string, unknown>) {
    if (!enabled) return;
    try {
      write(
        JSON.stringify(
          { scope: "api", timestamp: new Date().toISOString(), ...build() },
          null,
          2,
        ),
      );
    } catch {
      /* Logging must never change request success, errors, or cancellation. */
    }
  }
  return {
    request(config: InternalAxiosRequestConfig) {
      emit(() => {
        const meta = metadata(config);
        return {
          event: "request",
          requestId: meta.id,
          request: {
            method: meta.method,
            url: meta.url,
            timeoutMs: config.timeout,
            headers: sanitizeLogValue(
              AxiosHeaders.from(config.headers).toJSON(),
            ),
            params: payload(config.params),
            payload: payload(config.data),
          },
        };
      });
    },
    response(response: AxiosResponse) {
      emit(() => {
        const meta = metadata(response.config);
        return {
          event: "response",
          requestId: meta.id,
          durationMs: Math.max(0, Date.now() - meta.startedAt),
          request: { method: meta.method, url: meta.url },
          response: {
            status: response.status,
            statusText: response.statusText,
            headers: sanitizeLogValue(
              response.headers instanceof AxiosHeaders
                ? response.headers.toJSON()
                : response.headers,
            ),
            data: payload(response.data),
          },
        };
      });
    },
    error(error: unknown, config?: InternalAxiosRequestConfig) {
      if (!enabled) return;
      emit(() => {
        const transport = isAxiosError(error) ? error : undefined;
        const meta = metadata(config ?? transport?.config);
        const cancelled = isCancel(error);
        const failure = cancelled ? undefined : normalizeApiError(error);
        return {
          event: cancelled ? "cancelled" : "error",
          requestId: meta.id,
          durationMs: Math.max(0, Date.now() - meta.startedAt),
          request: { method: meta.method, url: meta.url },
          error: {
            errorCode: cancelled ? "ERR_CANCELED" : failure?.code,
            kind: cancelled ? "cancelled" : failure?.kind,
            message: cancelled ? "Request cancelled" : failure?.messageKey,
          },
          response: transport?.response
            ? {
                status: transport.response.status,
                headers: sanitizeLogValue(
                  transport.response.headers instanceof AxiosHeaders
                    ? transport.response.headers.toJSON()
                    : transport.response.headers,
                ),
                data: payload(transport.response.data),
              }
            : null,
        };
      });
    },
  };
}
