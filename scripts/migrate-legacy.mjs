/**
 * One-off migration: converts the Statamic snapshot in legacy/ into content files.
 *   node scripts/migrate-legacy.mjs
 * Writes src/content/{case-studies,insights,services}/*. Safe to re-run (overwrites).
 * Kept in the repo as a record of how content was migrated; not used by the build.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { parseHTML } from "linkedom";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { stringify } from "yaml";

const ROOT = "legacy/studiovigo.co.uk";
const load = (f) => parseHTML(readFileSync(`${ROOT}/${f}`, "utf8")).document;

const td = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced", emDelimiter: "*" });
td.use(gfm);
// Table cells wrap content in <p>; flatten so GFM tables stay on one line.
td.addRule("cellParagraphs", { filter: (n) => n.nodeName === "P" && /^(TD|TH)$/.test(n.parentNode?.nodeName), replacement: (c) => c.trim() + " " });
// Make internal links relative.
td.addRule("links", {
  filter: "a",
  replacement: (content, node) => {
    let href = node.getAttribute("href") || "";
    href = href.replace(/^https?:\/\/(www\.)?studiovigo\.co\.uk/, "") || "/";
    return `[${content.trim()}](${href})`;
  },
});

const toMd = (html) => td.turndown(html || "").replace(/ /g, " ").trim();
/** Escape characters that MDX would treat as JSX/expressions. */
const mdxSafe = (md) => md.replace(/[{}]/g, (c) => "\\" + c).replace(/<(?![a-zA-Z/!])/g, "&lt;");
const q = (s) => JSON.stringify(s ?? ""); // safe YAML/JSX string
const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
const GRAD = /card-gradient-([a-z-]+)/;

/** Convert the children of an article "flow" container into MDX. */
function flowToMdx(flow) {
  const out = [];
  for (const el of [...flow.children]) {
    const cls = el.getAttribute("class") || "";
    if (el.querySelector(".article-body")) {
      const title = el.querySelector(":scope > p.font-bold, :scope > h2");
      const body = mdxSafe(toMd(el.querySelector(".article-body").innerHTML));
      out.push(`<Text${title ? ` title=${q(text(title))}` : ""}>\n\n${body}\n\n</Text>`);
    } else if (cls.includes("container") && el.querySelector("img")) {
      const img = el.querySelector("img");
      const g = (el.innerHTML.match(GRAD) || [])[1];
      out.push(`<Figure src=${q(img.getAttribute("src"))} alt=${q(img.getAttribute("alt") || "")}${g ? ` gradient=${q(g)}` : ""} />`);
    } else if (el.querySelector('[x-data="statistic"]')) {
      const heading = text(el.querySelector("h2"));
      const body = text(el.querySelector("h2 + p"));
      const items = [...el.querySelectorAll('[x-data="statistic"]')].map((dl) => ({
        value: text(dl.querySelector(".sr-only")), label: text(dl.querySelector("dt")),
      }));
      out.push(`<Stats${heading ? ` heading=${q(heading)}` : ""}${body ? ` body=${q(body)}` : ""} items={${JSON.stringify(items, null, 2)}} />`);
    } else if (cls.includes("max-w-6xl") && el.querySelector("h3")) {
      const heading = text(el.querySelector("h2"));
      const body = text(el.querySelector("h2 + p"));
      const items = [...el.querySelectorAll("h3")].map((h3) => {
        const card = h3.parentElement;
        const icon = (card.querySelector("i")?.getAttribute("class") || "").replace(/^fa-solid fa-/, "");
        return { ...(icon ? { icon } : {}), title: text(h3), body: toMd(card.querySelector(":scope > div.text-smx")?.innerHTML) };
      });
      const cols = items.length % 3 === 0 && items.length % 4 !== 0 ? 3 : 4;
      out.push(`<Cards${heading ? ` heading=${q(heading)}` : ""}${body ? ` body=${q(body)}` : ""}${cols !== 4 ? ` columns={${cols}}` : ""} items={${JSON.stringify(items, null, 2)}} />`);
    } else if (text(el)) {
      console.warn("  ! unhandled section:", cls.slice(0, 60), text(el).slice(0, 60));
    }
  }
  return out.join("\n\n") + "\n";
}

const meta = (doc, name) =>
  doc.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ||
  doc.querySelector(`meta[property="${name}"]`)?.getAttribute("content") || "";
const pageTitle = (doc) => text(doc.querySelector("title")).replace(/\s*\|\s*Vigo\s*$/, "");

function articleHero(doc) {
  const band = doc.querySelector("article .relative > .relative[style]");
  const h1 = doc.querySelector("article h1");
  const color = (band?.getAttribute("style") || "").match(/#[0-9a-fA-F]{3,8}/)?.[0];
  const textColor = (h1?.getAttribute("style") || "").match(/#[0-9a-fA-F]{3,8}/)?.[0];
  const image = doc.querySelector("article .hidden.xl\\:block img")?.getAttribute("src");
  return { heading: text(h1), color, textColor, image };
}
const articleFlow = (doc) => doc.querySelector("article .relative > .flex.flex-col.items-center");

const clean = (o) => JSON.parse(JSON.stringify(o, (k, v) => (v === "" || (Array.isArray(v) && !v.length) ? undefined : v)));
const fm = (obj) => "---\n" + stringify(clean(obj), { lineWidth: 0 }) + "---\n\n";

/* ---------------- Case studies ---------------- */
const listing = load("case-studies.html");
const listCards = Object.fromEntries([...listing.querySelectorAll('a[href^="/case-studies/"]')].map((a) => [
  a.getAttribute("href").split("/").pop(),
  { image: a.querySelector("img")?.getAttribute("src"), tags: [...a.querySelectorAll("p.rounded-full")].map(text), title: text(a.querySelector("p.text-xlx")) },
]));
const home = load("index.html");
const homeHtml = readFileSync(`${ROOT}/index.html`, "utf8");
const featured = {};
home.querySelectorAll('#case-studies a[href^="/case-studies/"]').forEach((a, i) => {
  const slug = a.getAttribute("href").split("/").pop();
  const card = a.querySelector('[id^="case-study-card-"]');
  const id = card.id;
  const colors = [...homeHtml.matchAll(new RegExp(`#${id}(?::hover)?\\s*\\{\\s*background-color:\\s*(#[0-9A-Fa-f]+)`, "g"))].map((m) => m[1]);
  const bg = [...card.children].find((e) => e.tagName === "IMG");
  featured[slug] = {
    color: colors[0], colorDesktop: colors[1], colorHover: colors[2],
    logo: card.querySelector(".rounded-t-lgx img")?.getAttribute("src"),
    background: bg ? { src: bg.getAttribute("src"), class: bg.getAttribute("class") } : undefined,
    layers: [...card.querySelectorAll("div.hidden.lg\\:block > img")].map((img) => ({ src: img.getAttribute("src"), class: img.getAttribute("class") })),
    summary: text(card.querySelector(".case-study-card-description")),
    order: i + 1,
  };
});

mkdirSync("src/content/case-studies", { recursive: true });
for (const f of readdirSync(`${ROOT}/case-studies`).filter((f) => f.endsWith(".html"))) {
  const slug = f.replace(/\.html$/, "");
  const doc = load(`case-studies/${f}`);
  const hero = articleHero(doc);
  const lc = listCards[slug] || {};
  const card = featured[slug];
  const { summary, order, ...cardArt } = card || {};
  const front = fm({
    title: pageTitle(doc),
    description: meta(doc, "description"),
    heading: hero.heading,
    listingTitle: lc.title,
    summary,
    tags: lc.tags,
    heroColor: hero.color, heroTextColor: hero.textColor, heroImage: hero.image,
    listingImage: lc.image,
    ...(card ? { featuredCard: cardArt } : {}),
  });
  writeFileSync(`src/content/case-studies/${slug}.mdx`, front + flowToMdx(articleFlow(doc)));
  console.log("case study:", slug);
}

/* ---------------- Insights ---------------- */
const ilist = load("insights.html");
const icards = Object.fromEntries([...ilist.querySelectorAll('a[href^="/insights/"]')].map((a) => {
  const ps = [...a.querySelectorAll("p")].map(text);
  return [a.getAttribute("href").split("/").pop(), {
    author: text(a.querySelector("p.font-medium")),
    date: ps.find((p) => /\d{1,2} \w+ \d{4}/.test(p)),
    image: a.querySelector("img")?.getAttribute("src"),
    tag: text(a.querySelector("img")?.closest("a")?.querySelector(".uppercase")) || undefined,
  }];
}));
mkdirSync("src/content/insights", { recursive: true });
for (const f of readdirSync(`${ROOT}/insights`).filter((f) => f.endsWith(".html"))) {
  const slug = f.replace(/\.html$/, "");
  const doc = load(`insights/${f}`);
  const hero = articleHero(doc);
  const c = icards[slug] || {};
  const date = c.date ? new Date(c.date + " 12:00 UTC").toISOString().slice(0, 10) : undefined;
  const flow = articleFlow(doc);
  const sections = [...flow.children];
  const simple = sections.length === 1 && !sections[0].querySelector(":scope > p.font-bold");
  const front = fm({
    title: hero.heading || pageTitle(doc),
    metaTitle: pageTitle(doc) !== hero.heading ? pageTitle(doc) : undefined,
    description: meta(doc, "description"),
    date, author: c.author,
    heroColor: hero.color, heroTextColor: hero.textColor, heroImage: hero.image,
    listingImage: c.image && c.image !== hero.image ? c.image : undefined,
  });
  if (simple) writeFileSync(`src/content/insights/${slug}.md`, front + toMd(sections[0].querySelector(".article-body").innerHTML) + "\n");
  else writeFileSync(`src/content/insights/${slug}.mdx`, front + flowToMdx(flow));
  console.log("insight:", slug, simple ? "(md)" : "(mdx)", date, c.author);
}

/* ---------------- Service pages ---------------- */
mkdirSync("src/content/services", { recursive: true });
const ILLUSTRATIONS = { "product-strategy": "product-strategy", "discovery-prototyping": "prototyping", "uxui-design": "uxui-design" };
for (const slug of Object.keys(ILLUSTRATIONS)) {
  const doc = load(`${slug}.html`);
  const [heroEl, bodyEl] = [...doc.querySelector("main").children];
  const theme = (heroEl.outerHTML.match(/gradient-hero-(blue|purple|pink)/) || [])[1];
  const front = fm({
    title: pageTitle(doc),
    description: meta(doc, "description"),
    eyebrow: text(heroEl.querySelector("p")),
    heading: text(heroEl.querySelector("div.text-3xl")),
    theme,
    illustration: `/assets/illustrations/${ILLUSTRATIONS[slug]}.svg`,
  });
  writeFileSync(`src/content/services/${slug}.mdx`, front + flowToMdx(bodyEl.querySelector(".flex.flex-col.items-center")));
  console.log("service:", slug, theme);
}
