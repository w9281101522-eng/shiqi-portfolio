"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "../basePath";

type ProjectSlug = "color-call" | "kugou" | "moguding" | "miaoxiaotian";

type SectionLink = {
  href: string;
  label: string;
};

const projects = [
  { slug: "color-call", index: "01", name: "炫彩通话", href: "/projects/color-call" },
  { slug: "moguding", index: "02", name: "蘑菇丁", href: "/projects/moguding" },
  { slug: "kugou", index: "03", name: "酷狗音乐季", href: "/projects/kugou" },
  { slug: "miaoxiaotian", index: "04", name: "喵小甜 IP", href: "/projects/miaoxiaotian" },
] as const;

const dockSpring = { mass: 0.12, stiffness: 170, damping: 15 };

function ProjectSectionLink({
  item,
  mouseX,
  active,
  onActivate,
}: {
  item: SectionLink;
  mouseX: MotionValue<number>;
  active: boolean;
  onActivate: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const distance = useTransform(mouseX, (value) => {
    const rect = ref.current?.getBoundingClientRect();
    return rect ? value - (rect.left + rect.width / 2) : Number.POSITIVE_INFINITY;
  });
  const scaleTarget = useTransform(distance, [-140, 0, 140], [1, 1.18, 1]);
  const yTarget = useTransform(distance, [-140, 0, 140], [0, -4, 0]);
  const scale = useSpring(scaleTarget, dockSpring);
  const y = useSpring(yTarget, dockSpring);

  return (
    <motion.a
      ref={ref}
      href={item.href}
      style={{ scale, y }}
      data-active={active ? "true" : undefined}
      aria-current={active ? "location" : undefined}
      onClick={onActivate}
    >
      {item.label}
    </motion.a>
  );
}

function ProjectSectionDock({ links, label }: { links: SectionLink[]; label: string }) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const reduceMotion = useReducedMotion();
  const [activeHref, setActiveHref] = useState(links[0]?.href ?? "");

  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const marker = window.innerHeight * 0.34;
      let nextHref = links[0]?.href ?? "";

      for (const link of links) {
        const section = document.getElementById(link.href.replace(/^#/, ""));
        if (section && section.getBoundingClientRect().top <= marker) nextHref = link.href;
      }

      setActiveHref((currentHref) => (currentHref === nextHref ? currentHref : nextHref));
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [links]);

  return (
    <nav
      className="project-top-nav__links"
      aria-label={label}
      onMouseMove={(event) => mouseX.set(reduceMotion ? Number.POSITIVE_INFINITY : event.clientX)}
      onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
    >
      {links.map((item) => (
        <ProjectSectionLink
          key={item.href}
          item={item}
          mouseX={mouseX}
          active={activeHref === item.href}
          onActivate={() => setActiveHref(item.href)}
        />
      ))}
    </nav>
  );
}

function getProject(slug: ProjectSlug) {
  return projects.find((project) => project.slug === slug)!;
}

export function ProjectTopNav({
  current,
  links,
}: {
  current: ProjectSlug;
  links: SectionLink[];
}) {
  const project = getProject(current);

  return (
    <header className="project-top-nav" data-project={current}>
      <a className="project-top-nav__back" href={withBasePath("/#projects")}>
        <span aria-hidden="true">←</span>
        <span>返回作品集</span>
      </a>

      <ProjectSectionDock links={links} label={`${project.name}项目导航`} />

      <span className="project-top-nav__index">PROJECT {project.index}</span>
    </header>
  );
}

export function ProjectPager({ current }: { current: ProjectSlug }) {
  const currentIndex = projects.findIndex((project) => project.slug === current);
  const previous = projects[(currentIndex - 1 + projects.length) % projects.length];
  const next = projects[(currentIndex + 1) % projects.length];

  return (
    <nav className="project-pager" aria-label="浏览其他项目">
      <a href={withBasePath(previous.href)} className="project-pager__item project-pager__item--previous">
        <span className="project-pager__arrow" aria-hidden="true">←</span>
        <span className="project-pager__copy">
          <small>上一个项目</small>
          <strong>{previous.index} · {previous.name}</strong>
        </span>
      </a>

      <a href={withBasePath(next.href)} className="project-pager__item project-pager__item--next">
        <span className="project-pager__copy">
          <small>下一个项目</small>
          <strong>{next.index} · {next.name}</strong>
        </span>
        <span className="project-pager__arrow" aria-hidden="true">→</span>
      </a>
    </nav>
  );
}
