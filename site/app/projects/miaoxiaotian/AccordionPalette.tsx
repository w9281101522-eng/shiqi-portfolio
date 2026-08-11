"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { withBasePath } from "../../basePath";

type PaletteItem = readonly [name: string, hex: string, role: string];

const expressionImages = [
  withBasePath("/projects/miaoxiaotian/palette/expression-01.png"),
  withBasePath("/projects/miaoxiaotian/palette/expression-02.png"),
  withBasePath("/projects/miaoxiaotian/palette/expression-03.png"),
  withBasePath("/projects/miaoxiaotian/palette/expression-04.png"),
] as const;

export default function AccordionPalette({
  items,
  defaultIndex = 2,
}: {
  items: readonly PaletteItem[];
  defaultIndex?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className="mx-palette-accordion" aria-label="喵小甜 IP 色彩规范">
      {items.map(([name, hex, role], index) => {
        const active = index === activeIndex;

        return (
          <button
            className={`mx-palette-panel${active ? " is-active" : ""}`}
            key={hex}
            type="button"
            aria-pressed={active}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
            style={{ "--mx-palette-color": hex } as CSSProperties}
          >
            <span className="mx-palette-index">0{index + 1}</span>
            <span
              className="mx-palette-expression"
              aria-hidden="true"
              style={
                {
                  "--mx-palette-expression": `url(${expressionImages[index]})`,
                } as CSSProperties
              }
            />
            <span className="mx-palette-copy">
              <strong>{name}</strong>
              <span>{hex}</span>
              <small>{role}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
