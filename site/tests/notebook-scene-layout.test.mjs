import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = name => readFileSync(new URL(name, import.meta.url), "utf8");
const css = read("../app/notebook-scene.css");
const preview = read("../preview.html");
const page = read("../app/page.tsx");
const selector = "html body #top#top#top.hero-scene-notebook";
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(match => ({ selector: match[1].trim(), body: match[2] }));
const rule = suffix => rules.find(entry => entry.selector === `${selector} ${suffix}`)?.body;

test("every new rule is restricted to the third state", () => {
  assert.ok(rules.length > 20);
  for (const entry of rules) {
    assert.ok(entry.selector.startsWith(selector), entry.selector);
  }
  assert.doesNotMatch(css, /hero-scene-(?:desk|tidy)/);
  assert.match(read("../app/layout.tsx"), /import "\.\/notebook-scene\.css"/);
  assert.match(preview, /<link rel="stylesheet" href="app\/notebook-scene\.css\?v=[^"]+" \/>\s*<\/head>/);
});

test("notebook and its surrounding objects use the measured reference geometry", () => {
  assert.match(rule(".desk-notebook"), /left: 50%;/);
  assert.match(rule(".desk-notebook"), /top: calc\(103 \* var\(--notebook-unit\)\);/);
  assert.match(rule(".desk-notebook"), /width: calc\(627 \* var\(--notebook-unit\)\);/);
  assert.match(rule(".desk-notebook"), /translateX\(-50%\) rotate\(-21deg\)/);
  assert.match(rule(".desk-pen"), /rotate\(6deg\)/);
  assert.match(rule(".desk-pen"), /object-fit: cover;/);
  assert.match(rule(".desk-coffee"), /translateY\(-50%\) rotate\(-46deg\)/);
  assert.match(rule(".desk-record"), /width: 240px;\s*height: 320px;/);
  assert.match(rule(".desk-record"), /rotate\(17deg\)/);
  assert.match(rule(".airdrop-card-live"), /width: 156px;\s*height: 165px;/);
  assert.match(rule(".hero-copy"), /top: calc\(320\.038 \* var\(--notebook-unit\)\)/);
  assert.match(rule(".hero-scene-controls"), /top: calc\(641 \* var\(--notebook-unit\)\)/);
});

test("the third scene reuses existing content and interactions", () => {
  assert.equal((preview.match(/<audio id="deskRecordAudio"/g) ?? []).length, 1);
  assert.equal((preview.match(/<button class="desk-object desk-record"/g) ?? []).length, 1);
  assert.equal((preview.match(/class="airdrop-card-live"/g) ?? []).length, 1);
  assert.match(preview, /data-scene-target="notebook"/);
  assert.match(page, /onClick=\{\(\) => setHeroScene\("notebook"\)\}/);
  assert.match(page, /onClick=\{toggleRecord\}/);
  assert.match(page, /onPointerEnter=\{queueRecordOnHover\}/);
  assert.match(preview, /Shiqi Wang/);
  assert.match(css, /@media \(max-width: 600px\)/);
});
