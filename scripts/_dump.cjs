// Dev helper: dump each <main> section of a legacy page, pulling large SVGs out to files.
const {parseHTML}=require("linkedom");const fs=require("fs");
const [file, outdir] = process.argv.slice(2);
fs.mkdirSync(outdir,{recursive:true});
const {document:d}=parseHTML(fs.readFileSync("legacy/studiovigo.co.uk/"+file,"utf8"));
[...d.querySelector("main").children].forEach((el,i)=>{
  let n=0;
  let h=el.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g,(m)=>{ if(m.length<1200) return m; n++; const f=`${outdir}/s${i}-svg${n}.svg`; fs.writeFileSync(f,m); return `<!--SVG ${f.split("/").pop()} ${m.length}b ${(m.match(/class="[^"]*"/)||[""])[0]} ${(m.match(/viewBox="[^"]*"/)||[""])[0]}-->`;});
  h=h.replace(/\n\s*/g,"\n").replace(/ x-intersect(:leave)?\.threshold\.75="[^"]*"/g,"");
  fs.writeFileSync(`${outdir}/s${i}.html`,h);
  console.log(i, h.length, n);
});
