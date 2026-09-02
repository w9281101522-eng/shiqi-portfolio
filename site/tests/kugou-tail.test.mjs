import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file, encoding = "utf8") => readFile(new URL(`../${file}`, import.meta.url), encoding);
const added = [17, 18, 19, 20, 21];
const imageNumber = n => String(n).padStart(2, "0");

test("the source and static preview append five panels inside the existing artboard", async () => {
  const source = await read("app/projects/kugou/page.tsx");
  assert.match(source, /length: 21/);
  assert.match(source, /panelIndex === 21 \? 278 : 2048/);
  assert.match(source, /start=\{15\} end=\{21\}/);
  const html = (await read("out/projects/kugou/index.html")).split("<script>")[0];
  const panels = [...html.matchAll(/<img[^>]+src="([^"]*section-(\d+)\.webp)"[^>]*>/g)];
  assert.deepEqual(panels.map(panel => Number(panel[2])), Array.from({ length: 21 }, (_, i) => i + 1));
  const ending = html.slice(html.indexOf(panels[15][0]));
  assert.ok(ending.startsWith(panels.slice(15).map(panel => panel[0]).join("")), "No new wrapper, gap or divider at the join");
  for (const panel of panels.slice(16)) {
    assert.match(panel[0], /width="1567"/);
    assert.match(panel[0], /loading="lazy"/);
  }
  assert.match(panels.at(-1)[0], /height="278"/);
});

test("new images preserve their actual proportions and existing 16 panels are unchanged", async () => {
  for (let n = 1; n <= 21; n++) {
    const asset = `projects/kugou/sections/section-${imageNumber(n)}.webp`;
    const original = await read(`public/${asset}`, null);
    assert.deepEqual(await read(`out/${asset}`, null), original);
    if (!added.includes(n)) continue;
    let offset = 12;
    let dimensions;
    while (offset < original.length) {
      const type = original.toString("ascii", offset, offset + 4);
      const size = original.readUInt32LE(offset + 4);
      if (type === "VP8L") {
        const bits = original.readUInt32LE(offset + 9);
        dimensions = [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
        break;
      }
      offset += 8 + size + (size % 2);
    }
    assert.deepEqual(dimensions, [1567, n === 21 ? 278 : 2048]);
  }
});

test("both hydration and client-navigation data retain all five appended images", async () => {
  for (const file of ["index.txt", "__next._full.txt", "__next.projects/kugou/__PAGE__.txt"]) {
    const flight = await read(`out/projects/kugou/${file}`);
    for (const n of added) assert.ok(flight.includes(`section-${n}.webp`), `${file}: missing panel ${n}`);
  }
  const html = await read("out/projects/kugou/index.html");
  const payloads = [...html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?\])\)<\/script>/g)]
    .map(match => JSON.parse(match[1])).filter(payload => payload[0] === 1).map(payload => payload[1]).join("");
  for (const n of added) assert.ok(payloads.includes(`section-${n}.webp`));
});
