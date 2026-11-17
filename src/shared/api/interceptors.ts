import {
  isCancel,
  isAxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { type ApiLogger } from "./logger";
import { ApiError, normalizeApiError } from "./api-error";
import { type ApiSession, type ApiSessionSnapshot } from "./session";

export type AuthMode = "required" | "optional" | "none";
declare module "axios" {
  interface AxiosRequestConfig {
    /** Default: optional. Use none for login/public endpoints; required for protected reads. */
    authMode?: AuthMode;
  }
}
export function installApiInterceptors(
  client: AxiosInstance,
  session: ApiSession,
  baseURL?: string,
  logger?: ApiLogger,
) {
  const requests = new WeakMap<
    InternalAxiosRequestConfig,
    ApiSessionSnapshot
  >();
  const rejectedRequests = new WeakMap<object, InternalAxiosRequestConfig>();
  const requestId = client.interceptors.request.use((config) => {
    try {
      if (!baseURL || !/^https?:\/\//i.test(baseURL)) {
        throw new ApiError(
          "Set EXPO_PUBLIC_API_URL to your backend URL before making API requests.",
          { code: "API_NOT_CONFIGURED" },
        );
      }
      // Only backend-relative paths go through this authenticated client.
      if (
        config.baseURL !== baseURL ||
        !config.url ||
        /^[a-z][a-z\d+.-]*:/i.test(config.url) ||
        /^[\\/]{2}/.test(config.url) ||
        config.url.includes("\\")
      ) {
        throw new ApiError(
          "Use a relative backend endpoint with the common API client.",
          { code: "INVALID_API_URL" },
        );
      }
      const snapshot = session.getSnapshot();
      if (config.authMode === "required" && !snapshot.accessToken) {
        throw new ApiError("Please log in to continue.", {
          status: 401,
          code: "AUTH_REQUIRED",
        });
      }
      config.headers.set("Accept", "application/json");
      config.headers.set("Accept-Language", snapshot.language);
      if (snapshot.accessToken && config.authMode !== "none") {
        config.headers.set("Authorization", `Bearer ${snapshot.accessToken}`);
        requests.set(config, snapshot);
      } else {
        config.headers.delete("Authorization");
      }
      logger?.request(config);
      return config;
    } catch (error) {
      logger?.request(config);
      if (typeof error === "object" && error !== null)
        rejectedRequests.set(error, config);
      throw error;
    }
  });
  const responseId = client.interceptors.response.use(
    (response) => {
      logger?.response(response);
      return response;
    },
    (error: unknown) => {
      const rejectedConfig =
        typeof error === "object" && error !== null
          ? rejectedRequests.get(error)
          : undefined;
      logger?.error(error, rejectedConfig);
      // Preserve Axios cancellation so TanStack Query can distinguish an aborted request.
      if (isCancel(error)) return Promise.reject(error);
      if (
        isAxiosError(error) &&
        error.response?.status === 401 &&
        error.config
      ) {
        const requestSession = requests.get(error.config);
        if (requestSession) session.notifyUnauthorized(requestSession.version);
      }
      return Promise.reject(normalizeApiError(error));
    },
  );
  return () => {
    client.interceptors.request.eject(requestId);
    client.interceptors.response.eject(responseId);
  };
}
