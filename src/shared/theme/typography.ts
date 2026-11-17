import { type TextStyle } from "react-native";
import {
  fontSizes,
  fontWeights,
  moderateScale,
  type FontSize,
  type FontWeight,
} from "./tokens";
export const typography = {
  display: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: fontWeights.bold,
    letterSpacing: -1.4,
  },
  h1: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: fontWeights.bold,
    letterSpacing: -1.2,
  },
  h2: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.8,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.4,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  label: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0,
  },
  input: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  button: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: fontWeights.regular,
    letterSpacing: 0,
  },
  overline: {
    fontSize: 11,
    lineHeight: 18,
    fontWeight: fontWeights.bold,
    letterSpacing: 1.6,
  },
} as const;
export type TextVariant = keyof typeof typography;
export type TypographyOptions = {
  width?: number;
  language?: string;
  size?: FontSize;
  weight?: FontWeight;
  scale?: number;
  responsive?: boolean;
};
export function getTypography(
  variant: TextVariant,
  {
    width = 390,
    language = "en",
    size,
    weight,
    scale = 1,
    responsive = true,
  }: TypographyOptions = {},
): TextStyle {
  const base = typography[variant];
  const originalSize = size ? fontSizes[size] : base.fontSize;
  const fontSize =
    (responsive ? moderateScale(originalSize, width) : originalSize) *
    Math.min(1.5, Math.max(0.75, scale));
  const ratio = Math.max(
    base.lineHeight / base.fontSize,
    language === "hi" ? 1.5 : 1.2,
  );
  return {
    fontSize,
    lineHeight: Math.ceil(fontSize * ratio),
    fontWeight: weight ? fontWeights[weight] : base.fontWeight,
    letterSpacing: language === "hi" ? 0 : base.letterSpacing,
  };
}

/** Apply the saved app preference once, after variant and native style overrides. */
export function scaleTextStyle(
  style: TextStyle,
  fontScale: number,
  language = "en",
): TextStyle {
  const result = { ...style };
  if (style.fontSize !== undefined) {
    const lineHeight = Math.max(
      style.lineHeight ?? style.fontSize * 1.35,
      style.fontSize * (language === "hi" ? 1.5 : 1.2),
    );
    result.fontSize = style.fontSize * fontScale;
    result.lineHeight = Math.ceil(lineHeight * fontScale);
  } else if (style.lineHeight !== undefined) {
    result.lineHeight = Math.ceil(style.lineHeight * fontScale);
  }
  if (style.letterSpacing !== undefined)
    result.letterSpacing = style.letterSpacing * fontScale;
  return result;
}
