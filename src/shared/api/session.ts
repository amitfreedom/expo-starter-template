import { type Language } from "@/shared/i18n/messages";
export type ApiSessionSnapshot = Readonly<{
  accessToken: string | null;
  language: Language;
  version: number;
}>;
export type ApiSession = ReturnType<typeof createApiSession>;

// Tokens intentionally stay in memory. Connect secure persistence in your auth adapter.
export function createApiSession() {
  let snapshot: ApiSessionSnapshot = {
    accessToken: null,
    language: "en",
    version: 0,
  };
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    setAccessToken(accessToken: string | null) {
      snapshot = { ...snapshot, accessToken, version: snapshot.version + 1 };
    },
    setLanguage(language: Language) {
      snapshot = { ...snapshot, language };
    },
    subscribeUnauthorized(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    notifyUnauthorized(requestVersion: number) {
      // A late 401 from an old request must not sign out a newer session.
      if (snapshot.version !== requestVersion || !snapshot.accessToken) return;
      for (const listener of listeners) listener();
    },
  };
}
export const apiSession = createApiSession();
