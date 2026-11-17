import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useUI } from "@/shared/theme/useUI";

export default function TabsNavigator() {
  const { c, t } = useUI();
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
          height: 66 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
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
