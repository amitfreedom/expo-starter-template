import { ActivityIndicator, Pressable, Text } from "react-native";
import { useUI } from "@/shared/theme/useUI";
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { c, s } = useUI();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        (disabled || loading) && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? c.primary : c.onPrimary} />
      ) : (
        <Text style={[s.buttonText, secondary && { color: c.primary }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
