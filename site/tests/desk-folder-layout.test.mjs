import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("desktop desk folder moves another 15px left without changing height or other scenes", () => {
  const rule = css.match(/\.hero-scene-desk \.desk-folder \{([^}]+)\}/)?.[1];
  assert.ok(rule);
  const inset = Number(rule.match(/right: (\d+)px/)?.[1]);
  assert.equal(inset - 172, 15);
  assert.match(rule, /top: 425px;/);
  assert.doesNotMatch(rule, /(?:width|height|transform|translate|scale):/);
});
