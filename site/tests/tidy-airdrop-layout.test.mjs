import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const preview = readFileSync(new URL("../preview.html", import.meta.url), "utf8");

test("tidy airdrop bottom aligns with the visible folder without resizing either", () => {
  const start = css.indexOf("html body section#top.hero-scene-tidy .airdrop-card-live {");
  assert.ok(start >= 0);
  const rule = css.slice(start, css.indexOf("}", start));
  assert.match(rule, /top: calc\(var\(--tidy-folder-top, calc\(68% \+ 50px\)\) \+ 160px - var\(--tidy-secondary-card-h\)\) !important;/);
  assert.match(rule, /right: calc\(5% \+ var\(--tidy-secondary-card-w\) \+ 22px\) !important;/);
  assert.doesNotMatch(rule, /(?:width|height|transform|scale):/);
  assert.match(preview, /#top\.hero-scene-tidy \{ --tidy-folder-top: 644px; \}/);
  assert.match(preview, /left: calc\(100% - 230px\) !important; right: auto !important; top: var\(--tidy-folder-top\) !important; width: 192px !important; height: 194px !important;/);
  assert.match(css, /top: var\(--tidy-folder-top, calc\(68% \+ 50px\)\) !important;/);
  assert.match(css, /\.rb-folder-stage \{ width: 100px; height: 80px;/);
  assert.match(preview, /class="rb-folder-host desk-folder" style="--folder-scale:2"/);
  for (const viewportWidth of [1000, 1262, 1600]) {
    const cardHeight = Math.min(198, Math.max(174, viewportWidth * 0.15));
    const top = 644 + 80 * 2 - cardHeight;
    assert.equal(top + cardHeight, 804);
    assert.equal(top - (594 + 80 * 2 - cardHeight), 50);
  }
});

test("tidy folder uses a responsive 30px right inset without moving the airdrop", () => {
  assert.match(css, /html body section#top\.hero-scene-tidy \.desk-folder \{\s*\/\*[^]*?\*\/\s*left: calc\(100% - 230px\) !important;\s*right: auto !important;/);
  assert.match(preview, /right: 30px !important;/);
  for (const viewportWidth of [1000, 1262, 1440, 1600]) {
    const visibleRight = viewportWidth - 230 + 100 * 2;
    assert.equal(viewportWidth - visibleRight, 30);
  }
});
