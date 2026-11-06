// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, readdirSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import seoPostprocess from "./src/integrations/seo-postprocess.mjs";

// Publish dates for insights, so the sitemap tells Google when each article was last updated.
const insightDates = Object.fromEntries(
  readdirSync("src/content/insights").filter((f) => /\.mdx?$/.test(f)).map((f) => {
    const fm = readFileSync(`src/content/insights/${f}`, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    const date = parseYaml(fm)?.date;
    return [`https://studiovigo.co.uk/insights/${f.replace(/\.mdx?$/, "")}`, date ? new Date(date).toISOString() : undefined];
  }),
);

export default defineConfig({
  site: "https://studiovigo.co.uk",
  // Static by default; routes that set `export const prerender = false`
  // (the contact form API) run as Vercel serverless functions.
  output: "static",
  adapter: vercel({ webAnalytics: { enabled: true } }),
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const url = item.url.replace(/\/$/, "");
        if (insightDates[url]) item.lastmod = insightDates[url];
        return item;
      },
    }),
    seoPostprocess(),
  ],
  vite: { plugins: [tailwindcss()] },
});
