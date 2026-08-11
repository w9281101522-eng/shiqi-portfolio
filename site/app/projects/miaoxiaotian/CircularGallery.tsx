// @ts-nocheck
"use client";

// The OGL classes are intentionally kept together here so the gallery remains
// self-contained and can be tuned as one visual component.
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import { useEffect, useRef } from "react";

type GalleryItem = {
  image: string;
  text: string;
  eyebrow: string;
  visualScale?: number;
};

type CircularGalleryProps = {
  items: GalleryItem[];
  bend?: number;
  scrollSpeed?: number;
  scrollEase?: number;
};

const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

function makeTextTexture(gl: WebGLRenderingContext, text: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  const font = '600 28px "PingFang SC", "Microsoft YaHei", sans-serif';
  context.font = font;
  const width = Math.ceil(context.measureText(text).width) + 48;
  canvas.width = width;
  canvas.height = 70;
  context.font = font;
  context.fillStyle = "#413c39";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, width / 2, 33);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width, height: canvas.height };
}

class GalleryTitle {
  mesh: Mesh;

  constructor(gl: WebGLRenderingContext, plane: Mesh, text: string) {
    const { texture, width, height } = makeTextTexture(gl, text);
    const geometry = new Plane(gl);
    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.08) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.mesh = new Mesh(gl, { geometry, program });
    const titleHeight = plane.scale.y * 0.085;
    this.mesh.scale.set(titleHeight * (width / height), titleHeight, 1);
    this.mesh.position.y = -plane.scale.y * 0.405;
    this.mesh.position.z = 0.02;
    this.mesh.setParent(plane);
  }
}

class GalleryMedia {
  extra = 0;
  width = 0;
  widthTotal = 0;
  x = 0;
  plane: Mesh;
  program: Program;
  title?: GalleryTitle;
  image: string;
  text: string;
  index: number;
  length: number;
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  bend: number;

  constructor({ gl, geometry, scene, image, text, index, length, screen, viewport, bend, visualScale = 1 }) {
    this.image = image;
    this.text = text;
    this.index = index;
    this.length = length;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;

    const texture = new Texture(gl, { generateMipmaps: true });
    this.program = new Program(gl, {
      depthTest: false,
      depthWrite: false,
      transparent: true,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uVisualScale;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.xy *= uVisualScale;
          p.z += sin(p.x * 3.2 + uTime) * (0.035 + min(abs(uSpeed), 0.18) * 0.12);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        varying vec2 vUv;

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          if (color.a < 0.015) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1, 1] },
        uSpeed: { value: 0 },
        uTime: { value: Math.random() * 100 },
        // Keep each outfit's relative correction (the farmer asset is slightly
        // larger at source), while making the whole cast feel more present.
        uVisualScale: { value: visualScale * 1.12 },
      },
    });

    const img = new Image();
    img.src = image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };

    this.plane = new Mesh(gl, { geometry, program: this.program });
    this.plane.setParent(scene);
    this.onResize();
    this.title = new GalleryTitle(gl, this.plane, text);
  }

  onResize(screen = this.screen, viewport = this.viewport) {
    this.screen = screen;
    this.viewport = viewport;
    const scale = Math.max(0.62, Math.min(1, screen.height / 760));
    this.plane.scale.y = viewport.height * 0.64 * scale;
    this.plane.scale.x = this.plane.scale.y * 0.62;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.width = this.plane.scale.x + 1.15;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }

  update(scroll: { current: number; last: number }, _direction: "left" | "right") {
    // Wrap every item into one continuous band.  The previous directional
    // swapping could move two duplicated items onto the same side during the
    // first frame, leaving a large gap on one edge and an overlap on the other.
    const span = this.widthTotal;
    const rawX = this.x - scroll.current;
    this.plane.position.x = span
      ? ((rawX + span / 2) % span + span) % span - span / 2
      : rawX;
    const x = this.plane.position.x;
    const half = this.viewport.width / 2;
    const radius = (half * half + this.bend * this.bend) / (2 * Math.abs(this.bend));
    const effectiveX = Math.min(Math.abs(x), half);
    const arc = radius - Math.sqrt(Math.max(0, radius * radius - effectiveX * effectiveX));
    this.plane.position.y = this.bend > 0 ? -arc : arc;
    this.plane.rotation.z = (this.bend > 0 ? -1 : 1) * Math.sign(x) * Math.asin(effectiveX / radius);

    const speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.025;
    this.program.uniforms.uSpeed.value = speed;

  }
}

class GalleryApp {
  container: HTMLDivElement;
  renderer: Renderer;
  gl: WebGLRenderingContext;
  camera: Camera;
  scene: Transform;
  medias: GalleryMedia[] = [];
  geometry: Plane;
  viewport = { width: 0, height: 0 };
  screen = { width: 0, height: 0 };
  scroll = { ease: 0.045, current: 0, target: 0, last: 0, position: 0 };
  scrollSpeed: number;
  isDown = false;
  start = 0;
  raf = 0;
  snapTimer = 0;

  constructor(container: HTMLDivElement, items: GalleryItem[], bend: number, scrollSpeed: number, scrollEase: number) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll.ease = scrollEase;
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    container.appendChild(this.gl.canvas);
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
    this.scene = new Transform();
    this.geometry = new Plane(this.gl, { heightSegments: 32, widthSegments: 64 });
    this.resize();

    const doubled = items.concat(items);
    this.medias = doubled.map((item, index) => new GalleryMedia({
      gl: this.gl,
      geometry: this.geometry,
      scene: this.scene,
      image: item.image,
      text: `${item.eyebrow}  ${item.text}`,
      index,
      length: doubled.length,
      screen: this.screen,
      viewport: this.viewport,
      bend,
      visualScale: item.visualScale,
    }));

    const initialOffset = (this.medias[0]?.width || 0) * items.length;
    this.scroll.current = initialOffset;
    this.scroll.target = initialOffset;
    this.scroll.last = initialOffset;
    this.scroll.position = initialOffset;

    window.addEventListener("resize", this.resize);
    container.addEventListener("wheel", this.onWheel, { passive: false });
    container.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    container.addEventListener("keydown", this.onKeyDown);
    this.update();
  }

  resize = () => {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: height * this.camera.aspect, height };
    this.medias.forEach((media) => media.onResize(this.screen, this.viewport));
  };

  snap = () => {
    const width = this.medias[0]?.width;
    if (!width) return;
    this.scroll.target = Math.round(this.scroll.target / width) * width;
  };

  onWheel = (event: WheelEvent) => {
    event.preventDefault();
    this.scroll.target += Math.sign(event.deltaY || event.deltaX) * this.scrollSpeed * 0.55;
    window.clearTimeout(this.snapTimer);
    this.snapTimer = window.setTimeout(this.snap, 160);
  };

  onPointerDown = (event: PointerEvent) => {
    this.isDown = true;
    this.start = event.clientX;
    this.scroll.position = this.scroll.target;
    this.container.classList.add("is-dragging");
  };

  onPointerMove = (event: PointerEvent) => {
    if (!this.isDown) return;
    this.scroll.target = this.scroll.position + (this.start - event.clientX) * 0.022 * this.scrollSpeed;
  };

  onPointerUp = () => {
    if (!this.isDown) return;
    this.isDown = false;
    this.container.classList.remove("is-dragging");
    this.snap();
  };

  onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const width = this.medias[0]?.width || 1;
    this.scroll.target += event.key === "ArrowRight" ? width : -width;
  };

  update = () => {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    this.medias.forEach((media) => media.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this.update);
  };

  destroy() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.snapTimer);
    window.removeEventListener("resize", this.resize);
    this.container.removeEventListener("wheel", this.onWheel);
    this.container.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    this.container.removeEventListener("keydown", this.onKeyDown);
    this.gl.canvas.remove();
  }
}

export default function CircularGallery({
  items,
  bend = 2.65,
  scrollSpeed = 1.75,
  scrollEase = 0.045,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const app = new GalleryApp(containerRef.current, items, bend, scrollSpeed, scrollEase);
    return () => app.destroy();
  }, [items, bend, scrollSpeed, scrollEase]);

  return (
    <div
      ref={containerRef}
      className="mx-circular-gallery"
      tabIndex={0}
      role="region"
      aria-label="喵小甜换装循环画廊，可拖动或使用左右方向键浏览"
    >
      <div className="mx-gallery-hint" aria-hidden="true">DRAG / SCROLL · LOOP</div>
    </div>
  );
}
