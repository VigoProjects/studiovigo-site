# Studio Vigo website — guide for AI-assisted changes

This repo is studiovigo.co.uk. It is built so that content and layout changes can be
made by describing them in plain English to an AI coding assistant. Read this whole
file before changing anything.

## Stack
- **Astro** (static output, one serverless function for the contact form) on **Vercel**.
- **Tailwind CSS v4**. Design tokens live in `src/styles/global.css` under `@theme`.
- Content is **files in the repo** — no database, no CMS login.
- Every push to a branch gets a Vercel preview URL. `main` is production.

## Where things live
| You want to change… | Edit this |
|---|---|
| Text, order or layout of a page | `src/content/pages/<page>.yaml` (a list of blocks) |
| An insight / blog article | `src/content/insights/<slug>.md` |
| A case study | `src/content/case-studies/<slug>.md` |
| Navigation, footer, offices, company details | `src/content/site.yaml` |
| Testimonials (shared across pages) | `src/content/testimonials.yaml` |
| Colours, fonts, type sizes, spacing | `src/styles/global.css` (`@theme`) |
| How a block looks | `src/components/blocks/<BlockName>.astro` |
| Redirects | `vercel.json` |
| Images, video, downloads | `public/assets/` (reference as `/assets/…`) |

## How pages work
A page file is front matter (title, SEO) plus `blocks:` — an ordered list. Each block
has a `type` that matches a component in `src/components/blocks/`, plus that block's
fields. To add a section, add a block. To reorder, move blocks. To remove, delete it.

```yaml
title: UX & UI Design
description: Meta description for search engines (150–160 characters).
blocks:
  - type: hero
    eyebrow: UX & UI Design
    heading: Turning complex challenges into clear, elegant experiences
    body: One or two sentences.
    cta: { label: Get in Touch, href: /contact }
  - type: faq
    heading: Frequently asked questions
    items:
      - q: Question?
        a: Answer.
```

The fields each block accepts are defined (and validated) in
`src/content/blocks.ts`. **The build fails if a page uses an unknown block or a
missing field**, so mistakes are caught before they reach the live site.

## Rules for making changes
1. **Prefer content edits over code edits.** If a request can be met by editing a
   YAML/Markdown file, do that. Don't hard-code copy inside components.
2. **Reuse existing blocks.** Only create a new block type when no existing block can
   do the job. A new block needs: a component in `src/components/blocks/`, a schema in
   `src/content/blocks.ts`, and a line in the block list below.
3. **Use design tokens, never raw values.** Colours, type sizes and spacing come from
   `@theme` (e.g. `text-gray-500`, `text-4xl`, `py-14`). No hex codes in components.
4. **Keep URLs stable.** Never rename a published page or article slug without adding
   a 301 redirect in `vercel.json`.
5. **SEO on every page:** a `title` and a `description`. Articles also need `date`,
   `author` and `excerpt`.
6. **Images:** put them in `public/assets/`, always give meaningful `alt` text, and
   prefer `.webp`/`.jpg` under ~300 KB.
7. **Before finishing, run `npm run build`** and fix any errors.
8. **Don't commit secrets.** API keys go in Vercel environment variables only.

## Block library
| type | Use for |
|---|---|
| `hero` | Page opener: eyebrow, large heading (with optional highlighted line), body, CTA, optional video/image |
| `logos` | "Trusted by" logo strip |
| `stats` | Big-number results grid |
| `prose` | Heading + rich text (Markdown) with optional image |
| `steps` | Numbered process steps |
| `services` | Service cards linking to service pages |
| `list` | Heading + bulleted list with bold lead-ins |
| `caseStudies` | Grid of case study cards (pulls from `src/content/case-studies`) |
| `testimonials` | Testimonial carousel (pulls from `testimonials.yaml`) |
| `contactForm` | Enquiry form (posts to `/api/contact`) |
| `faq` | Accordion of questions and answers |
| `insights` | Latest articles (pulls from `src/content/insights`) |
| `cta` | Closing call-to-action band |

## Contact form
`src/pages/api/contact.ts` sends enquiries by email via Resend. It needs these Vercel
environment variables: `RESEND_API_KEY`, `CONTACT_TO` (recipient), `CONTACT_FROM`
(a verified sender on the studiovigo.co.uk domain).

## Deploying
- Push a branch → Vercel builds a preview URL. Check it.
- Merge to `main` → production. Roll back from the Vercel dashboard if needed.
