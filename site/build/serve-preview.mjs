import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const roots = [siteRoot, join(siteRoot, "public"), join(siteRoot, "out")];
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function findFile(pathname) {
  const relative = pathname.replace(/^\/+/, "");
  for (const root of roots) {
    let file = resolve(root, relative);
    if (file !== root && !file.startsWith(root + sep)) continue;
    try {
      let details = await stat(file);
      if (details.isDirectory()) {
        file = join(file, "index.html");
        details = await stat(file);
      }
      if (details.isFile()) return { file, size: details.size };
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
    }
  }
  return null;
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname === "/" ? "/preview.html" : url.pathname);
    const found = await findFile(pathname);
    if (!found) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const headers = {
      "Content-Type": mimeTypes[extname(found.file).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "Accept-Ranges": "bytes",
    };
    let start = 0;
    let end = found.size - 1;
    let status = 200;
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range ?? "");
    if (range) {
      if (range[1] === "" && range[2] !== "") {
        start = Math.max(0, found.size - Number(range[2]));
      } else {
        start = Number(range[1]);
        if (range[2] !== "") end = Math.min(end, Number(range[2]));
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= found.size) {
        response.writeHead(416, { "Content-Range": `bytes */${found.size}` });
        response.end();
        return;
      }
      status = 206;
      headers["Content-Range"] = `bytes ${start}-${end}/${found.size}`;
    }
    headers["Content-Length"] = end - start + 1;
    response.writeHead(status, headers);
    if (request.method === "HEAD") response.end();
    else createReadStream(found.file, { start, end }).pipe(response);
  } catch (error) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Invalid request");
    console.error(error);
  }
});

const port = Number(process.env.PORT ?? 4173);
server.listen(port, "127.0.0.1", () => {
  console.log(`Preview ready at http://127.0.0.1:${port}/preview.html`);
});
