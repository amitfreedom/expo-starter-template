import { type ReactNode } from "react";
import { AuthProvider } from "@/features/auth";
import { PreferencesProvider } from "@/shared/preferences/PreferencesProvider";
import { AppThemeProvider } from "./AppThemeProvider";
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <AppThemeProvider>{children}</AppThemeProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}
