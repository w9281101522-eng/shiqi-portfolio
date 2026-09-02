import "./color-call.css";
import { ProjectPager, ProjectTopNav } from "../ProjectNavigation";
import { withBasePath } from "../../basePath";

export const metadata = {
  title: "炫彩通话｜Shiqi Wang",
  description: "炫彩通话小程序的产品体验与交互设计项目。",
};

const panels = Array.from({ length: 10 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  const cacheVersion = index >= 8 ? "?v=20260831-seam-fix" : "";
  return withBasePath(`/projects/color-call/sections/section-${number}.webp${cacheVersion}`);
});

const panelDescriptions = [
  "炫彩通话项目封面与项目背景",
  "设计目标与降低用户使用门槛的简化流程",
  "针对式内容推荐与首页信息结构",
  "首页内容分发与情感化卡片推荐",
  "用户浏览体验问题与优化方案",
  "视频播放与内容切换体验优化",
  "播放过程、状态反馈与交互路径优化",
  "发布与分享流程的用户体验设计",
  "视频二次创作与内容传播体验",
  "评论互动、消息触达与项目总结",
];

const panelHeights = [2048, 2048, 2048, 2048, 2048, 2048, 2048, 2048, 1750, 1896];

function PanelRange({
  start,
  end,
  id,
  label,
}: {
  start: number;
  end: number;
  id?: string;
  label: string;
}) {
  return (
    <section className="cc-panel-range" id={id} aria-label={label}>
      {panels.slice(start - 1, end).map((src, localIndex) => {
        const panelIndex = start + localIndex;
        return (
          <img
            key={src}
            src={src}
            alt={panelDescriptions[panelIndex - 1]}
            width={1920}
            height={panelHeights[panelIndex - 1]}
            loading={panelIndex <= 2 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={panelIndex === 1 ? "high" : "auto"}
            draggable={false}
          />
        );
      })}
    </section>
  );
}

export default function ColorCallProjectPage() {
  return (
    <main className="cc-page" id="top">
      <ProjectTopNav
        current="color-call"
        links={[
          { href: "#top", label: "背景" },
          { href: "#background", label: "引导" },
          { href: "#browse", label: "创作" },
          { href: "#share", label: "社交" },
        ]}
      />

      <div className="cc-artboard">
        <PanelRange start={1} end={1} label="项目封面" />
        <PanelRange start={2} end={2} id="background" label="项目背景与设计目标" />
        <PanelRange start={3} end={4} id="flow" label="流程简化与内容推荐" />
        <PanelRange start={5} end={5} id="browse" label="用户浏览体验优化" />
        <PanelRange start={6} end={7} id="interaction" label="视频播放与交互体验优化" />
        <PanelRange start={8} end={10} id="share" label="发布分享、二次创作与互动体验" />
      </div>

      <ProjectPager current="color-call" />

      <a className="cc-top-link" href="#top" aria-label="回到页面顶部">
        ↑
      </a>
    </main>
  );
}
