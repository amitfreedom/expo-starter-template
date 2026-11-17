import { type ReactNode } from "react";
import { AuthProvider } from "@/features/auth";
import { PreferencesProvider } from "@/shared/preferences/PreferencesProvider";
import { AppQueryProvider } from "./AppQueryProvider";
import { AppThemeProvider } from "./AppThemeProvider";
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <AppQueryProvider>
        <AuthProvider>
          <AppThemeProvider>{children}</AppThemeProvider>
        </AuthProvider>
      </AppQueryProvider>
    </PreferencesProvider>
  );
}
