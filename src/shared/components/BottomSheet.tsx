import { useEffect, useMemo, useState } from "react";
import { Animated, PanResponder, Platform, View } from "react-native";
import { Overlay, type OverlayProps } from "./overlays/Overlay";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
import { useReducedMotion } from "@/shared/hooks/useReducedMotion";
export type BottomSheetProps = Omit<
  OverlayProps,
  "placement" | "alert" | "handle" | "translateY"
> & { swipeToDismiss?: boolean };
export function BottomSheet({
  swipeToDismiss = true,
  dismissible = true,
  ...props
}: BottomSheetProps) {
  const { visible, onClose } = props;
  const { colors: c } = usePreferences();
  const [translateY] = useState(() => new Animated.Value(0));
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (visible) translateY.setValue(0);
    return () => translateY.stopAnimation();
  }, [visible, translateY]);
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          dismissible &&
          swipeToDismiss &&
          gesture.dy > 5 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) =>
          translateY.setValue(Math.max(0, gesture.dy)),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 90 || gesture.vy > 1) onClose();
          else if (reducedMotion) translateY.setValue(0);
          else
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: Platform.OS !== "web",
              damping: 20,
              stiffness: 220,
            }).start();
        },
        onPanResponderTerminate: () => translateY.setValue(0),
      }),
    [dismissible, onClose, reducedMotion, swipeToDismiss, translateY],
  );
  return (
    <Overlay
      {...props}
      dismissible={dismissible}
      placement="bottom"
      translateY={translateY}
      handle={
        <View
          testID="bottom-sheet-handle"
          {...responder.panHandlers}
          style={{
            alignItems: "center",
            minHeight: 36,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: c.border,
            }}
          />
        </View>
      }
    />
  );
}
