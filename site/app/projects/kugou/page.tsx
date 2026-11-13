import "./kugou.css";
import { ProjectPager, ProjectTopNav } from "../ProjectNavigation";
import { withBasePath } from "../../basePath";

export const metadata = {
  title: "酷狗寻音记｜Shiqi Wang",
  description: "酷狗音乐寻音季运营活动视觉与交互体验设计。",
};

const panels = Array.from({ length: 21 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return withBasePath(`/projects/kugou/sections/section-${number}.webp?v=20261111-kugou`);
});

const panelDescriptions = [
  "酷狗寻音记活动主视觉与设计背景",
  "设计目标与雷达图",
  "设计策略与创意视觉",
  "活动主视觉手机页面",
  "颜色质感与酷狗角色视觉延展",
  "触心共跃主会场页面设计",
  "主会场商品区与游戏沉浸体验",
  "猜歌游戏页面拆解与游戏链路",
  "匹配成功与匹配失败弹窗",
  "对战结果弹窗与情绪反馈",
  "活动触达入口与换装引导",
  "用户留存与服装获得界面",
  "服装界面与更多角色服饰",
  "图鉴界面与玩法机制",
  "项目总结与工作成果",
  "酷狗寻音记项目视觉总览",
  "品牌基因强化、IP 形象与 AIGC 设计",
  "AIGC 资产搭建与应用策略",
  "模型训练流程与良品率测试",
  "ComfyUI 生图工作流与 AI 资产展示",
  "AI 角色资产展示与项目结尾",
];

const panelAnchors: Record<number, string> = {
  1: "background",
  3: "strategy",
  7: "experience",
  12: "retention",
  15: "summary",
};

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
    <section className="kg-panel-range" id={id} aria-label={label}>
      {panels.slice(start - 1, end).map((src, localIndex) => {
        const panelIndex = start + localIndex;
        return (
          <img
            key={src}
            id={panelAnchors[panelIndex]}
            src={src}
            alt={panelDescriptions[panelIndex - 1]}
            width={1567}
            height={panelIndex === 21 ? 286 : 2048}
            loading={panelIndex <= 2 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
          />
        );
      })}
    </section>
  );
}

export default function KugouProjectPage() {
  return (
    <main className="kg-page" id="top">
      <ProjectTopNav
        current="kugou"
        links={[
          { href: "#background", label: "背景" },
          { href: "#strategy", label: "策略" },
          { href: "#experience", label: "体验" },
          { href: "#retention", label: "留存" },
          { href: "#summary", label: "总结" },
        ]}
      />

      <div className="kg-artboard">
        <PanelRange start={1} end={1} label="项目封面与设计背景" />
        <PanelRange start={2} end={3} label="设计背景、目标与策略" />
        <PanelRange start={4} end={5} label="创意视觉与颜色质感" />
        <PanelRange start={6} end={10} label="主会场、游戏链路与弹窗体验" />
        <PanelRange start={11} end={14} label="触达入口、用户留存、换装与图鉴" />
        <PanelRange start={15} end={21} label="项目总结与视觉总览" />
      </div>

      <ProjectPager current="kugou" />

      <a className="kg-top-link" href="#top" aria-label="回到页面顶部">
        ↑
      </a>
    </main>
  );
}
