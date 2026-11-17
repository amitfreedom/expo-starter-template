import assert from "node:assert/strict";
import { test } from "node:test";
import { moderateScale } from "../tokens";
import { getTypography, typography, type TextVariant } from "../typography";
test("responsive type scales monotonically and stays bounded on narrow or very wide screens", () => {
  assert.equal(moderateScale(16, 390), 16);
  assert.ok(moderateScale(16, 320) < moderateScale(16, 480));
  assert.equal(moderateScale(16, 200), moderateScale(16, 320));
  assert.equal(moderateScale(16, 1440), moderateScale(16, 480));
});
test("every semantic text variant has readable line height for English and Hindi", () => {
  for (const variant of Object.keys(typography) as TextVariant[]) {
    const en = getTypography(variant, { language: "en" });
    const hi = getTypography(variant, { language: "hi" });
    assert.ok(en.fontSize! > 0 && en.lineHeight! >= en.fontSize!);
    assert.ok(hi.lineHeight! >= hi.fontSize! * 1.5);
    assert.equal(hi.letterSpacing, 0);
  }
});
test("explicit sizes and scale overrides are independent and do not mutate global tokens", () => {
  const original = getTypography("body");
  const large = getTypography("body", {
    size: "2xl",
    weight: "bold",
    responsive: false,
    scale: 1.15,
  });
  assert.equal(large.fontSize, 24 * 1.15);
  assert.equal(large.fontWeight, "700");
  assert.deepEqual(getTypography("body"), original);
  assert.equal(
    getTypography("body", { responsive: false, width: 200 }).fontSize,
    getTypography("body", { responsive: false, width: 1440 }).fontSize,
  );
});

test("global font scale applies once after custom sizes and scales line height alongside text", async () => {
  const { scaleTextStyle } = await import("../typography");
  const input = { ...getTypography("h1"), fontSize: 27, lineHeight: 36 };
  const result = scaleTextStyle(input, 1.5);
  assert.equal(result.fontSize, 40.5);
  assert.equal(result.lineHeight, 54);
  assert.equal(input.fontSize, 27);
  assert.equal(input.lineHeight, 36);
  const hindi = scaleTextStyle({ fontSize: 20, lineHeight: 21 }, 1.5, "hi");
  assert.ok(hindi.lineHeight! >= hindi.fontSize! * 1.5);
});
test("nested text inherits an already-scaled size when it only changes color or weight", async () => {
  const { scaleTextStyle } = await import("../typography");
  assert.deepEqual(scaleTextStyle({ color: "#fff", fontWeight: "600" }, 1.5), {
    color: "#fff",
    fontWeight: "600",
  });
});
