// Dev helper: convert a homepage-template legacy page into block YAML (best effort; review output).
const {parseHTML}=require("linkedom");const fs=require("fs");const Y=require("yaml");
const TD=require("turndown");const td=new TD({headingStyle:"atx",bulletListMarker:"-"});
td.addRule("links",{filter:"a",replacement:(c,n)=>`[${c.trim()}](${(n.getAttribute("href")||"").replace(/^https?:\/\/(www\.)?studiovigo\.co\.uk/,"")||"/"})`});
const t=e=>(e?.textContent||"").replace(/\s+/g," ").trim();
const md=h=>td.turndown(h||"").trim();
const [file,out]=process.argv.slice(2);
const {document:d}=parseHTML(fs.readFileSync("legacy/studiovigo.co.uk/"+file,"utf8"));
const blocks=[];
for (const el of [...d.querySelector("main").children]) {
  const h=el.outerHTML;
  if (el.querySelector("video")||/gradient-hero--animated/.test(h)) {
    const parts=[...el.querySelectorAll(".text-4xl > div")].map(t);
    blocks.push({type:"hero",eyebrow:t(el.querySelector("h1"))||undefined,heading:parts[0],highlight:parts[1]||undefined,after:parts[2]||undefined,
      body:t(el.querySelector(".text-smx p"))||undefined, cta: (a=>a?{label:t(a),href:a.getAttribute("href")}:undefined)(el.querySelectorAll("a")[0]),
      secondaryCta:(a=>a?{label:t(a),href:a.getAttribute("href")}:undefined)(el.querySelectorAll(".flex.justify-center a")[1]),
      video:el.querySelector("video")?.getAttribute("src"), image: !el.querySelector("video") && el.querySelector("img") ? {src:el.querySelector("img").getAttribute("src"),alt:""}:undefined});
  } else if (el.querySelector("form")) {
    blocks.push({type:"contactForm",heading:t(el.querySelector("p.font-bold")),body:t(el.querySelector(".text-gray-400 p"))||undefined});
  } else if (/Trusted by|logo/i.test(t(el.querySelector("h4"))) || (el.querySelectorAll("img").length>3 && !el.querySelector("h2,h3"))) {
    blocks.push({type:"logos",heading:t(el.querySelector("h4")),items:[...el.querySelectorAll("img")].map(i=>({src:i.getAttribute("src"),alt:i.getAttribute("alt")||""}))});
  } else if (el.querySelector('[x-data="statistic"]')) {
    blocks.push({type:"stats",heading:t(el.querySelector("h2")),body:t(el.querySelector("h2 + p"))||undefined,items:[...el.querySelectorAll('[x-data="statistic"]')].map(x=>({value:t(x.querySelector(".sr-only")),label:t(x.querySelector("dt"))}))});
  } else if (el.querySelector("[x-data] button[aria-controls]") && el.querySelector("[x-collapse]")) {
    blocks.push({type:"faq",heading:t(el.querySelector("h2")),items:[...el.querySelectorAll("[x-collapse]")].map(a=>({q:t(a.parentElement.querySelector("button")),a:md(a.querySelector(".rich-text").innerHTML)}))});
  } else if (el.querySelector(".clip-rounded-square") && el.querySelector("h3")) {
    const items=[...el.querySelectorAll("h3")].map(h3=>({icon:(h3.parentElement.querySelector("i")?.getAttribute("class")||"").replace("fa-solid fa-","")||undefined,title:t(h3).replace(/^\d+\.\s*/,""),body:md(h3.parentElement.querySelector("div.text-smx")?.innerHTML)}));
    blocks.push({type:"cards",heading:t(el.querySelector("h2"))||undefined,body:t(el.querySelector("h2 + p"))||undefined,numbered:/^\d+\./.test(t(el.querySelector("h3")))||undefined,items});
  } else if (el.querySelector(".rich-text ul") && !el.querySelector(".rich-text p:not(li p)")) {
    blocks.push({type:"list",eyebrow:t(el.querySelector(".rich-text h2"))||undefined,items:[...el.querySelectorAll(".rich-text li")].map(li=>md(li.innerHTML))});
  } else if (el.querySelector(".rich-text")) {
    const rt=el.querySelector(".rich-text").cloneNode(true); const eb=rt.querySelector("h2"); const hd=rt.querySelector("h3"); eb?.remove(); hd?.remove();
    const img=[...el.querySelectorAll("img")].find(i=>!rt.contains(i));
    blocks.push({type:"prose",eyebrow:t(eb)||undefined,heading:t(hd)||undefined,body:md(rt.innerHTML),image:img?{src:img.getAttribute("src"),alt:img.getAttribute("alt")||""}:undefined});
  } else if (el.querySelector("a[href^='/insights/']")) {
    blocks.push({type:"insights",eyebrow:t(el.querySelector("h2")),heading:t(el.querySelector(".text-3xl")),limit:el.querySelectorAll("a[href^='/insights/']").length});
  } else if (el.querySelector("h2") && el.querySelector("a")) {
    const a=el.querySelector("a"); blocks.push({type:"cta",heading:t(el.querySelector("h2, .text-3xl")),body:t(el.querySelector("p:not(.text-3xl p)"))||undefined,cta:{label:t(a),href:a.getAttribute("href")}});
  } else {
    console.error("UNHANDLED:", (el.getAttribute("class")||"").slice(0,60), "|", t(el).slice(0,120));
  }
}
const title=t(d.querySelector("title")).replace(/\s*\|\s*Vigo\s*$/,"");
const desc=d.querySelector('meta[name="description"]')?.getAttribute("content");
const clean=o=>JSON.parse(JSON.stringify(o));
fs.writeFileSync(out, Y.stringify(clean({title, metaTitle: title, description: desc, blocks}),{lineWidth:0}));
console.log(blocks.map(b=>b.type).join(", "));
