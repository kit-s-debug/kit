// Renders art/*.svg to transparent WebP: node art/render.mjs (needs Playwright + Chromium)
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p = await b.newPage({viewport:{width:1600,height:1600}});
for (const n of ['dabba','lid']) {
  const svg = readFileSync('art/'+n+'.svg','utf8');
  await p.setContent('<html><head><link href="https://fonts.googleapis.com/css2?family=Rozha+One&display=block" rel="stylesheet"><style>html,body{margin:0;background:transparent}svg{width:1600px;height:1600px;display:block}</style></head><body>'+svg+'</body></html>');
  await p.waitForLoadState('networkidle'); await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({path:'art/'+n+'.png', omitBackground:true});
}
await b.close();
