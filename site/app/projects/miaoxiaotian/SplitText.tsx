"use client";

import { createElement, useEffect, useRef } from "react";
import { gsap } from "gsap";

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number;
  as?: "p" | "span" | "strong";
};

export default function SplitText({
  text,
  className = "",
  delay = 34,
  as = "p",
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const characters = element.querySelectorAll<HTMLElement>("[data-char]");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gsap.fromTo(
          characters,
          { opacity: 0, yPercent: 75, rotate: 2 },
          {
            opacity: 1,
            yPercent: 0,
            rotate: 0,
            duration: 0.72,
            stagger: delay / 1000,
            ease: "power3.out",
            force3D: true,
          },
        );
        observer.disconnect();
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay, text]);

  return createElement(
    as,
    { ref, className, "aria-label": text },
    Array.from(text).map((character, index) => (
      <span data-char aria-hidden="true" key={`${character}-${index}`}>
        {character === " " ? "\u00a0" : character}
      </span>
    )),
  );
}
