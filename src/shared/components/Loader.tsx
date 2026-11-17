import {
  ActivityIndicator,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { AppText } from "./AppText";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
export type LoaderProps = {
  visible?: boolean;
  size?: "small" | "large";
  label?: string;
  color?: string;
  fullscreen?: boolean;
  style?: StyleProp<ViewStyle>;
};
export function Loader({
  visible = true,
  size = "large",
  label,
  color,
  fullscreen = false,
  style,
}: LoaderProps) {
  const { colors, t } = usePreferences();
  if (!visible) return null;
  return (
    <View
      role="progressbar"
      accessible
      aria-busy
      accessibilityLabel={label ?? t("Loading...")}
      accessibilityState={{ busy: true }}
      style={[
        { alignItems: "center", justifyContent: "center", gap: 12 },
        fullscreen && { flex: 1, backgroundColor: colors.background },
        style,
      ]}
    >
      <ActivityIndicator
        color={color ?? colors.primary}
        size={size}
        accessible={false}
      />
      {label && (
        <AppText variant="bodySmall" color="muted">
          {label}
        </AppText>
      )}
    </View>
  );
}
