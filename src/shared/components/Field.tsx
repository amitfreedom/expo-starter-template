import { forwardRef, useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type TextInputInstance,
  type StyleProp,
  type ViewStyle,
  useWindowDimensions,
} from "react-native";
import { AppText } from "./AppText";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
import { getTypography, scaleTextStyle } from "@/shared/theme/typography";
import { radii, spacing } from "@/shared/theme/tokens";
export type FieldProps = TextInputProps & {
  label: string;
  password?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};
export const Field = forwardRef<TextInputInstance, FieldProps>(function Field(
  {
    label,
    password = false,
    error,
    helperText,
    disabled = false,
    leftIcon,
    rightIcon,
    containerStyle,
    style,
    multiline,
    editable = true,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const { colors: c, t, resolvedTheme, language, fontScale } = usePreferences();
  const { width } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const unavailable = disabled || !editable;
  return (
    <View
      style={[
        { gap: spacing.sm, opacity: unavailable ? 0.55 : 1 },
        containerStyle,
      ]}
    >
      <AppText variant="label">{label}</AppText>
      <View
        style={{
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          borderWidth: 1,
          borderColor: error ? c.danger : focused ? c.primary : c.border,
          backgroundColor: c.surface,
          borderRadius: radii.lg,
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
          minHeight: 56,
        }}
      >
        {leftIcon}
        <TextInput
          {...props}
          ref={ref}
          multiline={multiline}
          editable={!unavailable}
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityHint={error || helperText || props.accessibilityHint}
          accessibilityState={{
            ...props.accessibilityState,
            disabled: unavailable,
          }}
          placeholderTextColor={props.placeholderTextColor ?? c.placeholder}
          keyboardAppearance={resolvedTheme}
          secureTextEntry={
            !multiline && (password ? !visible : props.secureTextEntry)
          }
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              flex: 1,
              minWidth: 0,
              color: c.ink,
              paddingVertical: spacing.lg,
              textAlignVertical: multiline ? "top" : "center",
            },
            scaleTextStyle(
              {
                ...getTypography("input", { width, language }),
                ...StyleSheet.flatten(style),
              },
              fontScale,
              language,
            ),
          ]}
        />
        {password && !multiline ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              visible ? t("Hide password") : t("Show password")
            }
            disabled={unavailable}
            onPress={() => setVisible(!visible)}
            style={{
              minHeight: 44,
              justifyContent: "center",
              paddingHorizontal: 4,
            }}
          >
            <AppText variant="label" color="primary">
              {visible ? t("Hide") : t("Show")}
            </AppText>
          </Pressable>
        ) : (
          rightIcon
        )}
      </View>
      {!!error ? (
        <AppText variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color="muted">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
});
