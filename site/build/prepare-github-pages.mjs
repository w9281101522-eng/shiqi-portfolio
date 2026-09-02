// Publish the approved preview homepage, not the older React homepage layout.
// Project detail pages remain the full Next static export, including their JS.
import { readFile, writeFile, mkdir, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const site = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(site, "pages-export");
const base = process.env.NEXT_PUBLIC_BASE_PATH || "/shiqi-portfolio";
assert.match(base, /^\/[a-zA-Z0-9_-]+$/);
await stat(path.join(output, "projects/kugou/index.html"));

function publishedHtml(html) {
  return html
    .replaceAll("/out/projects/", `${base}/projects/`)
    .replace(/(["'])(?:\.\/)?public\//g, `$1${base}/`)
    .replace(/(["'])app\//g, `$1${base}/app/`)
    .replace(/href="preview\.html(?=[#"])/g, `href="${base}/`)
    .replace(/href="beyond-design\.html/g, `href="${base}/beyond-design.html`);
}

const home = publishedHtml(await readFile(path.join(site, "preview.html"), "utf8"));
const beyond = publishedHtml(await readFile(path.join(site, "beyond-design.html"), "utf8"));
await writeFile(path.join(output, "index.html"), home);
await writeFile(path.join(output, "preview.html"), home);
await writeFile(path.join(output, "beyond-design.html"), beyond);
await mkdir(path.join(output, "beyond-design"), { recursive: true });
await writeFile(path.join(output, "beyond-design/index.html"), beyond);
for (const file of ["app/globals.css", "app/notebook-scene.css", "app/notebook-trail.css", "app/projects/project-navigation.css"]) {
  await mkdir(path.dirname(path.join(output, file)), { recursive: true });
  await copyFile(path.join(site, file), path.join(output, file));
}
await writeFile(path.join(output, ".nojekyll"), "");

// Fail publication instead of shipping missing local assets or broken links.
for (const [file, html] of [["index.html", home], ["beyond-design.html", beyond]]) {
  assert.ok(!html.includes("/out/projects/"));
  const urls = [...html.matchAll(/(?:src|href)="([^"#]+)[^"]*"/g)].map(match => match[1]);
  urls.push(...[...html.matchAll(/from\s+'([^']+)'/g)].map(match => match[1]));
  for (const value of urls) {
    if (/^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
    const url = new URL(value, `https://portfolio.example${base}/${file}`);
    assert.ok(url.pathname.startsWith(base + "/"), `Path escapes the GitHub project: ${value}`);
    let asset = decodeURIComponent(url.pathname.slice(base.length + 1));
    if (!asset || asset.endsWith("/")) asset += "index.html";
    await stat(path.join(output, asset));
  }
}
const kugou = await readFile(path.join(output, "projects/kugou/index.html"), "utf8");
assert.equal([...kugou.matchAll(/<img[^>]+section-\d+\.webp/g)].length, 21);
assert.ok(home.includes("data-scene-target=\"notebook\""));
assert.ok(home.includes(`${base}/notebook-trail.js`));
console.log("GitHub Pages ready: approved homepage, all project pages, 21 Kugou panels, working asset paths.");
