import { Stack } from "expo-router";
import { useAuth } from "@/features/auth";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
export default function RootNavigator() {
  const { user } = useAuth();
  const { colors: c } = usePreferences();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
        animation: "fade",
      }}
    >
      <Stack.Protected guard={!user}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="components" />
      </Stack.Protected>
    </Stack>
  );
}
