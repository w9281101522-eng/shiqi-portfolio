import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const preview = readFileSync(new URL("../preview.html", import.meta.url), "utf8");
// Visible alpha bounds of the existing PNG assets (excluding faint edge shadows).
const artwork = [
  { name: "lamp", size: [675, 900], bounds: [154, 138, 508, 879], centre: [130.2, 189.4] },
  { name: "note", size: [512, 400], bounds: [16, 14, 494, 387], centre: [311.8, 189.4] },
  { name: "film", size: [427, 418], bounds: [85, 62, 384, 369], centre: [130.2, 401] },
  { name: "lighter", size: [453, 716], bounds: [128, 90, 330, 619], centre: [311.8, 401] },
];

test("the four objects move upward together without changing their sizes or spacing", () => {
  assert.match(css, /top: calc\(var\(--tidy-object-y\) - 24px\);/);
  const approvedWidths = { lamp: 167.6113, note: 160.6695, film: 188.5084, lighter: 169.5539 };
  const areas = [];
  for (const item of artwork) {
    const selector = `html body section#top.hero-scene-tidy .desk-${item.name} {`;
    const start = css.indexOf(selector);
    assert.ok(start >= 0, item.name);
    const rule = css.slice(start, css.indexOf("}", start));
    const value = (name) => Number.parseFloat(rule.match(new RegExp(`--tidy-object-${name}:\\s*([^;]+);`))[1]);
    assert.equal(value("width"), approvedWidths[item.name]);
    const scale = value("width") / item.size[0];
    const x = value("x") * 1262 / 100;
    const y = value("y") - 24;
    const left = x - value("anchor-x") / 100 * value("width") + item.bounds[0] * scale;
    const top = y - value("anchor-y") / 100 * item.size[1] * scale + item.bounds[1] * scale;
    const width = (item.bounds[2] - item.bounds[0]) * scale;
    const height = (item.bounds[3] - item.bounds[1]) * scale;
    assert.ok(Math.abs(left + width / 2 - item.centre[0]) < 0.01, `${item.name}: column alignment`);
    assert.ok(Math.abs(top + height / 2 - (item.centre[1] - 24)) < 0.01, `${item.name}: shared upward shift`);
    assert.ok(left >= 39.4 && left + width <= 402.6, `${item.name}: horizontal bounds`);
    assert.ok(top >= 83.6 - 24 && top + height <= 506.8 - 24, `${item.name}: shifted vertical bounds`);
    areas.push(width * height);
  }
  assert.ok(Math.max(...areas) / Math.min(...areas) < 1.25, "visible footprint areas stay within 25%");
});

test("preview no longer carries conflicting inline positioning for the four tidy objects", () => {
  const styles = [...preview.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join("\n");
  assert.doesNotMatch(styles, /\.desk-(?:lamp|note|film|lighter)(?![\w-])/);
  assert.match(css, /\.hero-scene-desk \.desk-folder \{ right: 187px; top: 425px; \}/);
  assert.match(css, /rotate\(90deg\) scale\(\.836\)/);
});
