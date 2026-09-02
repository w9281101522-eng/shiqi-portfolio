import { withBasePath } from "../basePath";
import { ProjectTopNav } from "../projects/ProjectNavigation";
import "../projects/project-navigation.css";
import "./beyond-design.css";

const sections = [
  { height: 1800, id: "top" },
  { height: 1800, id: "music" },
  { height: 1800, id: "skiing" },
  { height: 1800, id: "photography" },
  { height: 1800, id: "companions" },
  { height: 1179, id: undefined },
] as const;

const sectionLinks = [
  { href: "#top", label: "关于我" },
  { href: "#music", label: "音乐" },
  { href: "#skiing", label: "滑雪" },
  { href: "#photography", label: "摄影" },
  { href: "#companions", label: "动物伙伴" },
];

export default function BeyondDesignPage() {
  return (
    <main className="beyond-design-page">
      <ProjectTopNav current="beyond-design" links={sectionLinks} eyebrow="LIFE" />
      <div className="beyond-design-canvas" aria-label="设计之外：我的爱好与生活">
        {sections.map((section, index) => (
          <section className="beyond-design-section" id={section.id} key={index}>
            <img
              src={withBasePath(`/beyond-design/section-${String(index + 1).padStart(2, "0")}.png`)}
              alt={index === 0 ? "设计之外：我的爱好与生活" : ""}
              width={1921}
              height={section.height}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
            />
          </section>
        ))}
      </div>
    </main>
  );
}
