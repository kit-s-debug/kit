/**
 * Generates stand-in artwork for the three photographs the brief calls for.
 *
 * These are NOT photographs and are not meant to ship. They exist so the layout
 * can be built, screenshotted and reviewed at the right proportions and in the
 * right palette before Lyndsay's real files arrive. `npm run check:assets`
 * fails the build while they are still in place.
 *
 *   room.jpg      3:2 landscape  — the hero, and the pinned scroll act
 *   portrait.jpg  4:5 portrait   — the welcome field
 *   logo.svg      wordmark       — drawn here rather than faked; see README
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "images");

const c = {
  ink: "#1F3D47",
  inkDeep: "#16303A",
  sage: "#7E9B6F",
  paper: "#F5F1E8",
  ochre: "#C08A2E",
  tan: "#8C5A3C",
  wall: "#B4AA9C",
  parquet: "#A9743C",
  parquetDark: "#8E5F2E",
  cream: "#EDE3D0",
  lamp: "#F6DFAE",
};

const room = `
<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1600" viewBox="0 0 2400 1600">
  <defs>
    <filter id="soft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="softer"><feGaussianBlur stdDeviation="40"/></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
    </filter>
    <radialGradient id="windowGlow" cx="0.5" cy="0.4" r="0.7">
      <stop offset="0" stop-color="#FFF6E2"/><stop offset="1" stop-color="#E8D9BC"/>
    </radialGradient>
    <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${c.lamp}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${c.lamp}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="0.45" cy="0.45" r="0.78">
      <stop offset="0.45" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#0B1418" stop-opacity="0.62"/>
    </radialGradient>
    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.parquetDark}"/><stop offset="1" stop-color="${c.parquet}"/>
    </linearGradient>
  </defs>

  <rect width="2400" height="1600" fill="${c.wall}"/>
  <!-- the navy-teal feature wall -->
  <rect x="0" y="0" width="1520" height="1120" fill="${c.ink}"/>
  <rect x="1520" y="0" width="880" height="1120" fill="#AFA596"/>

  <!-- tall sash window, right, with the lace cafe curtain -->
  <rect x="1700" y="120" width="520" height="900" fill="url(#windowGlow)"/>
  <rect x="1700" y="120" width="520" height="900" fill="none" stroke="#EFE6D3" stroke-width="10"/>
  <rect x="1700" y="560" width="520" height="12" fill="#EFE6D3"/>
  <rect x="1952" y="120" width="14" height="900" fill="#EFE6D3"/>
  <g opacity="0.72" filter="url(#soft)">
    <rect x="1700" y="640" width="520" height="380" fill="#FBF4E6"/>
  </g>
  <g opacity="0.5">
    ${Array.from({ length: 9 }, (_, i) => `<rect x="1700" y="${660 + i * 40}" width="520" height="14" fill="#fff" opacity="0.5"/>`).join("")}
  </g>
  <!-- floor-length navy curtains -->
  <rect x="1600" y="90" width="120" height="1010" fill="${c.inkDeep}"/>
  <rect x="2200" y="90" width="130" height="1010" fill="${c.inkDeep}"/>
  <g opacity="0.35">
    <rect x="1636" y="90" width="16" height="1010" fill="#0E2029"/>
    <rect x="2250" y="90" width="16" height="1010" fill="#0E2029"/>
  </g>

  <!-- cast-iron fireplace on the feature wall -->
  <rect x="300" y="600" width="440" height="520" fill="#16272E"/>
  <rect x="270" y="560" width="500" height="50" fill="#1A2F38"/>
  <rect x="360" y="700" width="320" height="420" fill="#0E1B21"/>

  <!-- gilt sunburst mirror -->
  <g transform="translate(520 330)">
    ${Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2;
      return `<rect x="-5" y="-215" width="10" height="90" rx="5" fill="${c.ochre}" opacity="0.9" transform="rotate(${(a * 180) / Math.PI})"/>`;
    }).join("")}
    <circle r="125" fill="${c.ochre}" opacity="0.95"/>
    <circle r="108" fill="#2A4A55"/>
  </g>

  <!-- patterned drum pendant -->
  <rect x="1120" y="0" width="8" height="150" fill="#12242B"/>
  <rect x="1000" y="150" width="250" height="150" rx="12" fill="${c.tan}"/>
  <g opacity="0.55">
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${1010 + i * 40}" y="150" width="16" height="150" fill="${c.ochre}"/>`).join("")}
  </g>
  <ellipse cx="1125" cy="330" rx="240" ry="150" fill="url(#lampGlow)"/>

  <!-- honey parquet floor -->
  <rect x="0" y="1120" width="2400" height="480" fill="url(#floorGrad)"/>
  <g opacity="0.22">
    ${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 130}" y="1120" width="6" height="480" fill="#5E3C16"/>`).join("")}
    ${Array.from({ length: 5 }, (_, i) => `<rect x="0" y="${1150 + i * 90}" width="2400" height="5" fill="#5E3C16"/>`).join("")}
  </g>

  <!-- cream sheepskin rug -->
  <ellipse cx="1140" cy="1400" rx="620" ry="170" fill="${c.cream}" opacity="0.92" filter="url(#soft)"/>

  <!-- tan leather sofas -->
  <g>
    <rect x="60" y="880" width="700" height="330" rx="46" fill="${c.tan}"/>
    <rect x="90" y="840" width="640" height="120" rx="46" fill="#9C6845"/>
    <rect x="120" y="960" width="270" height="90" rx="30" fill="#7A4E33"/>
    <rect x="420" y="960" width="270" height="90" rx="30" fill="#7A4E33"/>
  </g>
  <g>
    <rect x="1760" y="920" width="560" height="290" rx="44" fill="#845337"/>
    <rect x="1790" y="884" width="500" height="110" rx="44" fill="#9C6845"/>
  </g>

  <!-- the mustard armchair -->
  <g>
    <rect x="900" y="860" width="440" height="330" rx="48" fill="${c.ochre}"/>
    <rect x="928" y="806" width="384" height="130" rx="52" fill="#CE9738"/>
    <rect x="944" y="1000" width="352" height="96" rx="34" fill="#A9761F"/>
  </g>

  <!-- houseplants -->
  <g transform="translate(1470 980)">
    <rect x="-38" y="120" width="76" height="86" rx="10" fill="${c.tan}"/>
    ${Array.from({ length: 9 }, (_, i) => {
      const a = -70 + i * 17;
      return `<ellipse cx="0" cy="40" rx="20" ry="86" fill="${c.sage}" opacity="0.92" transform="rotate(${a}) translate(0 -46)"/>`;
    }).join("")}
  </g>

  <!-- warm lamplight pooling low-left, and the vignette that lifts on load -->
  <ellipse cx="380" cy="1080" rx="620" ry="420" fill="url(#lampGlow)" opacity="0.55" filter="url(#softer)"/>
  <rect width="2400" height="1600" fill="url(#vignette)"/>
  <rect width="2400" height="1600" filter="url(#grain)" opacity="0.9"/>
</svg>`;

const portrait = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2000" viewBox="0 0 1600 2000">
  <defs>
    <filter id="s"><feGaussianBlur stdDeviation="26"/></filter>
    <radialGradient id="key" cx="0.34" cy="0.3" r="0.7">
      <stop offset="0" stop-color="#D8CDBA"/><stop offset="1" stop-color="#9E958A"/>
    </radialGradient>
    <filter id="grain2">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="1600" height="2000" fill="url(#key)"/>
  <!-- shoulders -->
  <ellipse cx="800" cy="2020" rx="640" ry="520" fill="#3D5F6C"/>
  <!-- the blue scarf -->
  <path d="M470 1560 q330 190 660 0 l70 460 h-800 z" fill="#31596B"/>
  <path d="M560 1600 q240 150 480 0 l30 400 h-540 z" fill="#3E6B7E" filter="url(#s)"/>
  <!-- head -->
  <ellipse cx="800" cy="1010" rx="300" ry="370" fill="#C9A98E"/>
  <!-- hair -->
  <path d="M800 590 q330 0 340 380 q6 220 -70 330 q40 -300 -70 -420 q-190 90 -420 -10 q-100 130 -60 430 q-80 -110 -70 -330 q10 -380 350 -380 z" fill="#5A4433"/>
  <!-- a little of the room behind her -->
  <rect x="0" y="0" width="330" height="1180" fill="${c.ink}" opacity="0.9"/>
  <rect x="1330" y="0" width="270" height="900" fill="${c.ochre}" opacity="0.28"/>
  <rect width="1600" height="2000" filter="url(#grain2)" opacity="0.9"/>
</svg>`;

await mkdir(OUT, { recursive: true });

const written = {};
for (const [name, svg, w] of [["room", room, 2400], ["portrait", portrait, 1600]]) {
  const buf = await sharp(Buffer.from(svg), { density: 200 })
    .resize({ width: w })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  const file = path.join(OUT, `${name}.jpg`);
  await writeFile(file, buf);
  written[`images/${name}.jpg`] = createHash("sha256").update(buf).digest("hex").slice(0, 16);
  console.log(`  ${name}.jpg  ${(buf.length / 1024).toFixed(0)} KB`);
}

// Open Graph / Twitter card, cropped from the room and darkened for overlaid type.
const og = await sharp(path.join(OUT, "room.jpg"))
  .resize(1200, 630, { fit: "cover", position: "attention" })
  .modulate({ brightness: 0.86 })
  .jpeg({ quality: 80, mozjpeg: true })
  .toBuffer();
await writeFile(path.join(process.cwd(), "public", "og.jpg"), og);
console.log(`  og.jpg    ${(og.length / 1024).toFixed(0)} KB`);

await writeFile(
  path.join(OUT, "PLACEHOLDERS.json"),
  JSON.stringify(
    {
      note: "Delete an entry once the real photograph replaces the file. check:assets reads this.",
      files: written,
    },
    null,
    2,
  ) + "\n",
);
console.log("\nStand-in artwork written. These are not photographs — see README.");
