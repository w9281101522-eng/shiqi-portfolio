import type { Metadata } from "next";
import "./miaoxiaotian.css";
import CircularGallery from "./CircularGallery";
import SplitText from "./SplitText";
import AccordionPalette from "./AccordionPalette";
import { ProjectPager, ProjectTopNav } from "../ProjectNavigation";
import { withBasePath } from "../../basePath";

export const metadata: Metadata = {
  title: "喵小甜 IP 全链路设计｜王诗琦",
  description: "从角色灵感、形象设定到换装、动作与故事场景的原创 IP 设计案例。",
};

const assetRoot = withBasePath("/projects/miaoxiaotian");

const colors = [
  ["奶油白", "#FFF6E7", "BASE"],
  ["蜜桃粉", "#FF9FB2", "EMOTION"],
  ["晴空蓝", "#8EDCF4", "IDENTITY"],
  ["珊瑚橙", "#FF7564", "ENERGY"],
] as const;

const outfits = [
  ["outfit-swim.webp", "潜水员", "SWIMMER", 1],
  ["outfit-police.webp", "守护者", "GUARDIAN", 1],
  ["outfit-goggles.webp", "机械师", "MECHANIC", 1],
  ["outfit-farmer.webp", "园丁", "GARDENER", 0.87],
  ["outfit-aviator.webp", "飞行家", "AVIATOR", 1],
] as const;

const actions = [
  ["action-chef.webp", "认真搅拌"],
  ["action-pan.webp", "灵感起锅"],
  ["action-candy.webp", "甜度超载"],
  ["action-chop.webp", "备菜时间"],
  ["action-skewer.webp", "分享好运"],
  ["action-fortune.webp", "接住福气"],
];

function SectionLabel({
  index,
  en,
  zh,
  light = false,
}: {
  index: string;
  en: string;
  zh: string;
  light?: boolean;
}) {
  return (
    <div className={`mx-label${light ? " is-light" : ""}`}>
      <span>{index}</span>
      <p>{en} / {zh}</p>
    </div>
  );
}

export default function MiaoXiaotianProject() {
  return (
    <main className="mx-page">
      <ProjectTopNav
        current="miaoxiaotian"
        links={[
          { href: "#top", label: "背景" },
          { href: "#background", label: "角色" },
          { href: "#outfits", label: "换装" },
          { href: "#world", label: "场景" },
        ]}
      />

      <section className="mx-hero" id="top" aria-labelledby="project-title">
        <video autoPlay muted loop playsInline>
          <source src={`${assetRoot}/hero-secret-flower.mp4`} type="video/mp4" />
        </video>
        <div className="mx-hero-shade" />
        <div className="mx-hero-title">
          <p>ORIGINAL IP DESIGN · 2024</p>
          <h1 id="project-title"><span>一起来到</span><span>喵小甜的世界</span></h1>
          <strong>MIAO XIAOTIAN</strong>
        </div>
        <div className="mx-hero-meta">
          <span>角色 / 视觉 / 场景</span>
          <span>个人项目</span>
          <span>2024.10—2024.12</span>
        </div>
        <a href="#background" className="mx-scroll">
          SCROLL TO EXPLORE <span>↓</span>
        </a>
      </section>

      <section className="mx-editorial mx-background" id="background">
        <SectionLabel index="01" en="INTRODUCTION" zh="背景介绍" />
        <div className="mx-intro-layout">
          <div>
            <p className="mx-kicker">DESIGN INSPIRATION</p>
            <h2>Hi~ o(*￣▽￣*)ブ<br />我是喵小甜！</h2>
          </div>
          <div className="mx-intro-copy">
            <p>
              我不只是看起来可爱的小猫，也想成为你身边可靠的情感伙伴。
              我会走进烹饪、探索和日常分享，把普通的时刻变成温暖的小故事，
              也把刚刚好的甜蜜与勇气分给你。
            </p>
          </div>
        </div>

        <div className="mx-inspiration">
          <SplitText text="INTRODUCTION" className="mx-ghost-word" />
          <div className="mx-feature-note mx-note-one">
            <strong>01</strong>
            <SplitText as="span" text="圆脑瓜" className="mx-feature-title" delay={58} />
            <SplitText as="p" text="柔和的圆形轮廓降低距离感，建立亲切、可靠的角色印象。" className="mx-feature-copy" delay={18} />
          </div>
          <img
            src={`${assetRoot}/character-front.webp`}
            alt="喵小甜标准角色形象"
          />
          <div className="mx-feature-note mx-note-two">
            <strong>02</strong>
            <SplitText as="span" text="粉脸颊" className="mx-feature-title" delay={58} />
            <SplitText as="p" text="高识别度的情绪记忆点，让角色始终保留甜感和生命力。" className="mx-feature-copy" delay={18} />
          </div>
          <div className="mx-feature-note mx-note-three">
            <strong>03</strong>
            <SplitText as="span" text="蓝围巾" className="mx-feature-title" delay={58} />
            <SplitText as="p" text="忠诚与信任的视觉符号，也是角色跨场景延展的固定锚点。" className="mx-feature-copy" delay={18} />
          </div>
        </div>
      </section>

      <section className="mx-profile" id="profile">
        <div className="mx-profile-copy">
          <SectionLabel index="02" en="IP PROFILE" zh="IP 简介" />
          <p className="mx-kicker">HI, MY NAME IS MIAO XIAOTIAN</p>
          <h2>很高兴认识你！</h2>
          <p>
            我是一只喜欢烹饪、探索和分享的小猫。最喜欢把新鲜食材变成甜甜的点心，
            也喜欢跟着微光去森林里寻找没见过的花。遇见朋友时，我会把刚出炉的好运
            和故事分给大家——希望每一次出现，都能让普通的一天多一点温暖和小小勇气。
          </p>
          <div className="mx-profile-tags" aria-label="喵小甜的喜好">
            <span>喜欢烹饪</span><span>森林探险</span><span>分享好运</span>
          </div>
        </div>
        <figure className="mx-profile-figure mx-profile-lifestyle">
          <span aria-hidden="true">HELLO!</span>
          <img
            src={`${assetRoot}/character-lotus.webp`}
            alt="喵小甜坐在莲花上分享好运的生活化形象"
          />
          <figcaption>COOK / EXPLORE / SHARE</figcaption>
        </figure>
      </section>

      <section className="mx-editorial mx-showcase" id="showcase">
        <SectionLabel index="03" en="CHARACTER VIEWS" zh="IP 展示" />
        <div className="mx-section-heading">
          <h2>个人展示时间！</h2>
          <p>基本形象的展示</p>
        </div>
        <figure className="mx-view-stage mx-view-composition" aria-label="喵小甜 IP 三视图">
          <img
            className="mx-view-furry"
            src={`${assetRoot}/character-furry-backdrop-sharp.png`}
            alt=""
            aria-hidden="true"
          />
          <img
            className="mx-view-logo"
            src={`${assetRoot}/character-action-logo-sharp.png`}
            alt="喵小甜登场"
          />
          <span className="mx-view-ground" aria-hidden="true" />
          <img
            className="mx-view-turns"
            src={`${assetRoot}/character-back-side.webp`}
            alt="喵小甜侧面与背面视图"
          />
          <img
            className="mx-view-main"
            src={`${assetRoot}/character-front-motion-loop.webp`}
            alt="循环播放的喵小甜正面动态视图"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </section>

      <section className="mx-system" id="system">
        <div className="mx-system-inner">
          <SectionLabel index="04" en="VISUAL LANGUAGE" zh="视觉规范" />
          <div className="mx-section-heading">
            <h2>我的色彩定义</h2>
            <p>温暖明亮的颜色构成了乐观亲和的我</p>
          </div>
        </div>
        <AccordionPalette items={colors} defaultIndex={2} />
      </section>

      <section className="mx-outfits" id="outfits">
        <div className="mx-outfits-head">
          <SectionLabel index="05" en="OUTFIT SYSTEM" zh="换装" />
          <div className="mx-section-heading">
            <h2>换一种身份，<br />进入一种新生活。</h2>
            <p>一起来看看我的衣柜</p>
          </div>
        </div>
        <div className="mx-outfit-gallery">
          <CircularGallery
            items={outfits.map(([image, text, eyebrow, visualScale]) => ({
              image: `${assetRoot}/${image}`,
              text,
              eyebrow,
              visualScale,
            }))}
          />
        </div>
      </section>

      <section className="mx-editorial mx-actions" id="actions">
        <SectionLabel index="06" en="ACTION LIBRARY" zh="动作" />
        <div className="mx-section-heading">
            <h2>一起来烹饪美食吧！</h2>
          <p>
            围绕烹饪、分享与幸运建立动作库。
            每个姿态都保留软萌的重心和明确的情绪，让静态画面也拥有节奏。
          </p>
        </div>
        <div className="mx-action-flow">
          {actions.map(([image, title], index) => (
            <figure key={image}>
              <div>
                <span>0{index + 1}</span>
                <small>ACTION</small>
              </div>
              <img src={`${assetRoot}/${image}`} alt={`喵小甜动作：${title}`} />
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-world" id="world">
        <div className="mx-world-head">
          <SectionLabel index="07" en="STORY WORLD" zh="场景" light />
          <div className="mx-section-heading">
            <h2>去寻找光，<br />探险世界的不同~</h2>
            <p>跟着萤火虫，翻山越岭，找到属于自己的那片星光</p>
          </div>
        </div>

        <article className="mx-pdf-story mx-pdf-forest">
          <figure className="mx-pdf-cover">
            <img src={`${assetRoot}/scene-elf.webp`} alt="The elf's guidance：喵小甜走进发光的森林" />
            <figcaption>
              <span>THE WARRIOR IN THE GREEN FOREST</span>
              <strong>The elf&apos;s<br />guidance</strong>
            </figcaption>
          </figure>

          <div className="mx-pdf-copy">
            <div>
              <p className="mx-kicker">THE WARRIOR IN THE GREEN FOREST</p>
              <h3>The elf&apos;s guidance</h3>
            </div>
            <div>
              <p>Deep in the forest, the elf&apos;s faint light scatters like stars. When night falls, those glimmers seem like breathing stars, guiding the lost, and making the forest extraordinarily beautiful because of this tenderness.</p>
              <p>In the mysterious forest, Sweet Kitty is exploring curiously. Following the glimmers, Sweet Kitty sees brilliant flowers and strange mushrooms that it has never seen before. Every step is full of surprises, as if stepping into a dreamy world.</p>
            </div>
          </div>

          <div className="mx-pdf-triptych mx-pdf-triptych-forest" aria-label="精灵指引故事分镜">
            {["left", "center", "right"].map((position, index) => (
              <figure key={position} className={`mx-pdf-crop mx-pdf-crop-${position}`}>
                <img src={`${assetRoot}/scene-elf.webp`} alt={`精灵指引森林分镜 ${index + 1}`} />
              </figure>
            ))}
          </div>

          <figure className="mx-pdf-panorama">
            <img src={`${assetRoot}/scene-elf.webp`} alt="喵小甜在森林中循着微光前进" />
          </figure>

          <div className="mx-pdf-triptych mx-pdf-triptych-flower" aria-label="秘境蓝花故事分镜">
            {["left", "center", "right"].map((position, index) => (
              <figure key={position} className={`mx-pdf-crop mx-pdf-crop-${position}`}>
                <img src={`${assetRoot}/scene-blue-flower.webp`} alt={`秘境蓝花分镜 ${index + 1}`} />
              </figure>
            ))}
          </div>

          <div className="mx-pdf-forest-note">
            <p className="mx-kicker">THE WARRIOR IN THE GREEN FOREST</p>
            <p>In the forest, Sweet Kitty follows the elf&apos;s faint light and finally sees a huge, mysterious flower with lustrous petals in a bluish halo.</p>
          </div>

          <figure className="mx-pdf-panorama mx-pdf-panorama-flower">
            <img src={`${assetRoot}/scene-blue-flower.webp`} alt="喵小甜找到夜色中盛开的蓝色花朵" />
          </figure>
        </article>

        <article className="mx-pdf-story mx-pdf-star">
          <div className="mx-pdf-star-intro">
            <p className="mx-kicker">STAR CHASER / 追星者</p>
            <h3>Look at the details</h3>
          </div>
          {[
            ["scene-stargaze.webp", "01 / CHASING THE STAR", "The night spreads like thick ink. I hold a net and run excitedly, chasing the playful star that flickers in and out among the glowing fireflies."],
            ["scene-water.webp", "02 / MEET THE STARLIGHT", "I stand by the water, gazing at the reflection of the star. The light echoes the distant starlight in the sky, like a silent yet affectionate whisper."],
            ["scene-vehicle.webp", "03 / SET SAIL", "Board the fantasy-laden ship and set sail slowly in the gentle twilight. I chase the starlight shining not far ahead."],
            ["scene-snow.webp", "04 / BEYOND THE HORIZON", "Under the clear blue sky, paper planes flutter like stars. Every trajectory is an extension of my steps in pursuing the galaxy."],
          ].map(([image, label, copy]) => (
            <div className="mx-pdf-star-chapter" key={image}>
              <div className="mx-pdf-star-copy">
                <span>{label}</span>
                <p>{copy}</p>
              </div>
              <figure>
                <img src={`${assetRoot}/${image}`} alt={label} />
              </figure>
            </div>
          ))}
        </article>
      </section>

      <footer className="mx-ending">
        <div>
          <p className="mx-kicker">THANKS FOR WATCHING</p>
          <h2>愿喵小甜一直陪着你，<br />带来一点治愈和温暖。</h2>
        <a href={withBasePath("/#projects")}>返回精选项目 <span>↗</span></a>
        </div>
        <img
          src={`${assetRoot}/character-lotus-ending-loop.webp`}
          alt="循环播放的莲花喵小甜动态形象"
          loading="lazy"
          decoding="async"
        />
        <p>Miao Xiaotian · Designed by Shiqi Wang</p>
      </footer>

      <ProjectPager current="miaoxiaotian" />
    </main>
  );
}
