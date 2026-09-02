import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const preview = readFileSync(new URL("../preview.html", import.meta.url), "utf8");

test("pen and toolbar shift a further 80px right as a group, preserving size and spacing", () => {
  const centres = [];
  for (const [name, width, height, bounds] of [
    ["pen", 512, 512, [226, 11, 280, 503]],
    ["toolbar", 282, 1013, [27, 39, 265, 969]],
  ]) {
    const selector = `html body section#top.hero-scene-tidy .desk-${name} {`;
    const start = css.indexOf(selector);
    assert.ok(start >= 0);
    const rule = css.slice(start, css.indexOf("}", start));
    const size = Number.parseFloat(rule.match(/width:\s*([^;]+)/)[1]);
    const position = rule.match(/left:\s*calc\(([\d.]+)% \+ ([\d.]+)px\)/);
    assert.ok(position, "tool uses an explicit shared horizontal shift");
    assert.equal(Number(position[1]), name === "pen" ? 61.830428 : 71.830428);
    assert.equal(Number(position[2]), 120);
    const centre = Number(position[1]) * 1262 / 100 + Number(position[2]);
    centres.push(centre);
    const scale = size / width;
    const visibleHeight = (bounds[3] - bounds[1]) * scale;
    const visibleWidth = (bounds[2] - bounds[0]) * scale;
    assert.ok(Math.abs(visibleHeight - 240) < 0.01, name);
    assert.ok(centre - visibleWidth / 2 >= 874);
    assert.ok(centre + visibleWidth / 2 <= 1064);
    assert.ok(212 - visibleHeight / 2 >= 90);
    assert.ok(212 + visibleHeight / 2 <= 342);
    const anchors = rule.match(/translate:\s*-([\d.]+)% -([\d.]+)%/);
    assert.ok(Math.abs(Number(anchors[1]) / 100 * width - (bounds[0] + bounds[2]) / 2) < 0.01);
    assert.ok(Math.abs(Number(anchors[2]) / 100 * height - (bounds[1] + bounds[3]) / 2) < 0.01);
  }
  assert.ok(Math.abs((centres[0] + centres[1]) / 2 - (859.4 + 24 + 80)) < 0.01, "group shares the cursor's additional 80px shift");
  assert.ok(Math.abs(centres[1] - centres[0] - 126.2) < 0.01, "approved gap stays unchanged");
  assert.match(css, /top: 212px;/);
});

test("preview shares tool geometry without competing inline rules", () => {
  const styles = [...preview.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]).join("\n");
  assert.doesNotMatch(styles, /\.desk-(?:pen|toolbar|cursor|cream)(?![\w-])/);
  assert.match(css, /\.desk-toolbar:hover \{ animation: desk-toolbar-breathe/);
});

test("cursor right artwork edge meets the annotation and keeps bottom alignment", () => {
  const start = css.indexOf("html body section#top.hero-scene-tidy .desk-cursor {");
  assert.ok(start >= 0);
  const rule = css.slice(start, css.indexOf("}", start));
  const value = property => Number.parseFloat(rule.match(new RegExp(`${property}:\\s*([^;]+)`))[1]);
  const scale = value("width") / 354;
  const anchors = rule.match(/translate:\s*-([\d.]+)% -([\d.]+)%/);
  const position = rule.match(/left:\s*calc\(([\d.]+)% \+ ([\d.]+)px\)/);
  assert.equal(Number(position[1]), 83);
  assert.equal(Number(position[2]), 144);
  const x = Number(position[1]) * 1262 / 100 + Number(position[2]) - Number(anchors[1]) / 100 * value("width") + 170.5 * scale;
  const y = value("top") - Number(anchors[2]) / 100 * 353 * scale + 170.5 * scale;
  const height = 217 * scale;
  const width = 157 * scale;
  assert.ok(Math.abs(height - 60) < 0.01);
  assert.ok(Math.abs(x - (1087.46 + 24 + 80)) < 0.01);
  assert.ok(Math.abs(y - 302) < 0.01);
  const rightEdge = x + width / 2;
  assert.ok(rightEdge >= 1211.4 && rightEdge <= 1214.6, "visible right edge falls on the annotated vertical line");
  assert.ok(Math.abs(y + height / 2 - (212 + 240 / 2)) < 0.01, "all three visible bottoms align");
});

test("tidy cream is enlarged uniformly and counters the original tube tilt", () => {
  const start = css.indexOf("html body section#top.hero-scene-tidy .desk-cream {");
  assert.ok(start >= 0);
  const rule = css.slice(start, css.indexOf("}", start));
  assert.match(rule, /width: 158.4px;/);
  assert.match(rule, /height: auto;/);
  assert.match(rule, /rotate: -33deg;/);
  assert.match(rule, /translate: -50% -50%;/);
  assert.match(rule, /top: 626px;/);
  assert.match(rule, /transform: none;/);
});
