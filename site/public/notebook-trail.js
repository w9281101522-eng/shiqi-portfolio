// Shared by the React homepage and the standalone preview. Decorative only:
// reuse image sources, never clone the interactive cards or move the originals.
export const TRAIL_OPTIONS = Object.freeze({ distance: 58, interval: 70, lifetime: 1150, limit: 10 });

const ASSETS = [
  [".desk-note", 116, 92],
  [".desk-film", 132, 140],
  [".desk-lighter", 114, 164],
  [".desk-cream", 110, 156],
  [".desk-coffee", 110, 110],
  [".desk-record-vinyl img", 104, 104],
];

/** Use the existing artwork as a native cursor, with its arrow tip as the hotspot.
 * The 96px canvas stays within browser cursor-image limits (the source is 354px).
 * @param {HTMLElement} root
 */
export function attachNotebookCursor(root) {
  const source = root.querySelector(".desk-cursor");
  if (!source) return () => {};
  let disposed = false;
  let installed = false;
  function install() {
    if (disposed || !source.complete || !source.naturalWidth) return;
    try {
      const canvas = root.ownerDocument.createElement("canvas");
      canvas.width = 96;
      canvas.height = 96;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.imageSmoothingEnabled = false;
      context.drawImage(source, 0, 0, 96, 96);
      root.style.setProperty("--notebook-pointer", `url("${canvas.toDataURL("image/png")}") 34 17, auto`);
      root.setAttribute("data-notebook-cursor", "ready");
      installed = true;
    } catch {
      // Retain the system cursor if the image cannot be decoded or exported.
    }
  }
  source.addEventListener("load", install);
  install();
  return () => {
    disposed = true;
    source.removeEventListener("load", install);
    if (installed) {
      root.style.removeProperty("--notebook-pointer");
      root.removeAttribute("data-notebook-cursor");
    }
  };
}

/** @param {HTMLElement} root @param {HTMLElement} layer */
export function attachNotebookTrail(root, layer) {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const disposeCursor = attachNotebookCursor(root);
  if (!win || !layer.animate) return disposeCursor;
  const reducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = win.matchMedia("(hover: hover) and (pointer: fine)");
  const items = new Set();
  let frame = 0;
  let pending = null;
  let last = null;
  let lastTime = -Infinity;
  let index = 0;
  let disposed = false;

  const enabled = () => !disposed && root.classList.contains("hero-scene-notebook") &&
    !doc.hidden && !reducedMotion.matches && finePointer.matches;

  function remove(item) {
    item.animation.onfinish = null;
    item.animation.cancel();
    item.image.remove();
    items.delete(item);
  }

  function clear() {
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    pending = null;
    last = null;
    lastTime = -Infinity;
    for (const item of items) remove(item);
  }

  function emit(point, time) {
    const rect = root.getBoundingClientRect();
    const x = point.x - rect.left - root.clientLeft;
    const y = point.y - rect.top - root.clientTop;
    if (x < 0 || y < 0 || x > root.clientWidth || y > root.clientHeight) return;
    const distance = last ? Math.hypot(point.x - last.x, point.y - last.y) : Infinity;
    if (distance < TRAIL_OPTIONS.distance || time - lastTime < TRAIL_OPTIONS.interval) return;
    const [selector, width, height] = ASSETS[index % ASSETS.length];
    const source = root.querySelector(selector);
    if (!source?.complete || !source.naturalWidth) return;
    const image = doc.createElement("img");
    image.className = "notebook-trail-item";
    image.alt = "";
    image.draggable = false;
    image.src = source.currentSrc || source.src;
    const angle = ((index * 37) % 49) - 24;
    const driftX = last ? Math.max(-18, Math.min(18, (point.x - last.x) * .12)) : 0;
    image.style.cssText = `left:${x}px;top:${y}px;width:${width}px;height:${height}px;`;
    while (items.size >= TRAIL_OPTIONS.limit) remove(items.values().next().value);
    layer.append(image);
    const pose = (dx, dy, rotation, scale) => `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rotation}deg) scale(${scale})`;
    const animation = image.animate([
      { opacity: 0, transform: pose(0, 0, angle - 8, .45), offset: 0 },
      { opacity: .96, transform: pose(0, 0, angle, 1), offset: .16 },
      { opacity: .9, transform: pose(driftX * .3, 4, angle + 3, 1), offset: .48 },
      { opacity: 0, transform: pose(driftX, 22, angle + 10, .72), offset: 1 },
    ], { duration: TRAIL_OPTIONS.lifetime, easing: "cubic-bezier(.22,.61,.36,1)", fill: "forwards" });
    const item = { image, animation };
    items.add(item);
    animation.onfinish = () => remove(item);
    index++;
    last = point;
    lastTime = time;
  }

  function render(time) {
    frame = 0;
    const point = pending;
    pending = null;
    if (point && enabled()) emit(point, time);
  }

  function move(event) {
    if (!enabled() || event.pointerType !== "mouse" || event.buttons) return;
    if (event.target.closest?.('button, a, input, textarea, select, [role="button"], [contenteditable="true"], .hero-scene-controls')) {
      pending = null;
      last = null;
      return;
    }
    pending = { x: event.clientX, y: event.clientY };
    if (!frame) frame = win.requestAnimationFrame(render);
  }

  const onSceneChange = () => { if (!enabled()) clear(); };
  const observer = new win.MutationObserver(onSceneChange);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  root.addEventListener("pointermove", move, { passive: true });
  root.addEventListener("pointerleave", clear);
  root.addEventListener("pointercancel", clear);
  win.addEventListener("blur", clear);
  win.addEventListener("resize", clear);
  win.addEventListener("scroll", clear, { passive: true, capture: true });
  doc.addEventListener("visibilitychange", clear);
  reducedMotion.addEventListener("change", clear);
  finePointer.addEventListener("change", clear);

  return () => {
    disposed = true;
    disposeCursor();
    clear();
    observer.disconnect();
    root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerleave", clear);
    root.removeEventListener("pointercancel", clear);
    win.removeEventListener("blur", clear);
    win.removeEventListener("resize", clear);
    win.removeEventListener("scroll", clear, true);
    doc.removeEventListener("visibilitychange", clear);
    reducedMotion.removeEventListener("change", clear);
    finePointer.removeEventListener("change", clear);
  };
}
