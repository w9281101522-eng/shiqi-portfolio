import "./moguding.css";
import { ProjectPager, ProjectTopNav } from "../ProjectNavigation";
import { withBasePath } from "../../basePath";

export const metadata = {
  title: "蘑菇丁实习招聘体验设计｜Shiqi Wang",
  description:
    "蘑菇丁实习招聘产品的视觉体系、职位匹配、企业信息与简历填写体验优化项目。",
};

const panels = Array.from({ length: 29 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return withBasePath(`/projects/moguding/sections-png/section-${number}.png`);
});

const panelDescriptions = [
  "蘑菇丁实习招聘体验设计项目封面",
  "项目介绍与设计背景",
  "用户与产品问题分析",
  "视觉方向与设计概念",
  "品牌视觉与组件语言",
  "整体产品视觉规范",
  "职位匹配体验问题分析",
  "职位筛选体验优化",
  "职位信息层级与页面调整",
  "职位列表页面设计方案",
  "职位详情与信息呈现",
  "岗位匹配与推荐策略",
  "职位场景页面展示",
  "职位匹配模块阶段总结",
  "企业信息体验问题分析",
  "企业信息结构与展示策略",
  "企业主页信息优化",
  "企业详情页面视觉方案",
  "企业相关页面流程",
  "企业体验关键页面展示",
  "企业信息模块阶段总结",
  "企业体验设计成果",
  "简历填写体验问题分析",
  "简历填写引导机制",
  "简历内容模板与参考方案",
  "简历流程和页面优化",
  "简历填写关键页面展示",
  "简历体验数据成果",
  "蘑菇丁项目总结与页面总览",
];

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
    <section className="mgd-panel-range" id={id} aria-label={label}>
      {panels.slice(start - 1, end).map((src, localIndex) => {
        const panelIndex = start + localIndex;
        const isFinalPanel = panelIndex === panels.length;

        return (
          <img
            key={src}
            src={src}
            alt={panelDescriptions[panelIndex - 1]}
            width={1924}
            height={isFinalPanel ? 2733 : 4096}
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

export default function MogudingProjectPage() {
  return (
    <main className="mgd-page" id="top">
      <ProjectTopNav
        current="moguding"
        links={[
          { href: "#background", label: "背景" },
          { href: "#visual", label: "视觉" },
          { href: "#matching", label: "职位匹配" },
          { href: "#enterprise", label: "企业体验" },
          { href: "#resume", label: "简历优化" },
        ]}
      />

      <div className="mgd-artboard">
        <PanelRange start={1} end={1} label="项目封面" />
        <PanelRange start={2} end={3} id="background" label="项目背景与问题分析" />
        <PanelRange start={4} end={6} id="visual" label="视觉方向与设计规范" />
        <PanelRange start={7} end={14} id="matching" label="职位匹配体验优化" />
        <PanelRange start={15} end={22} id="enterprise" label="企业信息体验优化" />
        <PanelRange start={23} end={29} id="resume" label="简历填写体验优化与项目总结" />
      </div>

      <ProjectPager current="moguding" />

      <a className="mgd-top-link" href="#top" aria-label="回到页面顶部">
        ↑
      </a>
    </main>
  );
}
