import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';

const root = new URL('.', import.meta.url).pathname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
}).listen(8765);

const P = [1000, 1250];               // product card, 4:5
const pc = (items, cam = [0, 9, 44], target = [0, 5.6, 0], extra = {}) => ({ size: P, items, cam, target, ...extra });

const shots = {
  'pod-kit-red':      pc([{ type: 'podKit', opts: { color: 0xc8102e }, rotY: -0.5 }]),
  'pod-kit-white':    pc([{ type: 'podKit', opts: { color: 0xf2f2f0, finish: 'satin' }, rotY: -0.5 }]),
  'pod-kit-charcoal': pc([{ type: 'podKit', opts: { color: 0x2a2a2d }, rotY: -0.5 }]),
  'pod-pen-charcoal': pc([{ type: 'podPen', opts: { color: 0x26262a }, rotZ: 0, rotY: 0.4 }], [0, 9, 46], [0, 6.8, 0]),
  'pod-pen-white':    pc([{ type: 'podPen', opts: { color: 0xeeeeec, band: 0xc8102e }, rotY: 0.4 }], [0, 9, 46], [0, 6.8, 0]),
  'mod-kit':          pc([{ type: 'modKit', rotY: -0.45 }], [0, 10, 54], [0, 7.2, 0]),
  'salt-strawberry':  pc([{ type: 'bottle', opts: { title: 'Strawberry\nIce', sub: 'Nic salt · 50/50', strength: '20MG' }, rotY: 0 }], [0, 6, 34], [0, 4.4, 0]),
  'salt-cherry':      pc([{ type: 'bottle', opts: { title: 'Cherry\nCola', sub: 'Nic salt · 50/50', strength: '10MG' }, rotY: 0 }], [0, 6, 34], [0, 4.4, 0]),
  'salt-menthol':     pc([{ type: 'bottle', opts: { title: 'Cool\nMenthol', sub: 'Nic salt · 50/50', strength: '20MG', cap: 0x1d1d1f }, rotY: 0 }], [0, 6, 34], [0, 4.4, 0]),
  'salt-tobacco':     pc([{ type: 'bottle', opts: { title: 'Golden\nTobacco', sub: 'Nic salt · 50/50', strength: '10MG', cap: 0x1d1d1f }, rotY: 0 }], [0, 6, 34], [0, 4.4, 0]),
  'shortfill-red':    pc([{ type: 'bottle', opts: { size: '50ml', title: 'Red\nBerries', sub: '70VG / 30PG', strength: '0MG' }, rotY: 0 }], [0, 8, 46], [0, 6, 0]),
  'shortfill-mango':  pc([{ type: 'bottle', opts: { size: '50ml', title: 'Mango\nIce', sub: '70VG / 30PG', strength: '0MG' }, rotY: 0 }], [0, 8, 46], [0, 6, 0]),
  'shortfill-custard':pc([{ type: 'bottle', opts: { size: '50ml', title: 'Vanilla\nCustard', sub: '70VG / 30PG', strength: '0MG', cap: 0x1d1d1f }, rotY: 0 }], [0, 8, 46], [0, 6, 0]),
  'pods-pack':        pc([{ type: 'packBox', opts: { title: 'Replace-\nment pods', sub: 'Pack of 2 · 0.8Ω' }, rotY: -0.45 }], [0, 8, 34], [0, 3.2, 0]),
  'coils-pack':       pc([{ type: 'packBox', opts: { title: 'Mesh\ncoils', sub: 'Pack of 5 · 0.4Ω' }, rotY: 0.45 }], [0, 8, 34], [0, 3.2, 0]),

  // hero: one composed shelf, landscape and portrait crops
  'hero': { size: [1800, 1350], fov: 20, cam: [0, 12, 68], target: [0, 6.6, 0], shadow: 0.2, items: [
    { type: 'modKit', pos: [-9.5, 0, -3], rotY: -0.35 },
    { type: 'podKit', opts: { color: 0xc8102e }, pos: [-1.5, 0, 2], rotY: -0.55 },
    { type: 'podPen', opts: { color: 0x26262a }, pos: [4.3, 0, -2.5], rotY: 0.3 },
    { type: 'bottle', opts: { size: '50ml', title: 'Red\nBerries', sub: '70VG / 30PG', strength: '0MG' }, pos: [9.5, 0, -1], rotY: -0.2 },
    { type: 'bottle', opts: { title: 'Strawberry\nIce', sub: 'Nic salt · 50/50', strength: '20MG' }, pos: [5.6, 0, 4.2], rotY: -0.1 },
  ] },
  'hero-portrait': { size: [1100, 1400], fov: 22, cam: [0, 11, 50], target: [0, 6.0, 0], shadow: 0.2, items: [
    { type: 'podKit', opts: { color: 0xc8102e }, pos: [-2.2, 0, 1], rotY: -0.5 },
    { type: 'podPen', opts: { color: 0x26262a }, pos: [1.6, 0, -5], rotY: 0.3 },
    { type: 'bottle', opts: { title: 'Strawberry\nIce', sub: 'Nic salt · 50/50', strength: '20MG' }, pos: [4.4, 0, 2.6], rotY: -0.15 },
  ] },
  // category tiles
  'cat-kits':    { size: [1000, 1000], fov: 22, cam: [0, 10, 46], target: [0, 5.6, 0], items: [
    { type: 'podKit', opts: { color: 0xf2f2f0, finish: 'satin' }, pos: [-3.4, 0, -1.5], rotY: -0.3 },
    { type: 'podKit', opts: { color: 0xc8102e }, pos: [0.4, 0, 1.6], rotY: -0.5 },
    { type: 'podKit', opts: { color: 0x2a2a2d }, pos: [4.0, 0, -1.0], rotY: -0.7 },
  ] },
  'cat-liquids': { size: [1000, 1000], fov: 22, cam: [0, 9, 40], target: [0, 4.6, 0], items: [
    { type: 'bottle', opts: { size: '50ml', title: 'Red\nBerries', sub: '70VG / 30PG', strength: '0MG' }, pos: [-2.6, 0, -1.6], rotY: -0.25 },
    { type: 'bottle', opts: { title: 'Cherry\nCola', sub: 'Nic salt · 50/50', strength: '10MG' }, pos: [1.6, 0, 1.8], rotY: -0.15 },
    { type: 'bottle', opts: { title: 'Cool\nMenthol', sub: 'Nic salt · 50/50', strength: '20MG', cap: 0x1d1d1f }, pos: [4.6, 0, -0.8], rotY: -0.3 },
  ] },
  'cat-parts':   { size: [1000, 1000], fov: 22, cam: [0, 9, 40], target: [0, 3.6, 0], items: [
    { type: 'packBox', opts: { title: 'Replace-\nment pods', sub: 'Pack of 2 · 0.8Ω' }, pos: [-2.6, 0, -1], rotY: -0.4 },
    { type: 'packBox', opts: { title: 'Mesh\ncoils', sub: 'Pack of 5 · 0.4Ω' }, pos: [2.8, 0, 1.2], rotY: -0.25, scale: 0.85 },
  ] },
};

const only = process.argv.slice(2);
const outDir = join(root, 'out'); mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('console', m => console.log('page:', m.text()));
page.on('pageerror', e => console.log('pageerror:', e.message));
await page.goto('http://127.0.0.1:8765/studio.html');
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
for (const [name, shot] of Object.entries(shots)) {
  if (only.length && !only.includes(name)) continue;
  const t = Date.now();
  const url = await page.evaluate(s => window.renderShot(s), shot);
  writeFileSync(join(outDir, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log(name, Date.now() - t, 'ms');
}
await browser.close(); server.close();
