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
  /** Part of the heading shown in the animated gradient colour. */
  highlight: z.string().optional(),
  /** Optional text after the highlight. */
  after: z.string().optional(),
  body: z.string().optional(),
  cta: link.optional(),
  secondaryCta: link.optional(),
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
  heading: z.string().optional(),
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

/** Glowing icon cards (process steps, benefits…). icon = Font Awesome name, e.g. "magnifying-glass". */
export const cards = z.object({
  type: z.literal("cards"),
  ...common,
  heading: z.string().optional(),
  body: z.string().optional(),
  numbered: z.boolean().default(false),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(4),
  items: z.array(z.object({ title: z.string(), body: z.string(), icon: z.string().optional() })), // body is Markdown
});

/** Small centred intro (eyebrow + statement) with a soft gradient wash — used to open listing pages. */
export const pageHeader = z.object({
  type: z.literal("pageHeader"),
  ...common,
  eyebrow: z.string(),
  /** Markdown (links allowed). */
  heading: z.string(),
});

export const services = z.object({
  type: z.literal("services"),
  ...common,
  eyebrow: z.string().optional(),
  heading: z.string(),
  /** Featured service cards. illustration = an image path, e.g. /assets/illustrations/uxui-design.svg */
  items: z.array(z.object({ title: z.string(), body: z.string(), href: z.string().optional(), illustration: z.string().optional() })),
  /** Optional tabbed "All services" panel below the cards. */
  all: z.object({
    eyebrow: z.string().optional(),
    heading: z.string(),
    tabs: z.array(z.object({
      title: z.string(),
      items: z.array(z.object({ title: z.string(), body: z.string(), icon: z.string().optional() })),
    })),
  }).optional(),
});

/** Titled panels: side tabs on desktop, accordion on mobile. body is Markdown. */
export const tabs = z.object({
  type: z.literal("tabs"),
  ...common,
  eyebrow: z.string().optional(),
  heading: z.string(),
  items: z.array(z.object({ title: z.string(), body: z.string() })),
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
  /** Case study slugs to feature as large cards, in order (each needs `featuredCard` art). */
  featured: z.array(z.string()),
  showTestimonials: z.boolean().default(true),
});

export const testimonials = z.object({
  type: z.literal("testimonials"),
  ...common,
});

/** Contact page opener: greeting on the left, contact methods on the right. icon = Font Awesome name. */
export const contactHero = z.object({
  type: z.literal("contactHero"),
  ...common,
  /** Each line becomes its own paragraph. */
  greeting: z.array(z.string()),
  methods: z.array(z.object({ icon: z.string(), label: z.string(), href: z.string() })),
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
  hero, pageHeader, contactHero, logos, stats, prose, cards, services, tabs, list, caseStudies,
  testimonials, contactForm, faq, insights, cta,
]);

export type Block = z.infer<typeof block>;
