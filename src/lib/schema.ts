/**
 * Structured data (JSON-LD) helpers. Google uses these to understand the business,
 * articles and page hierarchy, and to show richer search results.
 * Facts come from src/content/site.yaml, so update them there.
 */
import { site } from "./site";

export const SITE_URL = "https://studiovigo.co.uk";
const abs = (p: string) => new URL(p, SITE_URL).href;
const ORG_ID = `${SITE_URL}/#organization`;

const email = site.email;
// International format for structured data, e.g. +442035763527
const phone = site.phone.replace(/\(0\)/, "").replace(/[^\d+]/g, "");

/** The business itself. Output on the homepage and contact page. */
export const organization = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": ORG_ID,
  name: site.name,
  legalName: site.company,
  url: `${SITE_URL}/`,
  logo: abs("/assets/test-logo.svg"),
  image: abs("/assets/hero-morphing-poster.webp"),
  description: site.tagline,
  ...(email && { email }),
  ...(phone && { telephone: phone }),
  address: site.offices.map((o) => {
    const parts = o.address.split(",").map((s) => s.trim());
    const postcode = parts[parts.length - 1].match(/[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/)?.[0];
    return {
      "@type": "PostalAddress",
      streetAddress: parts[0],
      addressLocality: o.city,
      ...(postcode && { postalCode: postcode }),
      addressCountry: "GB",
    };
  }),
  areaServed: "GB",
  ...(site.sameAs?.length && { sameAs: site.sameAs }),
});

export const website = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: site.name,
  publisher: { "@id": ORG_ID },
  inLanguage: "en-GB",
});

/** Breadcrumb trail, e.g. [["Insights", "/insights"], ["Article title", "/insights/slug"]]. Home is added automatically. */
export const breadcrumbs = (trail: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [["Home", "/"] as [string, string], ...trail].map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: abs(path),
  })),
});

export const article = (o: { title: string; description?: string; path: string; date?: Date; author?: string; image?: string; type?: "Article" | "BlogPosting" }) => ({
  "@context": "https://schema.org",
  "@type": o.type ?? "Article",
  headline: o.title,
  ...(o.description && { description: o.description }),
  mainEntityOfPage: { "@type": "WebPage", "@id": abs(o.path) },
  url: abs(o.path),
  ...(o.date && { datePublished: o.date.toISOString(), dateModified: o.date.toISOString() }),
  ...(o.image && { image: [abs(o.image)] }),
  author: o.author ? { "@type": "Person", name: o.author, worksFor: { "@id": ORG_ID } } : { "@id": ORG_ID },
  publisher: { "@id": ORG_ID, "@type": "Organization", name: site.company, logo: { "@type": "ImageObject", url: abs("/assets/test-logo.svg") } },
  inLanguage: "en-GB",
});

export const service = (o: { name: string; description?: string; path: string }) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: o.name,
  ...(o.description && { description: o.description }),
  url: abs(o.path),
  provider: { "@id": ORG_ID, "@type": "ProfessionalService", name: site.name },
  areaServed: "GB",
});
