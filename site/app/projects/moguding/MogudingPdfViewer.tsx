"use client";

import { useState } from "react";
import { withBasePath } from "../../basePath";

const PDF_PATH = withBasePath("/projects/moguding/moguding-portfolio.pdf");

const sections = [
  { label: "背景", page: 2 },
  { label: "视觉", page: 4 },
  { label: "职位匹配", page: 7 },
  { label: "企业体验", page: 15 },
  { label: "简历优化", page: 23 },
];

function pdfSource(page: number) {
  return `${PDF_PATH}#page=${page}&view=FitH&toolbar=0&navpanes=0`;
}

export default function MogudingPdfViewer() {
  const [activePage, setActivePage] = useState(1);

  const openSection = (page: number) => {
    setActivePage(page);
  };

  return (
    <main className="mgd-page mgd-page--pdf" id="top">
      <nav className="mgd-nav" aria-label="蘑菇丁项目导航">
        <a className="mgd-back" href={withBasePath("/#projects")}>
          <span aria-hidden="true">←</span> 返回作品集
        </a>

        <div className="mgd-nav-links">
          {sections.map((section) => (
            <button
              key={section.label}
              type="button"
              onClick={() => openSection(section.page)}
            >
              {section.label}
            </button>
          ))}
        </div>

        <span className="mgd-project-no">PROJECT 03</span>
      </nav>

      <section className="mgd-pdf-shell" aria-label="蘑菇丁项目完整设计稿">
        <iframe
          key={activePage}
          className="mgd-pdf-frame"
          title="蘑菇丁实习招聘体验设计高清 PDF"
          src={pdfSource(activePage)}
        />
      </section>
    </main>
  );
}
