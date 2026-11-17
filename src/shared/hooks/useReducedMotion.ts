import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let active = true;
    let updated = false;
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (value) => {
        updated = true;
        setReduced(value);
      },
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active && !updated) setReduced(value);
      })
      .catch(() => {});
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}
