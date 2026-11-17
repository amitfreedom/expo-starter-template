import { create } from "axios";
import { apiConfig } from "@/shared/config/env";
import { createApiLogger, type ApiLogWriter } from "./logger";
import { installApiInterceptors } from "./interceptors";
import { apiSession, type ApiSession } from "./session";
export function createApiClient({
  baseURL = apiConfig.baseURL,
  timeout = apiConfig.timeout,
  session = apiSession,
  logging = apiConfig.loggingEnabled,
  logWriter,
}: {
  baseURL?: string;
  timeout?: number;
  session?: ApiSession;
  logging?: boolean;
  logWriter?: ApiLogWriter;
} = {}) {
  const client = create({ baseURL, timeout });
  installApiInterceptors(
    client,
    session,
    baseURL,
    createApiLogger({ enabled: logging, write: logWriter }),
  );
  return client;
}
// Every feature service imports this instance. Interceptors are registered once.
export const apiClient = createApiClient();
