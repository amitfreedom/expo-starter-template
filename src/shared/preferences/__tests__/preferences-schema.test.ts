import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_PREFERENCES,
  parseStoredPreferences,
} from "../preferences-schema";
import { clampFontScale } from "@/shared/theme/font-scale";
test("existing theme and language selections survive migration to font-size preferences", () => {
  assert.deepEqual(
    parseStoredPreferences({ themeMode: "dark", language: "hi" }),
    { themeMode: "dark", language: "hi", fontScale: 1 },
  );
});
test("saved custom font sizes restore without resetting other preferences", () => {
  for (const fontScale of [0.85, 1, 1.05, 1.15, 1.3, 1.5]) {
    assert.deepEqual(
      parseStoredPreferences({ themeMode: "light", language: "en", fontScale }),
      { themeMode: "light", language: "en", fontScale },
    );
  }
});
test("invalid or out-of-range font preferences recover to the default size", () => {
  for (const fontScale of [null, "1.5", 0, 0.84, 1.51, NaN, Infinity, {}, []]) {
    const parsed = parseStoredPreferences({
      fontScale,
      themeMode: "dark",
      language: "hi",
    });
    assert.equal(parsed.fontScale, 1);
    assert.equal(parsed.themeMode, "dark");
    assert.equal(parsed.language, "hi");
  }
  assert.deepEqual(parseStoredPreferences(null), DEFAULT_PREFERENCES);
});
test("font controls clamp bounds and avoid floating-point drift during fine adjustments", () => {
  assert.equal(clampFontScale(0), 0.85);
  assert.equal(clampFontScale(2), 1.5);
  assert.equal(clampFontScale(1.15000000000002), 1.15);
  assert.equal(clampFontScale(NaN), 1);
});
