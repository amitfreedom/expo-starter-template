import { useEffect, useState, type ReactNode } from "react";
import { AppState, Platform } from "react-native";
import {
  QueryClientProvider,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import * as Network from "expo-network";
import { createQueryClient } from "@/shared/query/query-client";
import { apiSession } from "@/shared/api/session";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
export function AppQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const { language } = usePreferences();
  useEffect(() => {
    apiSession.setLanguage(language);
  }, [language]);
  useEffect(() => {
    if (Platform.OS === "web") return;
    focusManager.setFocused(AppState.currentState === "active");
    const appState = AppState.addEventListener("change", (state) =>
      focusManager.setFocused(state === "active"),
    );
    let active = true;
    let receivedUpdate = false;
    const network = Network.addNetworkStateListener((state) => {
      if (state.isConnected !== undefined) {
        receivedUpdate = true;
        onlineManager.setOnline(
          state.isConnected && state.isInternetReachable !== false,
        );
      }
    });
    Network.getNetworkStateAsync()
      .then((state) => {
        if (active && !receivedUpdate && state.isConnected !== undefined)
          onlineManager.setOnline(
            state.isConnected && state.isInternetReachable !== false,
          );
      })
      .catch(() => {
        /* Leave online state unchanged if the OS cannot determine it. */
      });
    return () => {
      active = false;
      appState.remove();
      network.remove();
      focusManager.setFocused(undefined);
      onlineManager.setOnline(true);
    };
  }, []);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
