export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
} as const;
export const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 44,
} as const;
export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  heavy: "800",
} as const;
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
/** Moderate width scaling; accessibility font scaling is left to native Text. */
export function moderateScale(size: number, width = 390, factor = 0.3): number {
  const boundedWidth = Math.min(480, Math.max(320, width));
  return (
    Math.round((size + ((size * boundedWidth) / 390 - size) * factor) * 100) /
    100
  );
}
