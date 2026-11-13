import { readdir, readFile, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

process.env.CLOUDFLARE_PAGES_EXPORT = "true";
await import("./prepare-github-pages.mjs");
const output = fileURLToPath(new URL("../cloudflare-export/", import.meta.url));
async function filesIn(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(file));
    else files.push(file);
  }
  return files;
}
const files = await filesIn(output);
const text = (await Promise.all(files.filter(file => /\.(html|js|css|json|txt)$/.test(file)).map(file => readFile(file, "utf8")))).join("\n");
for (const file of files) {
  if ((await stat(file)).size <= 25 * 1024 * 1024) continue;
  // Only omit this unused source PDF from the generated upload directory.
  // Its original in public/ remains untouched; the website uses image panels.
  assert.equal(file, path.join(output, "projects/moguding/moguding-portfolio.pdf"));
  assert.ok(!text.includes("moguding-portfolio.pdf"), "Cannot omit a referenced asset");
  await unlink(file);
  console.log("Excluded unused original PDF from upload only; source preserved.");
}
assert.ok(!text.includes("/shiqi-portfolio/"), "Cloudflare output must not depend on the GitHub subpath");
console.log(`Cloudflare upload validated (${files.length} files checked).`);
