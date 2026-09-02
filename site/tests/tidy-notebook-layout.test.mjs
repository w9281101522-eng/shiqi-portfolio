import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const preview = readFileSync(new URL("../preview.html", import.meta.url), "utf8");
function rule(name) {
  const start = css.indexOf(`html body section#top.hero-scene-tidy .desk-${name} {`);
  assert.ok(start >= 0);
  const body = css.slice(start, css.indexOf("}", start));
  return property => Number.parseFloat(body.match(new RegExp(`${property}:\\s*([^;]+)`))[1]);
}

test("notebook, stain and cream keep their enlarged proportions and move upward together", () => {
  const book = rule("notebook");
  const coffee = rule("coffee");
  assert.equal(book("left"), 0);
  assert.equal(book("top"), 585 - 64);
  assert.equal(coffee("top"), 643.3 - 64);
  assert.ok(Math.abs(book("width") / 366 - 1.1) < 0.0001);
  assert.ok(Math.abs(coffee("width") / 120 - 1.1) < 0.0001);
  assert.equal(coffee("height"), coffee("width"));
  assert.ok(Math.abs((coffee("left") - book("left")) / 190 - 1.1) < 0.0001);
  assert.ok(Math.abs((coffee("top") - book("top")) / (638 - 585) - 1.1) < 0.0001);
  assert.ok(Math.abs(rule("cream")("width") / 144 - 1.1) < 0.0001);
  assert.equal(rule("cream")("top"), 690 - 64);
});

test("preview has no conflicting notebook or stain geometry", () => {
  const styles = [...preview.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]).join("\n");
  assert.doesNotMatch(styles, /\.desk-(?:notebook|book|coffee)(?![\w-])/);
});
