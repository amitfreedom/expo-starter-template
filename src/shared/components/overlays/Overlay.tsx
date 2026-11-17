import { type ReactNode, useId } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AppText } from "../AppText";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
import { radii, spacing } from "@/shared/theme/tokens";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
export type OverlayProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
  dismissOnBackdrop?: boolean;
  placement?: "center" | "bottom";
  size?: "sm" | "md" | "lg";
  alert?: boolean;
  handle?: ReactNode;
  translateY?: Animated.Value;
};
export function Overlay({
  visible,
  onClose,
  title,
  children,
  footer,
  dismissible = true,
  dismissOnBackdrop = true,
  placement = "center",
  size = "md",
  alert = false,
  handle,
  translateY,
}: OverlayProps) {
  const { colors: c, t } = usePreferences();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const titleId = useId();
  const bottom = placement === "bottom";
  const availableHeight = Math.max(
    160,
    height - insets.top - insets.bottom - 24,
  );
  const close = () => {
    if (dismissible) onClose();
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? "none" : bottom ? "slide" : "fade"}
      onRequestClose={close}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={{ flex: 1 }}>
        <Pressable
          testID="overlay-backdrop"
          accessible={false}
          onPress={dismissOnBackdrop ? close : undefined}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: c.backdrop,
          }}
        />
        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
            justifyContent: bottom ? "flex-end" : "center",
            alignItems: "center",
            paddingHorizontal: bottom ? 0 : spacing.xl,
            paddingTop: insets.top + spacing.md,
            paddingBottom: bottom ? 0 : insets.bottom + spacing.md,
          }}
        >
          <Animated.View
            role={alert ? "alertdialog" : "dialog"}
            aria-modal
            accessibilityLabel={title}
            aria-labelledby={titleId}
            accessibilityViewIsModal
            onAccessibilityEscape={close}
            style={{
              width: "100%",
              maxWidth: bottom
                ? 640
                : size === "sm"
                  ? 360
                  : size === "lg"
                    ? 640
                    : 480,
              maxHeight: availableHeight,
              height: bottom
                ? Math.round(
                    availableHeight *
                      (size === "sm" ? 0.45 : size === "lg" ? 0.95 : 0.7),
                  )
                : undefined,
              backgroundColor: c.surface,
              borderRadius: radii.xl,
              borderBottomLeftRadius: bottom ? 0 : radii.xl,
              borderBottomRightRadius: bottom ? 0 : radii.xl,
              borderWidth: 1,
              borderColor: c.border,
              overflow: "hidden",
              transform: translateY ? [{ translateY }] : undefined,
            }}
          >
            {handle}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                paddingLeft: spacing.xl,
                paddingRight: spacing.md,
                paddingTop: bottom ? spacing.xs : spacing.md,
                paddingBottom: spacing.sm,
              }}
            >
              <AppText
                variant="title"
                nativeID={titleId}
                accessibilityRole="header"
                style={{ flex: 1 }}
              >
                {title}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("Close")}
                disabled={!dismissible}
                onPress={close}
                style={{
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: dismissible ? 1 : 0.4,
                }}
              >
                <Feather name="x" size={22} color={c.muted} />
              </Pressable>
            </View>
            <ScrollView
              style={{ flexGrow: 0, flexShrink: 1 }}
              contentContainerStyle={{
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.sm,
                paddingBottom: spacing.xl,
                gap: spacing.lg,
              }}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
            {footer && (
              <View
                style={{
                  padding: spacing.xl,
                  paddingTop: spacing.md,
                  gap: spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: c.border,
                }}
              >
                {footer}
              </View>
            )}
            {bottom && (
              <View style={{ height: Math.max(insets.bottom, spacing.md) }} />
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
