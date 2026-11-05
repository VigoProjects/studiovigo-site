import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";
import { block } from "./content/blocks";

const seo = {
  title: z.string(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
};

/** Block-based pages: src/content/pages/<slug>.yaml (home.yaml is "/"). */
const pages = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/pages" }),
  schema: z.object({ ...seo, blocks: z.array(block) }),
});

const insights = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/insights" }),
  schema: z.object({
    ...seo,
    date: z.coerce.date(),
    author: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    tag: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/case-studies" }),
  schema: z.object({
    ...seo,
    client: z.string(),
    /** Card heading on listing pages. */
    headline: z.string(),
    tags: z.array(z.string()).default([]),
    logo: z.string().optional(),
    image: z.string().optional(),
    order: z.number().default(100),
  }),
});

const testimonials = defineCollection({
  loader: file("./src/content/testimonials.yaml"),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    logo: z.string().optional(),
  }),
});

export const collections = { pages, insights, caseStudies, testimonials };
