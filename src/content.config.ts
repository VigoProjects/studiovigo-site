import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";
import { block } from "./content/blocks";

const seo = {
  /** Used for <title> and search results. */
  title: z.string(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
};
const hex = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, "Use a hex colour like #016CCB");

/** Landing pages built from blocks: src/content/pages/<slug>.yaml (home.yaml is "/"). */
const pages = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/pages" }),
  schema: z.object({ ...seo, metaTitle: z.string().optional(), blocks: z.array(block) }),
});

/** Long-form service pages: src/content/services/<slug>.mdx → /<slug> */
const services = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/services" }),
  schema: z.object({
    ...seo,
    eyebrow: z.string(),
    heading: z.string(),
    theme: z.enum(["blue", "purple", "pink"]),
    illustration: z.string().optional(),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/insights" }),
  schema: z.object({
    ...seo,
    /** Overrides the <title> if it should differ from the on-page title. */
    metaTitle: z.string().optional(),
    date: z.coerce.date(),
    author: z.string(),
    heroColor: hex.default("#000000"),
    heroTextColor: hex.default("#ffffff"),
    heroImage: z.string().optional(),
    /** Card image on listings; defaults to heroImage. */
    listingImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/case-studies" }),
  schema: z.object({
    ...seo,
    /** Big heading in the coloured hero. */
    heading: z.string(),
    /** Short name used on listing cards and the menu. */
    listingTitle: z.string(),
    /** One-line summary used on the homepage feature card. */
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
    heroColor: hex.default("#000000"),
    heroTextColor: hex.default("#ffffff"),
    heroImage: z.string().optional(),
    listingImage: z.string().optional(),
    /** Small square image for the header menu. */
    menuImage: z.string().optional(),
    /** Art for the large homepage feature card (optional). */
    featuredCard: z.object({
      color: hex, colorDesktop: hex, colorHover: hex,
      logo: z.string(),
      background: z.object({ src: z.string(), class: z.string() }).optional(),
      layers: z.array(z.object({ src: z.string(), class: z.string() })).default([]),
    }).optional(),
    draft: z.boolean().default(false),
  }),
});

const testimonials = defineCollection({
  loader: file("./src/content/testimonials.yaml"),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    logo: z.string().optional(),
    /** Shown large, first. */
    featured: z.boolean().default(false),
  }),
});

export const collections = { pages, services, insights, caseStudies, testimonials };
