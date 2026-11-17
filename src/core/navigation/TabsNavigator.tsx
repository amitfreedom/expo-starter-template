import { scaleTextStyle } from "@/shared/theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useUI } from "@/shared/theme/useUI";

export default function TabsNavigator() {
  const { c, t, fontScale, language } = useUI();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.background,
          borderTopColor: c.border,
          paddingTop: 9,
          height:
            66 + insets.bottom + Math.ceil(Math.max(0, fontScale - 1) * 20),
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: scaleTextStyle(
          { fontSize: 11, lineHeight: 16, fontWeight: "600" },
          fontScale,
          language,
        ),
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("Home"),
          tabBarIcon: ({ focused, size }) => (
            <Feather
              name="home"
              size={size}
              color={focused ? c.primary : c.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: t("Activity"),
          tabBarIcon: ({ focused, size }) => (
            <Feather
              name="activity"
              size={size}
              color={focused ? c.primary : c.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("Profile"),
          tabBarIcon: ({ focused, size }) => (
            <Feather
              name="user"
              size={size}
              color={focused ? c.primary : c.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}
