/**
 * Converts heavy raster images in public/ to WebP and rewrites every reference in src/.
 *   node scripts/optimise-images.mjs            # convert files over 150 KB
 *   node scripts/optimise-images.mjs --dry-run  # list what would change
 * Images are capped at 2400px wide (plenty for retina at the site's max width) at quality 82.
 * Run this after adding large PNG/JPG images, then commit the results.
 */
import { readdirSync, statSync, readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import sharp from "sharp";

const DRY = process.argv.includes("--dry-run");
const LIMIT = 150 * 1024;
const MAX_W = 2400;
// permanent-assets is excluded: its paths are built in code (src/lib/themes.ts, ServiceHero).
const ROOTS = ["public/assets"];
const RASTER = new Set([".png", ".jpg", ".jpeg"]);

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const srcFiles = walk("src").filter((f) => /\.(astro|ts|mdx?|ya?ml|css|json)$/.test(f));

let before = 0, after = 0;
const renames = [];
for (const file of ROOTS.flatMap(walk)) {
  if (!RASTER.has(extname(file).toLowerCase())) continue;
  const size = statSync(file).size;
  if (size < LIMIT) continue;
  const out = file.replace(/\.(png|jpe?g)(\.png)?$/i, "") + ".webp";
  if (existsSync(out) && out !== file) { console.warn("skip, target exists:", out); continue; }
  const meta = await sharp(file).metadata();
  const pipeline = sharp(file).rotate();
  if ((meta.width ?? 0) > MAX_W) pipeline.resize({ width: MAX_W });
  const buf = await pipeline.webp({ quality: 82, effort: 5 }).toBuffer();
  if (buf.length >= size) continue; // not worth it
  before += size; after += buf.length;
  renames.push([file, out]);
  console.log(`${(size / 1024).toFixed(0).padStart(6)} KB → ${(buf.length / 1024).toFixed(0).padStart(5)} KB  ${file.replace("public", "")}`);
  if (!DRY) writeFileSync(out, buf);
}

// Rewrite references (raw and URL-encoded forms) in src/
// encodeURIComponent leaves ( ) unencoded, but the content files use %28 %29, so cover both.
const enc = (p) => p.split("/").map((s) => encodeURIComponent(s).replace(/\(/g, "%28").replace(/\)/g, "%29")).join("/");
let edits = 0;
for (const f of srcFiles) {
  let s = readFileSync(f, "utf8"); const orig = s;
  for (const [from, to] of renames) {
    const a = from.replace(/^public/, ""), b = to.replace(/^public/, "");
    for (const form of new Set([a, enc(a), encodeURI(a)])) s = s.split(form).join(b);
  }
  if (s !== orig) { edits++; if (!DRY) writeFileSync(f, s); }
}
if (!DRY) for (const [from] of renames) unlinkSync(from);
console.log(`\n${renames.length} images: ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB. ${edits} source files updated.${DRY ? " (dry run)" : ""}`);
