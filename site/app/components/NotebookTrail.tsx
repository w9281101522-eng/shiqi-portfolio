"use client";

import { useEffect, useRef } from "react";
import { attachNotebookTrail } from "../../public/notebook-trail.js";

export default function NotebookTrail() {
  const layerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const layer = layerRef.current;
    const root = layer?.closest<HTMLElement>("section#top");
    if (!root || !layer) return;
    return attachNotebookTrail(root, layer);
  }, []);
  return <div ref={layerRef} className="notebook-trail" aria-hidden="true" />;
}
