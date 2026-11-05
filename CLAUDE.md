# Studio Vigo website — guide for AI-assisted changes

This repo is **studiovigo.co.uk**. It is built so content and layout changes can be made by
describing them in plain English to an AI coding assistant. Read this file before changing anything.

## Stack
- **Astro** (static pages + one serverless function for the contact form), hosted on **Vercel**.
- **Tailwind CSS v4**. Brand tokens and custom utilities live in `src/styles/`.
- **Alpine.js** for small interactions (menu, accordions, tabs, scroll reveals, count-up stats).
- All content is **files in this repo** — no database, no CMS login.
- Every push to a branch gets a Vercel **preview URL**. `main` is **production**.

## Two kinds of page
1. **Landing pages** — `src/content/pages/<slug>.yaml`, a list of **blocks**. `home.yaml` is `/`.
   Used for: home, contact, ai-prototype-to-production, digital-product-agency-enterprise.
2. **Long-form pages** — Markdown/MDX:
   - Service pages: `src/content/services/<slug>.mdx` → `/<slug>`
   - Case studies: `src/content/case-studies/<slug>.mdx` → `/case-studies/<slug>`
   - Insights: `src/content/insights/<slug>.md` (or `.mdx`) → `/insights/<slug>`

## Where things live
| You want to change… | Edit this |
|---|---|
| Text, order or sections of a landing page | `src/content/pages/<page>.yaml` |
| A service page, case study or insight | its `.mdx` / `.md` file |
| Navigation, footer, offices, closing CTA, header-menu case studies, analytics | `src/content/site.yaml` |
| Testimonials | `src/content/testimonials.yaml` |
| Colours, fonts, type sizes, spacing | `src/styles/legacy-theme.css` (`@theme`) and `src/styles/global.css` |
| Service-page colour themes & floating shapes | `src/lib/themes.ts` |
| How a block looks | `src/components/blocks/<Name>.astro` |
| Block fields / validation | `src/content/blocks.ts` |
| Redirects, headers | `vercel.json` |
| Images, video | `public/assets/` (reference as `/assets/…`) |

## Landing-page blocks (`type:` in the YAML)
| type | What it is |
|---|---|
| `hero` | Big opener: eyebrow, heading with animated gradient `highlight`, body, buttons, video/image |
| `pageHeader` | Small centred eyebrow + statement with a gradient wash |
| `contactHero` | Greeting + list of contact methods |
| `logos` | "Trusted by" logo strip |
| `stats` | Glowing count-up numbers (`value: "42%"`, `label`) |
| `prose` | Text (Markdown) with optional framed image alongside |
| `cards` | Glowing icon cards (`icon`, `title`, `body`); `numbered: true` for steps |
| `services` | Service cards with illustrations + optional tabbed "All services" panel |
| `tabs` | Side tabs on desktop / accordion on mobile |
| `list` | Centred tick list (Markdown items, **bold** lead-ins) |
| `caseStudies` | Large animated case-study cards (`featured: [slugs]`) + testimonials |
| `testimonials` | Testimonials on their own |
| `contactForm` | Enquiry form (emails via `/api/contact`) |
| `faq` | Accordion (also outputs FAQ structured data for Google) |
| `insights` | Latest articles |
| `cta` | In-page call to action |

Every block also accepts `id` (anchor, e.g. `services` for `/#services`) and `background: grey`.
Field definitions are in `src/content/blocks.ts`. **The build fails on an unknown block or a
missing field**, so mistakes are caught before they reach the live site.

Icons are **Font Awesome** names without the prefix (e.g. `magnifying-glass`), from the site's
Font Awesome Pro kit.

## Long-form components (inside `.mdx` files, no import needed)
```mdx
<Text title="Section heading">

Markdown paragraphs, **bold**, [links](/contact), lists, tables…

</Text>

<Figure src="/assets/screenshot.png" alt="What it shows" caption="Optional" />

<Stats items={[{ value: "26%", label: "lower cart abandonment" }]} />

<Cards items={[{ icon: "pen-paintbrush", title: "In scope", body: "Markdown text" }]} />
```
Leave a blank line after `<Text …>` and before `</Text>`, or the Markdown won't render.
Plain `.md` insights are rendered as one `<Text>` column automatically.

Front matter fields for each collection are defined in `src/content.config.ts`. For a case study
to appear as a large homepage card it needs `featuredCard` art (copy an existing one as a starting point).

## Rules for making changes
1. **Prefer content edits over code edits.** If a YAML/Markdown edit can do it, do that.
   Don't hard-code copy inside components.
2. **Reuse existing blocks/components.** Only add a new block when nothing fits. A new block needs:
   a schema in `src/content/blocks.ts` (added to `block`), a component in
   `src/components/blocks/`, registration in `src/components/BlockRenderer.astro`, and a row in
   the table above.
3. **Use the design system.** Colours/sizes come from tokens (e.g. `text-gray-500`, `text-3xlx`,
   `py-31`, `rounded-lgx`, `card-gradient-coral-blue`). No raw hex values in components
   (case-study brand colours in front matter are the exception).
4. **Keep URLs stable.** Don't rename a published slug without a 301 in `vercel.json`.
5. **SEO:** every page needs `title` and `description` (150–160 chars). Images need real `alt` text.
6. **Images:** `public/assets/`, prefer `.webp`/`.jpg` under ~300 KB.
7. **Before finishing, run `npm run build`** and fix any errors.
8. **No secrets in the repo.** API keys live in Vercel environment variables.
9. **Analytics are consent-gated.** GTM only loads after "Accept All" — keep it that way (UK PECR/GDPR).

## Contact form
`src/pages/api/contact.ts` emails enquiries via Resend. Vercel env vars: `RESEND_API_KEY`,
`CONTACT_TO` (recipient, comma-separate several), `CONTACT_FROM` (verified sender on the domain).

## Deploying
- Push a branch → Vercel preview URL. Check it.
- Merge to `main` → production. Roll back instantly from the Vercel dashboard if needed.

## Housekeeping
- `legacy/` is a snapshot of the old Statamic site, kept only for reference during the rebuild.
  It isn't deployed. Delete it (and `.github/workflows/import-legacy.yml`) once the new site is live.
- `scripts/migrate-legacy.mjs` and `scripts/_*.cjs` are one-off migration helpers.
