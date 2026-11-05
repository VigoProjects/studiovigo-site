// Dev helper: how much legacy page text (as 8-word sequences) is missing from the rebuilt page.
const {parseHTML}=require("linkedom");const fs=require("fs");
const L="legacy/studiovigo.co.uk", B=".vercel/output/static";
const pages=fs.readFileSync(L+"/sitemap.xml","utf8").match(/<loc>[^<]+/g).map(s=>s.replace("<loc>https://studiovigo.co.uk","")||"/");
const words=(html)=>{
  let m=html.slice(html.indexOf("<main"), html.lastIndexOf("</main>"));
  m=m.replace(/<(script|style|svg)[\s\S]*?<\/\1>/g," ").replace(/<span class="sr-only">[^<]*<\/span>/g," ").replace(/<[^>]+>/g," ");
  const t=parseHTML("<p>"+m+"</p>").document.querySelector("p").textContent;
  return t.replace(/[’‘]/g,"'").replace(/[“”]/g,'"').toLowerCase().replace(/[^a-z0-9%£$']+/g," ").trim().split(" ").filter(Boolean);
};
const sh=(w,n=8)=>{const s=new Set();for(let i=0;i+n<=w.length;i++)s.add(w.slice(i,i+n).join(" "));return s;};
let worst=[];
for (const p of pages) {
  const lf=p==="/"?L+"/index.html":L+p+".html", bf=p==="/"?B+"/index.html":B+p+"/index.html";
  if(!fs.existsSync(bf)){console.log("NO BUILD",p);continue;}
  const a=sh(words(fs.readFileSync(lf,"utf8"))), b=sh(words(fs.readFileSync(bf,"utf8")));
  const miss=[...a].filter(x=>!b.has(x)); const pct=(100*miss.length/a.size).toFixed(1);
  console.log(`${pct.padStart(5)}% missing  ${p}`);
  if (miss.length) worst.push([p,miss]);
}
for (const [p,miss] of worst.filter(([,m])=>m.length>3)) {
  // collapse consecutive shingles into phrases
  console.log("\n## "+p); let shown=0, last="";
  for (const m of miss){ const w=m.split(" "); if(last && last.split(" ").slice(1).join(" ")===w.slice(0,7).join(" ")){last=m;continue;} if(shown++<6) console.log("   …"+m+"…"); last=m; }
}
