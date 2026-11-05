/**
 * Block schemas — the single source of truth for what each page block accepts.
 * A page's `blocks:` list is validated against these at build time, so a typo or a
 * missing field fails the build instead of breaking the live site.
 *
 * To add a block type:
 *   1. add a schema here and include it in `block` below
 *   2. create src/components/blocks/<Name>.astro
 *   3. register it in src/components/BlockRenderer.astro
 *   4. add it to the block table in CLAUDE.md
 */
import { z } from "astro/zod";

const link = z.object({ label: z.string(), href: z.string() });
const image = z.object({ src: z.string(), alt: z.string().default("") });

/** Optional section anchor (for in-page nav like /#services) and background. */
const common = {
  id: z.string().optional(),
  background: z.enum(["white", "grey"]).default("white"),
};

export const hero = z.object({
  type: z.literal("hero"),
  ...common,
  eyebrow: z.string().optional(),
  heading: z.string(),
  /** Second line of the heading, shown in the accent gradient colour. */
  highlight: z.string().optional(),
  body: z.string().optional(),
  cta: link.optional(),
  video: z.string().optional(),
  image: image.optional(),
});

export const logos = z.object({
  type: z.literal("logos"),
  ...common,
  heading: z.string(),
  items: z.array(image),
});

export const stats = z.object({
  type: z.literal("stats"),
  ...common,
  heading: z.string(),
  body: z.string().optional(),
  items: z.array(z.object({ value: z.string(), label: z.string() })),
});

export const prose = z.object({
  type: z.literal("prose"),
  ...common,
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  /** Markdown. */
  body: z.string(),
  image: image.optional(),
});

export const steps = z.object({
  type: z.literal("steps"),
  ...common,
  heading: z.string(),
  items: z.array(z.object({ title: z.string(), body: z.string() })), // body is Markdown
});

export const services = z.object({
  type: z.literal("services"),
  ...common,
  eyebrow: z.string().optional(),
  heading: z.string(),
  items: z.array(z.object({ title: z.string(), body: z.string(), href: z.string().optional() })),
  /** Secondary "All services" list. */
  allHeading: z.string().optional(),
  allBody: z.string().optional(),
  allItems: z.array(z.string()).optional(),
});

export const list = z.object({
  type: z.literal("list"),
  ...common,
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  /** Each item is Markdown; use **bold** for the lead-in. */
  items: z.array(z.string()),
});

export const caseStudies = z.object({
  type: z.literal("caseStudies"),
  ...common,
  eyebrow: z.string().optional(),
  heading: z.string(),
  /** Slugs to feature, in order. Omit to show all. */
  featured: z.array(z.string()).optional(),
  showTestimonials: z.boolean().default(false),
});

export const testimonials = z.object({
  type: z.literal("testimonials"),
  ...common,
});

export const contactForm = z.object({
  type: z.literal("contactForm"),
  ...common,
  background: z.enum(["white", "grey"]).default("grey"),
  heading: z.string(),
  body: z.string().optional(),
});

export const faq = z.object({
  type: z.literal("faq"),
  ...common,
  heading: z.string(),
  items: z.array(z.object({ q: z.string(), a: z.string() })),
});

export const insights = z.object({
  type: z.literal("insights"),
  ...common,
  eyebrow: z.string().optional(),
  heading: z.string(),
  limit: z.number().default(3),
});

export const cta = z.object({
  type: z.literal("cta"),
  ...common,
  heading: z.string(),
  body: z.string().optional(),
  cta: link,
});

export const block = z.discriminatedUnion("type", [
  hero, logos, stats, prose, steps, services, list, caseStudies,
  testimonials, contactForm, faq, insights, cta,
]);

export type Block = z.infer<typeof block>;
