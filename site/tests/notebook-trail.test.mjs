import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { attachNotebookCursor, attachNotebookTrail, TRAIL_OPTIONS } from "../public/notebook-trail.js";

class Events {
  listeners = new Map();
  addEventListener(name, fn) { if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name).add(fn); }
  removeEventListener(name, fn) { this.listeners.get(name)?.delete(fn); }
  fire(name, event = {}) { for (const fn of this.listeners.get(name) ?? []) fn(event); }
  count() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}

function setup() {
  const win = new Events(), doc = new Events(), root = new Events();
  const reduced = Object.assign(new Events(), { matches: false });
  const fine = Object.assign(new Events(), { matches: true });
  const frames = new Map();
  let nextFrame = 0, scene = "desk", observer;
  const layer = { children: [], animate() {}, append(image) { this.children.push(image); } };
  doc.defaultView = win;
  doc.hidden = false;
  doc.createElement = () => {
    const image = { style: {}, remove() { layer.children = layer.children.filter(child => child !== image); } };
    image.animate = (keyframes, options) => {
      image.animation = { keyframes, options, onfinish: null, cancelled: false, cancel() { this.cancelled = true; } };
      return image.animation;
    };
    return image;
  };
  win.matchMedia = query => query.includes("reduced") ? reduced : fine;
  win.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame; };
  win.cancelAnimationFrame = id => frames.delete(id);
  win.MutationObserver = class { constructor(fn) { observer = this; this.fn = fn; } observe() {} disconnect() { this.disconnected = true; } };
  root.ownerDocument = doc;
  root.classList = { contains: name => name === `hero-scene-${scene}` };
  root.clientLeft = 0; root.clientTop = 5; root.clientWidth = 1262; root.clientHeight = 1080;
  root.getBoundingClientRect = () => ({ left: 10, top: -200 });
  root.querySelector = selector => selector === ".desk-cursor" ? null : ({ complete: true, naturalWidth: 512, src: `/public/${selector.replace(/[^a-z]/g, "")}.png` });
  const dispose = attachNotebookTrail(root, layer);
  return {
    root, layer, win, doc, frames, reduced, fine, dispose,
    scene(value) { scene = value; observer.fn(); },
    move(x, y = 120, extra = {}) { root.fire("pointermove", { clientX: x, clientY: y, pointerType: "mouse", buttons: 0, target: { closest: () => null }, ...extra }); },
    tick(time) { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(time)); },
    observer: () => observer,
  };
}

test("only mouse movement in the third scene emits, with correct scrolled coordinates", () => {
  const h = setup();
  h.move(200); assert.equal(h.frames.size, 0);
  h.scene("tidy"); h.move(200); assert.equal(h.frames.size, 0);
  h.scene("notebook");
  h.move(200, 120, { pointerType: "touch" }); assert.equal(h.frames.size, 0);
  h.move(200); h.tick(100);
  assert.equal(h.layer.children.length, 1);
  assert.match(h.layer.children[0].style.cssText, /left:190px;top:315px;/);
  assert.equal(h.layer.children[0].alt, "");
  h.move(205); h.tick(200); assert.equal(h.layer.children.length, 1);
  h.move(270); h.tick(210); assert.equal(h.layer.children.length, 2);
  h.move(400); h.tick(220); assert.equal(h.layer.children.length, 2);
  assert.equal(h.frames.size, 0, "no idle animation loop");
  h.dispose();
});

test("repeated pointer events are coalesced and the trail is bounded and fades away", () => {
  const h = setup(); h.scene("notebook");
  h.move(100); h.move(110); h.move(120); assert.equal(h.frames.size, 1);
  h.tick(0);
  for (let i = 1; i < 30; i++) { h.move(100 + i * 71 % 1000); h.tick(i * 90); }
  assert.equal(h.layer.children.length, TRAIL_OPTIONS.limit);
  assert.ok(new Set(h.layer.children.map(image => image.src)).size > 1);
  assert.ok(h.layer.children.every(image => !image.src.includes("cursor")));
  for (const image of [...h.layer.children]) {
    assert.equal(image.animation.options.duration, TRAIL_OPTIONS.lifetime);
    assert.equal(image.animation.keyframes.at(-1).opacity, 0);
    image.animation.onfinish();
  }
  assert.equal(h.layer.children.length, 0);
  h.dispose();
});

test("scene changes, pointer exit, scrolling and reduced motion clear pending and live items", () => {
  const h = setup();
  for (const clear of [() => h.scene("desk"), () => h.root.fire("pointerleave"), () => h.win.fire("scroll"), () => { h.reduced.matches = true; h.reduced.fire("change"); }]) {
    h.reduced.matches = false; h.scene("notebook");
    h.move(200); h.tick(100); h.move(400);
    clear();
    assert.equal(h.layer.children.length, 0); assert.equal(h.frames.size, 0);
  }
  h.move(300); assert.equal(h.frames.size, 0);
  h.reduced.matches = false; h.fine.matches = false; h.move(300); assert.equal(h.frames.size, 0);
  h.dispose();
});

test("interactive controls and dragging stay untouched; disposing removes all listeners", () => {
  const h = setup(); h.scene("notebook");
  h.move(200, 120, { target: { closest: () => ({}) } }); h.tick(100);
  h.move(300, 120, { buttons: 1 }); h.tick(200);
  assert.equal(h.layer.children.length, 0);
  h.move(400); h.tick(300); h.move(500); h.dispose();
  assert.equal(h.frames.size, 0); assert.equal(h.layer.children.length, 0);
  for (const target of [h.root, h.win, h.doc, h.reduced, h.fine]) assert.equal(target.count(), 0);
  assert.equal(h.observer().disconnected, true);
  h.dispose();
});

test("preview and React use the same engine and a non-interactive decorative layer", () => {
  const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
  assert.match(read("../preview.html"), /import \{ attachNotebookTrail \} from '.\/public\/notebook-trail.js/);
  assert.match(read("../app/components/NotebookTrail.tsx"), /return attachNotebookTrail\(root, layer\)/);
  assert.match(read("../app/components/NotebookTrail.tsx"), /aria-hidden="true"/);
  const css = read("../app/notebook-trail.css");
  assert.match(css, /pointer-events: none;/);
  assert.match(css, /#top.hero-scene-notebook > .notebook-trail \{ display: block; \}/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("native cursor reuses the original image with a bounded bitmap and precise hotspot", () => {
  const source = Object.assign(new Events(), { complete: false, naturalWidth: 354 });
  const properties = new Map(), attributes = new Map();
  const draws = [];
  const context = { drawImage: (...args) => draws.push(args), imageSmoothingEnabled: true };
  const canvas = { getContext: () => context, toDataURL: () => "data:image/png;base64,test" };
  const root = {
    querySelector: selector => selector === ".desk-cursor" ? source : null,
    ownerDocument: { createElement: () => canvas },
    style: { setProperty: (name, value) => properties.set(name, value), removeProperty: name => properties.delete(name) },
    setAttribute: (name, value) => attributes.set(name, value), removeAttribute: name => attributes.delete(name),
  };
  const dispose = attachNotebookCursor(root);
  assert.equal(attributes.size, 0, "keep the system cursor until the artwork is loaded");
  source.complete = true; source.fire("load");
  assert.equal(canvas.width, 96); assert.equal(canvas.height, 96);
  assert.equal(context.imageSmoothingEnabled, false);
  assert.deepEqual(draws[0], [source, 0, 0, 96, 96]);
  assert.equal(properties.get("--notebook-pointer"), 'url("data:image/png;base64,test") 34 17, auto');
  assert.equal(attributes.get("data-notebook-cursor"), "ready");
  dispose();
  assert.equal(source.count(), 0); assert.equal(properties.size, 0); assert.equal(attributes.size, 0);
  source.fire("load"); assert.equal(attributes.size, 0);
  const css = readFileSync(new URL("../app/notebook-trail.css", import.meta.url), "utf8");
  assert.match(css, /#top\.hero-scene-notebook\[data-notebook-cursor="ready"\] \*/);
  assert.match(css, /cursor: var\(--notebook-pointer, auto\) !important/);
  const engine = readFileSync(new URL("../public/notebook-trail.js", import.meta.url), "utf8");
  assert.doesNotMatch(engine.match(/const ASSETS = \[([\s\S]*?)\];/)[1], /desk-cursor/);
});

test("unavailable canvas preserves the normal pointer without breaking the trail", () => {
  const source = Object.assign(new Events(), { complete: true, naturalWidth: 354 });
  const root = {
    querySelector: () => source,
    ownerDocument: { createElement: () => ({ getContext: () => null }) },
    setAttribute: () => assert.fail("cursor must not be hidden on failure"),
  };
  const dispose = attachNotebookCursor(root);
  dispose(); assert.equal(source.count(), 0);
});
