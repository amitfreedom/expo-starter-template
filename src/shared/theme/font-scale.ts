export const MIN_FONT_SCALE = 0.85;
export const MAX_FONT_SCALE = 1.5;
export const DEFAULT_FONT_SCALE = 1;
export const FONT_SCALE_STEP = 0.05;
export const FONT_SIZE_OPTIONS = [
  { label: "Small", value: 0.85 },
  { label: "Default", value: 1 },
  { label: "Large", value: 1.15 },
  { label: "Extra large", value: 1.3 },
  { label: "Largest", value: 1.5 },
] as const;
export function isValidFontScale(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= MIN_FONT_SCALE &&
    value <= MAX_FONT_SCALE
  );
}
export function clampFontScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_FONT_SCALE;
  return (
    Math.round(
      Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, value)) * 100,
    ) / 100
  );
}

export type FontScaleUpdate = number | ((current: number) => number);
