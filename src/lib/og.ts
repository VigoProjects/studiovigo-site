/**
 * Share cards: the image shown when a page is shared on LinkedIn, Slack, WhatsApp etc.
 *
 * Every top-level page gets a 1200×630 card, generated at build time: the fixed design layer
 * (src/assets/og/background.jpg) with the page's own eyebrow and headline on top.
 * Articles and case studies use their own hero photo instead.
 *
 * Where the text comes from, in order:
 *   1. `shareCards` in src/content/site.yaml (overrides, keyed by page slug, "home" for /)
 *   2. a page's first `hero` block (eyebrow + heading + gradient highlight)
 *   3. a service page's eyebrow + heading
 */
import { getCollection } from "astro:content";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { site } from "./site";

export interface ShareCard { eyebrow?: string; headline: string; highlight?: string; after?: string }

export async function shareCards(): Promise<Map<string, ShareCard>> {
  const cards = new Map<string, ShareCard>();
  for (const p of await getCollection("pages")) {
    const hero = p.data.blocks.find((b) => b.type === "hero");
    if (hero && hero.type === "hero") {
      cards.set(p.id, { eyebrow: hero.eyebrow, headline: hero.heading, highlight: hero.highlight, after: hero.after });
    }
  }
  for (const s of await getCollection("services")) {
    cards.set(s.id, { eyebrow: s.data.eyebrow, headline: s.data.heading });
  }
  for (const [key, card] of Object.entries(site.shareCards ?? {})) cards.set(key, card);
  return cards;
}

/** The share-card URL for a page path, if one exists. */
export async function shareCardFor(path: string): Promise<string | undefined> {
  const key = path === "/" ? "home" : path.replace(/^\//, "");
  return (await shareCards()).has(key) ? `/og/${key}.jpg` : undefined;
}

// ---------- rendering ----------

const C = { ink: "#333333", muted: "#555555", grad: ["#fb3872", "#744ef9", "#33bcd1"] };
const font = (f: string) => readFileSync(join(process.cwd(), "src/assets/og", f));
let fonts: { name: string; data: Buffer; weight: 400 | 500 | 700; style: "normal" }[] | undefined;
let background: string | undefined;

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

/** Mix two hex colours (t = 0..1). */
const mix = (a: string, b: string, t: number) => {
  const p = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
/** Colour at position t (0..1) along the coral → purple → teal brand gradient. */
const gradAt = (t: number) => (t <= 0.5 ? mix(C.grad[0], C.grad[1], t * 2) : mix(C.grad[1], C.grad[2], (t - 0.5) * 2));

export async function renderShareCard(card: ShareCard): Promise<Buffer> {
  fonts ??= [
    { name: "Made Tommy", data: font("made-tommy-regular.otf"), weight: 400, style: "normal" },
    { name: "Made Tommy", data: font("made-tommy-medium.otf"), weight: 500, style: "normal" },
    { name: "Made Tommy", data: font("made-tommy-bold.otf"), weight: 700, style: "normal" },
  ];
  background ??= "data:image/jpeg;base64," + font("background.jpg").toString("base64");

  const plain = [card.headline, card.highlight, card.after].filter(Boolean).join(" ");
  const size = plain.length <= 55 ? 60 : plain.length <= 75 ? 52 : plain.length <= 95 ? 46 : 40;

  // Words are laid out individually so the headline wraps naturally; highlighted words
  // take their slice of the brand gradient, so the colour flows across the phrase.
  type Word = { w: string; from?: string; to?: string };
  const split = (s?: string) => s?.split(/\s+/).filter(Boolean) ?? [];
  const hl = split(card.highlight);
  const total = hl.join(" ").length;
  let pos = 0;
  const words: Word[] = [
    ...split(card.headline).map((w) => ({ w })),
    ...hl.map((w) => {
      const from = gradAt(pos / total), to = gradAt((pos + w.length) / total);
      pos += w.length + 1;
      return { w, from, to };
    }),
    ...split(card.after).map((w) => ({ w })),
  ];

  const tree = h("div", { width: 1200, height: 630, display: "flex", position: "relative", fontFamily: "Made Tommy" }, [
    { type: "img", props: { src: background, width: 1200, height: 630, style: { position: "absolute", top: 0, left: 0 } } },
    h("div", { position: "absolute", left: 80, top: 0, bottom: 0, width: 600, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }, [
      ...(card.eyebrow ? [h("div", { fontSize: 20, fontWeight: 700, color: C.muted }, card.eyebrow)] : []),
      h("div", { display: "flex", flexWrap: "wrap", maxWidth: 520, columnGap: Math.round(size * 0.24), rowGap: 0, fontSize: size, fontWeight: 700, lineHeight: 1.04, letterSpacing: -size * 0.02 },
        words.map(({ w, from, to }) =>
          from
            ? h("span", { backgroundImage: `linear-gradient(90deg, ${from}, ${to})`, backgroundClip: "text", color: "transparent" }, w)
            : h("span", { color: C.ink }, w))),
    ]),
  ]);

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}
