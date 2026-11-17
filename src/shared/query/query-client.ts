import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api/api-error";
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: (failureCount, error) =>
          failureCount < 2 &&
          error instanceof ApiError &&
          error.retryable &&
          (error.retryAfterSeconds === undefined ||
            error.retryAfterSeconds <= 30),
        retryDelay: (attempt, error) =>
          Math.max(
            Math.min(1_000 * 2 ** attempt, 30_000),
            error instanceof ApiError
              ? Math.min((error.retryAfterSeconds ?? 0) * 1_000, 30_000)
              : 0,
          ),
      },
      mutations: { retry: false, gcTime: 0 },
    },
  });
}
