// Expo inlines public variables only with static process.env property access.
export const apiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_URL?.trim() || undefined,
  timeout: 15_000,
  loggingEnabled:
    typeof __DEV__ !== "undefined" &&
    __DEV__ &&
    process.env.EXPO_PUBLIC_API_LOGGING !== "false",
};
