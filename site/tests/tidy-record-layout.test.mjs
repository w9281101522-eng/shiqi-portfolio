import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const css = read("../app/globals.css");
const preview = read("../preview.html");
const page = read("../app/page.tsx");
const selector = "html body section#top.hero-scene-tidy";
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
  selector: match[1].replace(/\/\*[\s\S]*?\*\//g, "").trim(),
  declarations: Object.fromEntries(match[2].split(";").filter((entry) => entry.includes(":")).map((entry) => {
    const colon = entry.indexOf(":");
    return [entry.slice(0, colon).trim(), entry.slice(colon + 1).trim()];
  })),
}));
const rule = (name, property) => rules.find((entry) => entry.selector === name && property in entry.declarations)?.declarations;

test("tidy player preserves the original card geometry and uniformly scales the whole card", () => {
  const original = rule(".desk-record", "width");
  const tidy = rule(`${selector} .desk-record`, "width");
  assert.equal(tidy.width, original.width);
  assert.equal(tidy.height, original.height);
  assert.equal(tidy.transform, "translate(-50%, -50%) rotate(90deg) scale(.836)");
  assert.equal(tidy.translate, "none");
  assert.equal(tidy.rotate, "none");
  assert.equal(tidy.scale, "1");
  assert.equal(tidy.animation, "none");
});

test("hover rotates counterclockwise around the same centre with a stable resting hit area", () => {
  const stage = rule(`${selector} .desk-record-stage`, "width");
  const hover = rules.find((entry) => entry.selector.includes(`${selector} .desk-record-stage:hover .desk-record`)).declarations;
  assert.equal(rule(".desk-record-stage", "display").display, "contents");
  assert.equal(stage.left, "50%");
  assert.equal(stage.top, "224px");
  assert.ok(Math.abs(Number.parseFloat(stage.width) - 374 * 0.76 * 1.1) < 0.001);
  assert.ok(Math.abs(Number.parseFloat(stage.height) - 306 * 0.76 * 1.1) < 0.001);
  assert.equal(hover.transform, "translate(-50%, -50%) rotate(0deg) scale(.836)");
});

test("preview uses the shared layout without legacy competing player rules", () => {
  const inlineStyles = [...preview.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join("\n");
  assert.doesNotMatch(inlineStyles, /\.desk-record\b/);
  assert.match(preview, /app\/globals\.css\?v=[^"\s]+/);
  assert.equal((preview.match(/<div class="desk-record-stage">/g) ?? []).length, 1);
  assert.equal((preview.match(/<button class="desk-object desk-record"/g) ?? []).length, 1);
  assert.equal((preview.match(/<audio id="deskRecordAudio"/g) ?? []).length, 1);
  assert.match(preview, /card\.addEventListener\('click',toggle\)/);
  assert.match(preview, /card\.addEventListener\('pointerenter'/);
  assert.match(page, /onPointerEnter=\{queueRecordOnHover\}/);
  assert.match(page, /onClick=\{toggleRecord\}/);
});
