import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { marked } from "marked";

export interface SiteConfig {
  name: string;
  company: string;
  tagline: string;
  nav: { label: string; href: string }[];
  footerNav: { label: string; href: string }[];
  offices: { city: string; address: string }[];
  cta: { heading: string; body: string; label: string; href: string };
  menuCaseStudies: string[];
  cookieMessage: string;
  analytics?: { gtm?: string };
  clutchCompanyId?: string;
  footerBadges?: { src: string; alt: string; href?: string }[];
  fontAwesomeKit?: string;
}

/** Global settings from src/content/site.yaml (nav, footer, offices, analytics). */
export const site: SiteConfig = parse(
  // Read from the project root (builds always run there); a relative import.meta.url
  // would break once the code is bundled.
  readFileSync(join(process.cwd(), "src/content/site.yaml"), "utf8"),
);

/** Render a Markdown string (used for block fields marked "Markdown"). */
export const md = (s?: string) => (s ? (marked.parse(s, { async: false }) as string) : "");
export const mdInline = (s?: string) => (s ? (marked.parseInline(s, { async: false }) as string) : "");
