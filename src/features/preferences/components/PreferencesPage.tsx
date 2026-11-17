import { type ReactNode } from "react";
import { View } from "react-native";
import { Screen } from "@/shared/components/Screen";
import { PreferencesPanel } from "./PreferencesPanel";
export function PreferencesPage({
  children,
  showPreferences = true,
}: {
  children: ReactNode;
  showPreferences?: boolean;
}) {
  return (
    <Screen
      footer={
        showPreferences ? (
          <View style={{ marginTop: 28 }}>
            <PreferencesPanel collapsible />
          </View>
        ) : undefined
      }
    >
      {children}
    </Screen>
  );
}
