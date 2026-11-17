import { type ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { AppText } from "./AppText";
import { Loader } from "./Loader";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
import { radii, spacing } from "@/shared/theme/tokens";
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  title: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  danger?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** @deprecated Use variant="secondary". */ secondary?: boolean;
};
export function Button({
  title,
  variant,
  secondary = false,
  size = "md",
  loading = false,
  disabled = false,
  danger = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const { colors: c } = usePreferences();
  const appearance = variant ?? (secondary ? "secondary" : "primary");
  const accent = danger ? c.danger : c.primary;
  const foreground =
    appearance === "primary" ? (danger ? c.onDanger : c.onPrimary) : accent;
  const blocked = disabled || loading;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      aria-busy={loading}
      aria-disabled={blocked}
      accessibilityLabel={props.accessibilityLabel ?? title}
      accessibilityState={{
        ...props.accessibilityState,
        disabled: blocked,
        busy: loading,
      }}
      disabled={blocked}
      style={({ pressed }) => [
        {
          minHeight: size === "sm" ? 44 : size === "lg" ? 64 : 56,
          paddingHorizontal: size === "sm" ? spacing.lg : spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: radii.lg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          backgroundColor:
            appearance === "primary"
              ? accent
              : appearance === "secondary"
                ? c.mint
                : "transparent",
          borderWidth: appearance === "outline" ? 1 : 0,
          borderColor: accent,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? <Loader size="small" color={foreground} /> : leftIcon}
      <AppText
        variant="button"
        style={[
          { color: foreground, textAlign: "center", flexShrink: 1 },
          textStyle,
        ]}
      >
        {title}
      </AppText>
      {!loading && rightIcon}
    </Pressable>
  );
}
