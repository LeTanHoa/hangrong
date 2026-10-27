/**
 * Creates the replaceable PNG asset contract used by Phaser.
 * Source crops come only from the supplied reference sheets; simple neutral
 * placeholders are intentionally separate files, never clickable poster crops.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('public/assets');
const rawCharacters = path.join(root, 'raw/characters_sheet.jpg');
const dirs = ['props', 'signs', 'tiles', 'spritesheets'];
dirs.forEach((dir) => fs.mkdirSync(path.join(root, dir), { recursive: true }));

const svgPng = async (name, body, width = 96, height = 96, folder = 'props') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(root, folder, `${name}.png`));
};

const outline = '#543c2a';
const shapes = {
  prop_counter: `<rect x="10" y="34" width="76" height="42" rx="5" fill="#e7973f" stroke="${outline}" stroke-width="4"/><rect x="17" y="16" width="62" height="24" rx="5" fill="#f7d47c" stroke="${outline}" stroke-width="4"/><path d="M25 76v12M72 76v12" stroke="${outline}" stroke-width="5"/>`,
  prop_planter: `<path d="M20 50h56l-8 32H28z" fill="#b96f42" stroke="${outline}" stroke-width="4"/><path d="M48 12c-22 18-12 36 0 38 12-2 22-20 0-38M29 26c-12 8-11 22 3 27M67 26c12 8 11 22-3 27" fill="#58a959" stroke="${outline}" stroke-width="4"/>`,
  prop_tree: `<rect x="42" y="53" width="13" height="36" rx="4" fill="#9a633d" stroke="${outline}" stroke-width="4"/><circle cx="48" cy="34" r="29" fill="#69b957" stroke="${outline}" stroke-width="4"/><circle cx="27" cy="42" r="18" fill="#7aca61"/><circle cx="69" cy="43" r="17" fill="#4f9c51"/>`,
  prop_fence: `<path d="M12 80V28l12-14 12 14v52M48 80V28l12-14 12 14v52M12 48h60" fill="#78a4c9" stroke="${outline}" stroke-width="4"/>`,
  prop_crate: `<rect x="12" y="33" width="72" height="49" rx="4" fill="#c98442" stroke="${outline}" stroke-width="4"/><path d="M16 43h64M30 34v47M66 34v47" stroke="#8f5630" stroke-width="5"/><circle cx="38" cy="28" r="11" fill="#74ad3d"/><circle cx="59" cy="25" r="12" fill="#e74e42"/>`,
  prop_umbrella: `<path d="M8 47Q48 4 88 47Z" fill="#65b6df" stroke="${outline}" stroke-width="4"/><path d="M48 47v40q0 7 8 7" fill="none" stroke="${outline}" stroke-width="5"/>`,
  prop_bench: `<path d="M14 31h68v18H14zM18 53h60v12H18zM25 65v22M70 65v22" fill="#c9884b" stroke="${outline}" stroke-width="4"/>`,
  prop_bus_stop: `<rect x="21" y="12" width="52" height="68" rx="4" fill="#3f8dcc" stroke="${outline}" stroke-width="4"/><rect x="29" y="23" width="36" height="25" fill="#d8f1ff"/><circle cx="47" cy="64" r="9" fill="#f4d34d" stroke="${outline}" stroke-width="3"/>`,
  prop_lantern: `<path d="M48 8v13M28 27h40v43H28zM28 42h40" stroke="${outline}" stroke-width="4" fill="#ef5d45"/><path d="M38 27v58M58 27v58" stroke="#ffc95c" stroke-width="4"/><path d="M38 70h20" stroke="#ffe28a" stroke-width="4"/>`,
  prop_fountain: `<ellipse cx="48" cy="76" rx="38" ry="14" fill="#71cbe8" stroke="${outline}" stroke-width="4"/><path d="M32 70q16-46 32 0M39 68q9-27 18 0" fill="none" stroke="#d9f8ff" stroke-width="5"/>`,
};

for (const [name, body] of Object.entries(shapes)) await svgPng(name, body);
for (const name of ['sidewalk', 'school', 'market', 'office', 'park', 'bus', 'food_street', 'city']) {
  await svgPng(`sign_${name}`, `<rect x="8" y="23" width="80" height="42" rx="7" fill="#fff5d8" stroke="${outline}" stroke-width="4"/><path d="M48 65v25" stroke="${outline}" stroke-width="6"/><circle cx="25" cy="44" r="7" fill="#ef7c4b"/><circle cx="48" cy="44" r="7" fill="#4f9fda"/><circle cx="71" cy="44" r="7" fill="#69b957"/>`, 96, 96, 'signs');
}

// Tier accessories are independent sprites so upgrades visibly change equipment and branding.
for (let tier = 1; tier <= 5; tier += 1) {
  const colors = ['#f3c56b', '#ed9346', '#dd5b43', '#496cae', '#f0ba3d'];
  const lights = tier >= 3 ? `<circle cx="14" cy="19" r="4" fill="#fff2a8"/><circle cx="82" cy="19" r="4" fill="#fff2a8"/>` : '';
  await svgPng(`cart_sign_tier_${tier}`, `<rect x="5" y="18" width="86" height="38" rx="7" fill="${colors[tier - 1]}" stroke="${outline}" stroke-width="4"/>${lights}<path d="M20 56v28M76 56v28" stroke="${outline}" stroke-width="5"/><path d="M23 37h50" stroke="#fff8dc" stroke-width="7" stroke-linecap="round"/>`, 96, 96, 'signs');
  await svgPng(`cart_equipment_tier_${tier}`, `<rect x="18" y="42" width="60" height="32" rx="5" fill="#${tier < 3 ? 'a77449' : tier < 5 ? '8898a5' : '303c54'}" stroke="${outline}" stroke-width="4"/><circle cx="34" cy="58" r="7" fill="#${tier < 3 ? 'd9a35d' : '3b4854'}"/><circle cx="61" cy="58" r="7" fill="#${tier < 3 ? 'd9a35d' : '3b4854'}"/>${tier >= 3 ? '<path d="M48 39c-8-9 8-14 0-25" stroke="#ee7048" stroke-width="5" fill="none"/>' : ''}`, 96, 96, 'props');
}

// Isometric tile placeholders form a stable tile contract for later authored maps.
await svgPng('ground_pavement', `<path d="M32 4 92 34 60 58 0 28z" fill="#d9d3c9" stroke="#b7aea2" stroke-width="2"/><path d="M0 28v36l60 28V58M60 58v34l32-24V34" fill="#bdb5aa" stroke="#a69e93" stroke-width="2"/>`, 96, 96, 'tiles');
await svgPng('ground_grass', `<path d="M32 4 92 34 60 58 0 28z" fill="#88c96c" stroke="#5b9e55" stroke-width="2"/><path d="M0 28v36l60 28V58M60 58v34l32-24V34" fill="#6dab5e" stroke="#5b9e55" stroke-width="2"/>`, 96, 96, 'tiles');

// Clean concrete sidewalk without empty tile cells or placeholder boxes.
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520"><defs><linearGradient id="pavement" x2="0" y2="1"><stop stop-color="#e3e2dd"/><stop offset="1" stop-color="#c8c7c2"/></linearGradient></defs><rect width="800" height="520" fill="#d8d8d4"/><rect y="300" width="800" height="18" fill="#b4b0a8"/><rect y="318" width="800" height="132" fill="url(#pavement)"/><path d="M0 449h800v18H0z" fill="#a2a2a0"/><path d="M0 467h800v53H0z" fill="#535557"/><path d="M0 472h800" stroke="#303234" stroke-width="5"/></svg>`)).png().toFile(path.join(root, 'background_sidewalk.png'));

// Five walk frames selected from the walk strip in the supplied character sheet.
const frames = [];
// The supplied strip alternates character variants. Select the three boy poses
// and mirror their cadence so the player does not morph identity while walking.
const walkFrameOffsets = [0, 78, 156, 78, 0];
for (let i = 0; i < walkFrameOffsets.length; i += 1) {
  const frame = await sharp(rawCharacters).extract({ left: 525 + walkFrameOffsets[i], top: 60, width: 38, height: 50 }).ensureAlpha().png().toBuffer();
  frames.push({ input: frame, left: i * 38, top: 0 });
}
await sharp({ create: { width: 190, height: 50, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(frames).png().toFile(path.join(root, 'spritesheets/player_walk_sheet.png'));
console.log('Game asset contract generated.');
