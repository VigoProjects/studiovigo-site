// Dev helper: SEO audit over the built site (.vercel/output/static).
const {parseHTML}=require("linkedom");const fs=require("fs");const path=require("path");
const ROOT=".vercel/output/static";
const files=[];(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else if(f==="index.html"||f.endsWith(".html"))files.push(p);}})(ROOT);
const urlOf=f=>"/"+path.relative(ROOT,f).replace(/(^|\/)index\.html$/,"").replace(/\.html$/,"");
const pages=new Set(files.map(urlOf).map(u=>u.replace(/\/$/,"")||"/"));
const issues={}; const add=(k,u,d)=>((issues[k] ||= []).push(d?`${u}  — ${d}`:u));
const titles={}, descs={};
for (const f of files) {
  const u=urlOf(f).replace(/\/$/,"")||"/"; const html=fs.readFileSync(f,"utf8"); const {document:d}=parseHTML(html);
  if (u==="/404") continue;
  const t=d.querySelector("title")?.textContent.trim()||""; (titles[t] ||= []).push(u);
  if(!t) add("Missing <title>",u); else if(t.length>60) add("Title over 60 chars (truncated in Google)",u,`${t.length}: ${t}`); else if (t.length<30) add("Title under 30 chars",u,`${t.length}: ${t}`);
  const md=d.querySelector('meta[name="description"]')?.getAttribute("content")||""; (descs[md] ||= []).push(u);
  if(!md) add("Missing meta description",u); else if(md.length>160) add("Description over 160 chars",u,md.length); else if(md.length<70) add("Description under 70 chars",u,`${md.length}: ${md}`);
  const can=d.querySelector('link[rel="canonical"]')?.getAttribute("href"); if(!can) add("Missing canonical",u); else if(can!=="https://studiovigo.co.uk"+(u==="/"?"/":u) && can!=="https://studiovigo.co.uk"+u) add("Canonical mismatch",u,can);
  if(!d.querySelector('meta[property="og:image"]')) add("No og:image (no image when shared on LinkedIn etc.)",u);
  const ogt=d.querySelector('meta[property="og:title"]')?.getAttribute("content"); if(ogt && ogt.length<15) add("og:title very short",u,ogt);
  const h1=[...d.querySelectorAll("h1")]; if(h1.length!==1) add("H1 count not 1",u,`${h1.length}: ${h1.map(h=>h.textContent.trim().slice(0,50)).join(" | ")}`);
  // heading skips inside main
  let prev=1, skips=new Set(); d.querySelectorAll("main h1,main h2,main h3,main h4,main h5,main h6").forEach(h=>{const l=+h.tagName[1]; if(l>prev+1) skips.add(`h${prev}→h${l}`); prev=l;});
  if(skips.size) add("Heading level skips",u,[...skips].join(", "));
  // images
  const imgs=[...d.querySelectorAll("main img, footer img")]; const noalt=imgs.filter(i=>!i.hasAttribute("alt")); const emptyContent=imgs.filter(i=>i.getAttribute("alt")===""&&!/illustrations|permanent-assets|quote-|footer-cta/.test(i.getAttribute("src")||""));
  if(noalt.length) add("Images with no alt attribute",u,noalt.length);
  if(emptyContent.length) add("Content images with empty alt text",u,`${emptyContent.length} (e.g. ${emptyContent.slice(0,2).map(i=>i.getAttribute("src")).join(", ")})`);
  d.querySelectorAll("img[src], source[src], video[poster]").forEach(i=>{const src=i.getAttribute("src")||i.getAttribute("poster"); if(src.startsWith("/")&&!fs.existsSync(path.join("public",decodeURIComponent(src)))&&!fs.existsSync(path.join(ROOT,decodeURIComponent(src)))) add("Missing image/video files",u,src);});
  const nodims=imgs.filter(i=>!i.getAttribute("width")); if(nodims.length) add("Images without width/height (layout shift)",u,nodims.length);
  // links
  d.querySelectorAll("a[href]").forEach(a=>{const h=a.getAttribute("href"); if(/^https?:\/\/(www\.)?studiovigo\.co\.uk/.test(h)) add("Absolute links to own domain",u,h);
    if(h.startsWith("/")&&!h.startsWith("//")){ const p=decodeURIComponent(h.split("#")[0].split("?")[0]).replace(/\/$/,"")||"/"; if(!pages.has(p)&&!fs.existsSync(path.join("public",p))&&!p.startsWith("/api")) add("Broken internal links",u,h);}
    if(!a.textContent.trim()&&!a.getAttribute("aria-label")&&!a.querySelector("img[alt]:not([alt=''])")) add("Links with no accessible text",u,h);});
  // structured data
  const ld=[...d.querySelectorAll('script[type="application/ld+json"]')].map(s=>{try{return JSON.parse(s.textContent)["@type"]}catch(e){return "INVALID"}});
  (issues["__ld"] ||= []).push(`${u}: ${ld.join(",")||"none"}`);
  if(!html.includes('rel="icon"')) add("No favicon link",u);
}
for (const [t,us] of Object.entries(titles)) if(us.length>1) add("Duplicate titles",us.join(", "),t);
for (const [t,us] of Object.entries(descs)) if(t&&us.length>1) add("Duplicate descriptions",us.join(", "),t.slice(0,60));
const ld=issues.__ld; delete issues.__ld;
for (const [k,v] of Object.entries(issues)) { console.log(`\n### ${k} (${v.length})`); v.slice(0,12).forEach(x=>console.log("  "+x)); if(v.length>12) console.log(`  …and ${v.length-12} more`); }
console.log("\n### Structured data per page"); ld.forEach(x=>console.log("  "+x));
console.log("\nPages:",pages.size, "| 404 page exists:", pages.has("/404"));
