import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { useUI } from "@/shared/theme/useUI";
export function Field({
  label,
  password,
  ...props
}: TextInputProps & {
  label: string;
  password?: boolean;
}) {
  const { c, s, t, resolvedTheme } = useUI();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 9 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.field, focused && { borderColor: c.primary }]}>
        <TextInput
          {...props}
          accessibilityLabel={label}
          placeholderTextColor={c.placeholder}
          keyboardAppearance={resolvedTheme}
          secureTextEntry={password && !visible}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[s.input, props.style]}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              visible ? t("Hide password") : t("Show password")
            }
            onPress={() => setVisible(!visible)}
            hitSlop={8}
          >
            <Text style={s.link}>{visible ? t("Hide") : t("Show")}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
