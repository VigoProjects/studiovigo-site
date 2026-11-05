// Dev helper: print a compact skeleton of a legacy page section (svgs collapsed, long text trimmed)
const {parseHTML}=require("linkedom");const fs=require("fs");
const [file, sel, idx, max] = process.argv.slice(2);
const {document:d}=parseHTML(fs.readFileSync("legacy/studiovigo.co.uk/"+file,"utf8"));
let els = sel==="main" ? [...d.querySelector("main").children] : [...d.querySelectorAll(sel)];
const el = els[+idx||0];
let h = el.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g,m=>`<svg ${(m.match(/viewBox="[^"]*"|class="[^"]*"/g)||[]).join(" ")}/>`)
  .replace(/\s+/g," ").replace(/> </g,"><").replace(/ x-intersect[^ >]*="[^"]*"| :class="[^"]*"/g,"");
console.log(h.slice(0, +max||6000));
