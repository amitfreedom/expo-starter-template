import * as SplashScreen from "expo-splash-screen";
import { AppProviders } from "@/core/providers/AppProviders";
import RootNavigator from "@/core/navigation/RootNavigator";
SplashScreen.preventAutoHideAsync().catch(() => {});
export const unstable_settings = { anchor: "splash" };
export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
