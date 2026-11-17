import { createContext, forwardRef, useContext } from "react";
import {
  StyleSheet,
  Text as NativeText,
  useWindowDimensions,
  type TextInstance,
  type TextProps,
} from "react-native";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
import { type Palette } from "@/shared/theme/palettes";
import {
  getTypography,
  scaleTextStyle,
  type TextVariant,
  type TypographyOptions,
} from "@/shared/theme/typography";
const TextNesting = createContext(false);
export type AppTextProps = TextProps &
  Omit<TypographyOptions, "width" | "language"> & {
    variant?: TextVariant;
    color?: keyof Palette;
    appFontScaling?: boolean;
  };
export const AppText = forwardRef<TextInstance, AppTextProps>(function AppText(
  {
    variant,
    size,
    weight,
    scale,
    responsive = true,
    color,
    style,
    allowFontScaling = true,
    appFontScaling = true,
    ...props
  },
  ref,
) {
  const nested = useContext(TextNesting);
  const { width } = useWindowDimensions();
  const { colors, language, fontScale } = usePreferences();
  const explicitTypography =
    !nested ||
    variant !== undefined ||
    size !== undefined ||
    weight !== undefined ||
    scale !== undefined;
  const textStyle = getTypography(variant ?? "body", {
    width,
    language,
    size,
    weight,
    scale,
    responsive,
  });
  const custom = StyleSheet.flatten(style);
  const resolvedStyle = scaleTextStyle(
    {
      ...(explicitTypography ? textStyle : {}),
      ...(!nested || color ? { color: colors[color ?? "ink"] } : {}),
      ...custom,
      ...(custom?.fontSize !== undefined && custom.lineHeight === undefined
        ? { lineHeight: custom.fontSize * (language === "hi" ? 1.5 : 1.35) }
        : {}),
    },
    appFontScaling ? fontScale : 1,
    language,
  );
  return (
    <NativeText
      {...props}
      ref={ref}
      allowFontScaling={allowFontScaling}
      style={resolvedStyle}
    >
      <TextNesting.Provider value>{props.children}</TextNesting.Provider>
    </NativeText>
  );
});
