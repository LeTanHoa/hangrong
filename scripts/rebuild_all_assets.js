import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const assetsDir = path.resolve('public/assets');
const charDir = path.join(assetsDir, 'characters');
const cartDir = path.join(assetsDir, 'carts');
const locDir = path.join(assetsDir, 'locations');
const sheetDir = path.join(assetsDir, 'spritesheets');

[charDir, cartDir, locDir, sheetDir].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

// ==========================================
// 1. CHIBI CHARACTERS (Width: 64, Height: 80)
// Feet touch y: 78..80 so origin(0.5, 1) grounds firmly on sidewalk!
// ==========================================
const charSvg = (body) => `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80">
  <defs>
    <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffedd5" />
      <stop offset="100%" stop-color="#fed7aa" />
    </linearGradient>
  </defs>
  <!-- Ground contact shadow -->
  <ellipse cx="32" cy="78" rx="15" ry="2.5" fill="#1e293b" opacity="0.35" />
  ${body}
</svg>`;

const chibiHead = (hairColor, hairPath, eyes = '', mouth = '', accessory = '') => `
  <!-- Ears -->
  <circle cx="16" cy="38" r="4.5" fill="#fed7aa" stroke="#78350f" stroke-width="1.2"/>
  <circle cx="48" cy="38" r="4.5" fill="#fed7aa" stroke="#78350f" stroke-width="1.2"/>
  <!-- Head base -->
  <ellipse cx="32" cy="37" rx="16.5" ry="14.5" fill="#fef08a" stroke="#78350f" stroke-width="1.8"/>
  <ellipse cx="32" cy="37" rx="15.5" ry="13.5" fill="#ffedd5"/>
  <!-- Rosy Cheeks Blush -->
  <ellipse cx="20.5" cy="42" rx="4" ry="2.5" fill="#fda4af" opacity="0.75"/>
  <ellipse cx="43.5" cy="42" rx="4" ry="2.5" fill="#fda4af" opacity="0.75"/>
  <!-- Hair Base & Bangs -->
  ${hairPath}
  <!-- Eyes -->
  ${eyes || `
    <ellipse cx="25" cy="37" rx="3.2" ry="4.5" fill="#0f172a"/>
    <circle cx="23.8" cy="35" r="1.4" fill="#ffffff"/>
    <circle cx="26.2" cy="38.5" r="0.7" fill="#ffffff"/>
    <path d="M 21.5 32.5 Q 25 31.5 28.5 33" fill="none" stroke="#0f172a" stroke-width="1.2" stroke-linecap="round"/>
    <ellipse cx="39" cy="37" rx="3.2" ry="4.5" fill="#0f172a"/>
    <circle cx="37.8" cy="35" r="1.4" fill="#ffffff"/>
    <circle cx="40.2" cy="38.5" r="0.7" fill="#ffffff"/>
    <path d="M 35.5 33 Q 39 31.5 42.5 32.5" fill="none" stroke="#0f172a" stroke-width="1.2" stroke-linecap="round"/>
  `}
  <!-- Mouth -->
  ${mouth || `<path d="M 29.5 44 Q 32 47 34.5 44" fill="none" stroke="#be123c" stroke-width="1.6" stroke-linecap="round"/>`}
  <!-- Accessory -->
  ${accessory}
`;

const characterList = {
  // PLAYER ACTION STATES
  player_idle: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="76" rx="4.5" ry="2.8" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
    <ellipse cx="37" cy="76" rx="4.5" ry="2.8" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
    <circle cx="20" cy="58" r="3" fill="#fed7aa"/>
    <circle cx="44" cy="58" r="3" fill="#fed7aa"/>
    <rect x="36" y="54" width="16" height="8" rx="2" fill="#cbd5e1"/>
    <ellipse cx="44" cy="57" rx="6" ry="2.5" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Q 44 25 32 26 Q 20 25 16 36 Z" fill="#1e293b"/>
      <path d="M 22 28 Q 26 34 30 29" fill="none" stroke="#1e293b" stroke-width="2"/>
    `, '', `<path d="M 29 43 Q 32 48 35 43 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#ea580c"/>
      <circle cx="32" cy="15" r="2.5" fill="#ffffff"/>
      <path d="M 40 22 L 52 20" stroke="#ea580c" stroke-width="3" stroke-linecap="round"/>
    `)}
  `),

  player_walk: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="24" cy="75" rx="4.5" ry="3" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
    <ellipse cx="40" cy="77" rx="4.5" ry="2.5" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
    <ellipse cx="18" cy="57" rx="3.5" ry="4" fill="#fed7aa"/>
    <ellipse cx="46" cy="56" rx="3.5" ry="4" fill="#fed7aa"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Z" fill="#1e293b"/>
    `, '', `<path d="M 29 43 Q 32 47 35 43 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#ea580c"/>
      <circle cx="32" cy="15" r="2.5" fill="#ffffff"/>
      <path d="M 40 22 L 52 20" stroke="#ea580c" stroke-width="3" stroke-linecap="round"/>
    `)}
  `),

  player_cook: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <ellipse cx="37" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <line x1="16" y1="54" x2="10" y2="46" stroke="#475569" stroke-width="2.5"/>
    <rect x="42" y="50" width="12" height="12" fill="#94a3b8" rx="2"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Z" fill="#1e293b"/>
    `, '', `<path d="M 30 44 Q 32 47 34 44" fill="none" stroke="#be123c" stroke-width="1.5"/>`, `
      <path d="M 22 20 C 18 12, 24 7, 32 7 C 40 7, 46 12, 42 20 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="22" y="18" width="20" height="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
    `)}
  `),

  player_serve: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <ellipse cx="37" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <ellipse cx="48" cy="44" rx="10" ry="4" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
    <ellipse cx="48" cy="41" rx="6" ry="2.5" fill="#f59e0b"/>
    <circle cx="44" cy="50" r="3" fill="#fed7aa"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Z" fill="#1e293b"/>
    `, `
      <path d="M 23 37 Q 26 33 28 37" fill="none" stroke="#0f172a" stroke-width="2"/>
      <ellipse cx="39" cy="37" rx="2.8" ry="4" fill="#0f172a"/>
      <circle cx="38" cy="35.5" r="1.2" fill="#ffffff"/>
    `, `<path d="M 29 43 Q 32 48 35 43 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#ea580c"/>
    `)}
  `),

  player_celebrate: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="75" rx="4.5" ry="2.8" fill="#ea580c"/>
    <ellipse cx="37" cy="75" rx="4.5" ry="2.8" fill="#ea580c"/>
    <circle cx="15" cy="44" r="3.5" fill="#fed7aa"/>
    <circle cx="49" cy="44" r="3.5" fill="#fed7aa"/>
    <text x="10" y="34" font-size="10" fill="#facc15">✨</text>
    <text x="46" y="34" font-size="10" fill="#facc15">✨</text>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Z" fill="#1e293b"/>
    `, `
      <path d="M 22 37 L 25 34 L 28 37" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M 36 37 L 39 34 L 42 37" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>
    `, `<path d="M 28 42 Q 32 49 36 42 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#ea580c"/>
    `)}
  `),

  player_carry: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <ellipse cx="37" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <rect x="18" y="52" width="28" height="14" rx="2" fill="#c98442" stroke="#78350f" stroke-width="1.2"/>
    <circle cx="28" cy="50" r="4" fill="#ef4444"/>
    <circle cx="36" cy="50" r="4" fill="#22c55e"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Z" fill="#1e293b"/>
    `, '', `<path d="M 29 44 Q 32 47 35 44 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#ea580c"/>
    `)}
  `),

  player_tired: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <ellipse cx="37" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <circle cx="16" cy="58" r="3" fill="#fed7aa"/>
    <circle cx="48" cy="58" r="3" fill="#fed7aa"/>
    <path d="M 44 26 Q 47 22 48 26 Q 48 29 45 29 Q 43 29 44 26 Z" fill="#38bdf8"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Z" fill="#1e293b"/>
    `, `
      <path d="M 23 38 L 28 36" stroke="#0f172a" stroke-width="2"/>
      <path d="M 36 36 L 41 38" stroke="#0f172a" stroke-width="2"/>
    `, `<ellipse cx="32" cy="45" rx="3" ry="2" fill="#be123c"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#ea580c"/>
    `)}
  `),

  player_sad: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <ellipse cx="37" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Z" fill="#1e293b"/>
    `, `
      <circle cx="25" cy="37" r="3.5" fill="#0f172a"/>
      <circle cx="26" cy="36" r="1.5" fill="#ffffff"/>
      <circle cx="39" cy="37" r="3.5" fill="#0f172a"/>
      <circle cx="40" cy="36" r="1.5" fill="#ffffff"/>
    `, `<path d="M 30 46 Q 32 43 34 46" fill="none" stroke="#be123c" stroke-width="1.8" stroke-linecap="round"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#ea580c"/>
    `)}
  `),

  player_sell: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <ellipse cx="37" cy="76" rx="4.5" ry="2.8" fill="#ea580c"/>
    <circle cx="16" cy="48" r="3.5" fill="#fed7aa"/>
    <polygon points="46,50 56,44 56,58" fill="#ef4444"/>
    <rect x="42" y="48" width="6" height="8" rx="1" fill="#475569"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Z" fill="#1e293b"/>
    `, '', `<ellipse cx="32" cy="44" rx="3.5" ry="4" fill="#be123c"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#ea580c"/>
    `)}
  `),

  player_run: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="22" cy="73" rx="4" ry="3.5" fill="#ea580c"/>
    <ellipse cx="44" cy="77" rx="4.5" ry="2.5" fill="#ea580c"/>
    <ellipse cx="16" cy="54" rx="3.5" ry="4" fill="#fed7aa"/>
    <ellipse cx="48" cy="58" rx="3.5" ry="4" fill="#fed7aa"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 Q 15 22 32 22 Q 49 22 48 36 Z" fill="#1e293b"/>
    `, '', `<path d="M 29 43 Q 32 48 35 43 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#ea580c"/>
    `)}
  `),

  player_boy: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#0284c7" rx="2"/>
    <ellipse cx="27" cy="76" rx="4.5" ry="2.8" fill="#0284c7"/>
    <ellipse cx="37" cy="76" rx="4.5" ry="2.8" fill="#0284c7"/>
    <circle cx="20" cy="58" r="3" fill="#fed7aa"/>
    <circle cx="44" cy="58" r="3" fill="#fed7aa"/>
    ${chibiHead('#1e293b', `
      <path d="M 16 36 C 16 20, 48 20, 48 36 Z" fill="#1e293b"/>
    `, '', `<path d="M 29 43 Q 32 48 35 43 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="19" rx="14" ry="6" fill="#0284c7"/>
    `)}
  `),

  player_girl: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="51" width="14" height="15" fill="#ec4899" rx="2"/>
    <ellipse cx="27" cy="76" rx="4.5" ry="2.8" fill="#ec4899"/>
    <ellipse cx="37" cy="76" rx="4.5" ry="2.8" fill="#ec4899"/>
    <circle cx="12" cy="28" r="4.5" fill="#f43f5e"/>
    <circle cx="52" cy="28" r="4.5" fill="#f43f5e"/>
    ${chibiHead('#451a03', `
      <path d="M 16 36 C 15 20, 49 20, 48 36 Z" fill="#451a03"/>
      <path d="M 12 36 Q 8 50 14 54" stroke="#451a03" stroke-width="3" fill="none"/>
      <path d="M 52 36 Q 56 50 50 54" stroke="#451a03" stroke-width="3" fill="none"/>
    `, '', `<path d="M 29 43 Q 32 48 35 43 Z" fill="#be123c"/>`)}
  `),

  // 12 VIETNAMESE CUSTOMER TYPES
  cust_student_school: charSvg(`
    <rect x="24" y="49" width="16" height="19" rx="3" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
    <polygon points="28,49 36,49 32,56" fill="#dc2626"/>
    <line x1="32" y1="56" x2="33" y2="63" stroke="#dc2626" stroke-width="2.5"/>
    <ellipse cx="28" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    <ellipse cx="36" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    <rect x="23" y="51" width="3" height="14" fill="#0284c7" rx="1"/>
    <rect x="38" y="51" width="3" height="14" fill="#0284c7" rx="1"/>
    ${chibiHead('#1e293b', `
      <path d="M 16 34 C 16 20, 48 20, 48 34 C 45 24, 36 24, 32 25 C 28 24, 19 24, 16 34 Z" fill="#1e293b"/>
    `)}
  `),

  cust_student_uni: charSvg(`
    <rect x="22" y="49" width="20" height="19" rx="4" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#f8fafc"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#f8fafc"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 C 15 20, 49 20, 48 36 Z" fill="#475569"/>
    `, `
      <circle cx="25" cy="37" r="5" fill="none" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="39" cy="37" r="5" fill="none" stroke="#1e293b" stroke-width="1.5"/>
      <line x1="30" y1="37" x2="34" y2="37" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="25" cy="37" r="2" fill="#0f172a"/>
      <circle cx="39" cy="37" r="2" fill="#0f172a"/>
    `, '', `
      <path d="M 18 47 Q 32 52 46 47" fill="none" stroke="#e2e8f0" stroke-width="3"/>
    `)}
  `),

  cust_office_worker: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="1"/>
    <polygon points="31,49 33,49 34,58 32,61 30,58" fill="#1e3a8a"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    <rect x="44" y="56" width="11" height="9" rx="1.5" fill="#475569" stroke="#1e293b" stroke-width="0.8"/>
    ${chibiHead('#0f172a', `
      <path d="M 16 34 C 16 18, 48 18, 48 34 C 40 22, 24 22, 16 34 Z" fill="#0f172a"/>
    `)}
  `),

  cust_delivery_driver: charSvg(`
    <rect x="22" y="49" width="20" height="19" rx="3" fill="#16a34a" stroke="#15803d" stroke-width="1.2"/>
    <line x1="32" y1="49" x2="32" y2="67" stroke="#ffffff" stroke-width="1.5"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    ${chibiHead('#1e293b', `
      <path d="M 16 36 Q 32 20 48 36 Z" fill="#1e293b"/>
    `, '', `<path d="M 30 44 Q 32 47 34 44" fill="none" stroke="#be123c" stroke-width="1.5"/>`, `
      <path d="M 16 28 C 16 14, 48 14, 48 28 Z" fill="#16a34a" stroke="#14532d" stroke-width="1.5"/>
      <path d="M 18 28 L 46 28" stroke="#facc15" stroke-width="2.5"/>
    `)}
  `),

  cust_neighborhood_auntie: charSvg(`
    <rect x="22" y="49" width="20" height="19" rx="4" fill="#fde047" stroke="#ca8a04" stroke-width="1"/>
    <circle cx="26" cy="55" r="1.5" fill="#f43f5e"/>
    <circle cx="34" cy="60" r="1.5" fill="#f43f5e"/>
    <circle cx="38" cy="54" r="1.5" fill="#f43f5e"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.5" fill="#ec4899"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.5" fill="#ec4899"/>
    ${chibiHead('#451a03', `
      <circle cx="32" cy="20" r="6" fill="#451a03"/>
      <path d="M 16 36 C 16 22, 48 22, 48 36 Z" fill="#451a03"/>
    `, '', `<path d="M 29 44 Q 32 48 35 44 Z" fill="#be123c"/>`, `
      <polygon points="12,26 52,26 32,12" fill="#fef08a" stroke="#ca8a04" stroke-width="1.2"/>
    `)}
  `),

  cust_elderly_citizen: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="3" fill="#b45309" stroke="#78350f" stroke-width="1"/>
    <ellipse cx="27" cy="76" rx="3.5" ry="2.5" fill="#451a03"/>
    <ellipse cx="37" cy="76" rx="3.5" ry="2.5" fill="#451a03"/>
    <path d="M 14 57 Q 10 47 18 47 Q 22 57 14 57 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8"/>
    ${chibiHead('#94a3b8', `
      <path d="M 16 36 C 16 22, 48 22, 48 36 Z" fill="#e2e8f0"/>
    `, `
      <path d="M 23 37 Q 26 40 29 37" fill="none" stroke="#334155" stroke-width="1.8"/>
      <path d="M 35 37 Q 38 40 41 37" fill="none" stroke="#334155" stroke-width="1.8"/>
    `, `<path d="M 30 44 Q 32 47 34 44" fill="none" stroke="#b45309" stroke-width="1.5"/>`)}
  `),

  cust_foreign_tourist: charSvg(`
    <rect x="22" y="49" width="20" height="19" rx="3" fill="#f43f5e" stroke="#be123c" stroke-width="1"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#a16207"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#a16207"/>
    <rect x="27" y="58" width="10" height="7" rx="1.5" fill="#1e293b"/>
    <circle cx="32" cy="61.5" r="2.2" fill="#38bdf8"/>
    ${chibiHead('#eab308', `
      <path d="M 16 36 C 15 20, 49 20, 48 36 Z" fill="#fde047"/>
    `, `
      <ellipse cx="25" cy="37" rx="2.8" ry="4" fill="#0284c7"/>
      <circle cx="24" cy="35.5" r="1.2" fill="#ffffff"/>
      <ellipse cx="39" cy="37" rx="2.8" ry="4" fill="#0284c7"/>
      <circle cx="38" cy="35.5" r="1.2" fill="#ffffff"/>
    `, `<path d="M 29 44 Q 32 48 35 44 Z" fill="#be123c"/>`)}
  `),

  cust_food_critic: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="3" fill="#475569" stroke="#1e293b" stroke-width="1"/>
    <polygon points="31,49 33,49 33,57 31,57" fill="#f59e0b"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#0f172a"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#0f172a"/>
    <rect x="42" y="54" width="10" height="13" rx="1.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
    ${chibiHead('#1e293b', `
      <path d="M 16 34 C 16 18, 48 18, 48 34 Z" fill="#1e293b"/>
    `, `
      <circle cx="25" cy="37" r="4.5" fill="none" stroke="#eab308" stroke-width="1.5"/>
      <circle cx="39" cy="37" r="4.5" fill="none" stroke="#eab308" stroke-width="1.5"/>
      <line x1="29.5" y1="37" x2="34.5" y2="37" stroke="#eab308" stroke-width="1.5"/>
      <ellipse cx="25" cy="37" rx="2" ry="3" fill="#0f172a"/>
      <ellipse cx="39" cy="37" rx="2" ry="3" fill="#0f172a"/>
    `, `<path d="M 30 44 L 34 44" stroke="#be123c" stroke-width="1.5"/>`)}
  `),

  cust_loyal_office_lady: charSvg(`
    <polygon points="25,49 39,49 43,70 21,70" fill="#f472b6" stroke="#db2777" stroke-width="1"/>
    <ellipse cx="27" cy="76" rx="3.5" ry="2.5" fill="#be185d"/>
    <ellipse cx="37" cy="76" rx="3.5" ry="2.5" fill="#be185d"/>
    <rect x="14" y="58" width="8" height="9" rx="1.5" fill="#d97706"/>
    ${chibiHead('#451a03', `
      <path d="M 16 36 C 15 20, 49 20, 48 36 Z" fill="#451a03"/>
      <path d="M 14 36 Q 12 52 16 56" fill="none" stroke="#451a03" stroke-width="3"/>
      <path d="M 50 36 Q 52 52 48 56" fill="none" stroke="#451a03" stroke-width="3"/>
    `, '', `<path d="M 29 44 Q 32 48 35 44 Z" fill="#db2777"/>`)}
  `),

  cust_family_with_kids: charSvg(`
    <polygon points="23,49 37,49 41,70 19,70" fill="#818cf8" stroke="#4f46e5" stroke-width="1"/>
    <ellipse cx="26" cy="76" rx="3.5" ry="2.5" fill="#4338ca"/>
    <ellipse cx="34" cy="76" rx="3.5" ry="2.5" fill="#4338ca"/>
    <ellipse cx="48" cy="64" rx="8" ry="8" fill="#ffedd5" stroke="#f97316" stroke-width="1"/>
    <rect x="44" y="70" width="8" height="6" fill="#fde047" rx="2"/>
    <ellipse cx="46" cy="63" rx="1.5" ry="2" fill="#0f172a"/>
    <ellipse cx="50" cy="63" rx="1.5" ry="2" fill="#0f172a"/>
    <line x1="52" y1="60" x2="55" y2="48" stroke="#78350f" stroke-width="1.5"/>
    <polygon points="55,48 52,45 55,42 58,45" fill="#ef4444"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 C 16 20, 48 20, 48 36 Z" fill="#334155"/>
    `, '', `<path d="M 29 44 Q 32 47 35 44 Z" fill="#be123c"/>`)}
  `),

  cust_celebrity_vip: charSvg(`
    <rect x="22" y="49" width="20" height="19" rx="3" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1.2"/>
    <polygon points="28,49 32,55 36,49" fill="#facc15"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#1e1b4b"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#1e1b4b"/>
    ${chibiHead('#0f172a', `
      <path d="M 16 32 C 16 16, 48 16, 48 32 Z" fill="#0f172a"/>
    `, `
      <polygon points="20,33 29,33 28,41 21,41" fill="#0f172a" stroke="#facc15" stroke-width="1.2"/>
      <polygon points="35,33 44,33 43,41 36,41" fill="#0f172a" stroke="#facc15" stroke-width="1.2"/>
      <line x1="29" y1="35" x2="35" y2="35" stroke="#facc15" stroke-width="1.5"/>
    `, `<path d="M 30 45 L 34 45" stroke="#be123c" stroke-width="1.5"/>`)}
  `),

  cust_factory_worker: charSvg(`
    <rect x="22" y="49" width="20" height="19" rx="3" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#334155"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#334155"/>
    ${chibiHead('#1e293b', `
      <path d="M 16 36 Q 32 22 48 36 Z" fill="#1e293b"/>
    `, '', `<path d="M 30 44 Q 32 47 34 44" fill="none" stroke="#be123c" stroke-width="1.5"/>`, `
      <path d="M 16 28 C 16 14, 48 14, 48 28 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
      <ellipse cx="32" cy="28" rx="17" ry="3" fill="#eab308"/>
    `)}
  `),

  // 4 STAFF CHIBI CHARACTERS
  staff_assistant_1: charSvg(`
    <rect x="22" y="49" width="20" height="19" rx="3" fill="#f59e0b" stroke="#d97706" stroke-width="1.2"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 C 16 20, 48 20, 48 36 Z" fill="#1e293b"/>
    `, '', `<path d="M 29 44 Q 32 48 35 44 Z" fill="#be123c"/>`, `
      <rect x="24" y="24" width="16" height="5" fill="#f59e0b" rx="2"/>
    `)}
  `),

  staff_cook_1: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="3" fill="#ffffff" stroke="#64748b" stroke-width="1.2"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#1e293b"/>
    <line x1="16" y1="55" x2="11" y2="47" stroke="#94a3b8" stroke-width="2.5"/>
    ${chibiHead('#334155', `
      <path d="M 16 36 C 16 20, 48 20, 48 36 Z" fill="#1e293b"/>
    `, '', `<path d="M 30 44 Q 32 47 34 44" fill="none" stroke="#be123c" stroke-width="1.5"/>`, `
      <path d="M 20 18 C 16 8, 24 4, 32 4 C 40 4, 48 8, 44 18 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
    `)}
  `),

  staff_manager_1: charSvg(`
    <rect x="23" y="49" width="18" height="19" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
    <polygon points="31,49 33,49 33,57 31,57" fill="#dc2626"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#0f172a"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#0f172a"/>
    ${chibiHead('#0f172a', `
      <path d="M 16 34 C 16 18, 48 18, 48 34 Z" fill="#0f172a"/>
    `, `
      <circle cx="25" cy="37" r="4" fill="none" stroke="#facc15" stroke-width="1.5"/>
      <circle cx="39" cy="37" r="4" fill="none" stroke="#facc15" stroke-width="1.5"/>
      <line x1="29" y1="37" x2="35" y2="37" stroke="#facc15" stroke-width="1.5"/>
      <ellipse cx="25" cy="37" rx="2" ry="3" fill="#0f172a"/>
      <ellipse cx="39" cy="37" rx="2" ry="3" fill="#0f172a"/>
    `)}
  `),

  staff_supplier: charSvg(`
    <rect x="22" y="49" width="20" height="19" rx="3" fill="#ea580c" stroke="#c2410c" stroke-width="1.2"/>
    <ellipse cx="27" cy="76" rx="4" ry="2.8" fill="#78350f"/>
    <ellipse cx="37" cy="76" rx="4" ry="2.8" fill="#78350f"/>
    <rect x="42" y="52" width="14" height="12" rx="2" fill="#c98442" stroke="#78350f" stroke-width="1"/>
    ${chibiHead('#451a03', `
      <path d="M 16 36 C 16 22, 48 22, 48 36 Z" fill="#451a03"/>
    `, '', `<path d="M 29 44 Q 32 48 35 44 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="20" rx="15" ry="6" fill="#ea580c"/>
    `)}
  `),
};

// ==========================================
// 2. FOOD CARTS (TIERS 1 TO 5) in carts/
// ==========================================
const cartSvg = (body) => `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="120" viewBox="0 0 140 120">
  <defs>
    <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="50%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>
  </defs>
  <!-- Ground shadow -->
  <ellipse cx="70" cy="115" rx="55" ry="4.5" fill="#1e293b" opacity="0.35"/>
  ${body}
</svg>`;

const carts = {
  // Tier 1: Traditional wooden street cart with spoke wheels
  cart_tier_1: cartSvg(`
    <!-- Canopy -->
    <path d="M 20 20 L 120 20 L 125 40 L 15 40 Z" fill="#ea580c"/>
    <path d="M 35 20 L 50 20 L 52 40 L 37 40 Z" fill="#fef08a"/>
    <path d="M 70 20 L 85 20 L 87 40 L 72 40 Z" fill="#fef08a"/>
    <path d="M 105 20 L 120 20 L 122 40 L 107 40 Z" fill="#fef08a"/>
    <!-- Canopy poles -->
    <line x1="22" y1="40" x2="22" y2="70" stroke="#78350f" stroke-width="3"/>
    <line x1="118" y1="40" x2="118" y2="70" stroke="#78350f" stroke-width="3"/>
    <!-- Glass Showcase -->
    <rect x="24" y="44" width="92" height="26" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5" opacity="0.8"/>
    <ellipse cx="45" cy="56" rx="10" ry="4" fill="#f59e0b"/>
    <ellipse cx="70" cy="56" rx="10" ry="4" fill="#eab308"/>
    <ellipse cx="95" cy="56" rx="10" ry="4" fill="#f59e0b"/>
    <!-- Wooden Cart Body -->
    <rect x="18" y="70" width="104" height="34" rx="3" fill="#b45309" stroke="#78350f" stroke-width="2"/>
    <line x1="18" y1="82" x2="122" y2="82" stroke="#78350f" stroke-width="1.5"/>
    <line x1="18" y1="94" x2="122" y2="94" stroke="#78350f" stroke-width="1.5"/>
    <text x="70" y="90" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="900" fill="#fef08a" text-anchor="middle">BÁNH MÌ SÀI GÒN</text>
    <!-- Big Wooden Spoke Wheels -->
    <circle cx="40" cy="106" r="12" fill="#78350f" stroke="#451a03" stroke-width="2"/>
    <circle cx="40" cy="106" r="4" fill="#fef08a"/>
    <line x1="40" y1="94" x2="40" y2="118" stroke="#fef08a" stroke-width="1.5"/>
    <line x1="28" y1="106" x2="52" y2="106" stroke="#fef08a" stroke-width="1.5"/>
    <circle cx="100" cy="106" r="12" fill="#78350f" stroke="#451a03" stroke-width="2"/>
    <circle cx="100" cy="106" r="4" fill="#fef08a"/>
    <line x1="100" y1="94" x2="100" y2="118" stroke="#fef08a" stroke-width="1.5"/>
    <line x1="88" y1="106" x2="112" y2="106" stroke="#fef08a" stroke-width="1.5"/>
  `),

  // Tier 2: Upgraded Stainless Steel Cart with Gas Stove
  cart_tier_2: cartSvg(`
    <path d="M 18 18 L 122 18 L 128 38 L 12 38 Z" fill="#dc2626"/>
    <path d="M 32 18 L 47 18 L 49 38 L 34 38 Z" fill="#f8fafc"/>
    <path d="M 67 18 L 82 18 L 84 38 L 69 38 Z" fill="#f8fafc"/>
    <path d="M 102 18 L 117 18 L 119 38 L 104 38 Z" fill="#f8fafc"/>
    <line x1="20" y1="38" x2="20" y2="68" stroke="#94a3b8" stroke-width="3"/>
    <line x1="120" y1="38" x2="120" y2="68" stroke="#94a3b8" stroke-width="3"/>
    <!-- Glass Showcase -->
    <rect x="22" y="42" width="96" height="26" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5" opacity="0.85"/>
    <ellipse cx="45" cy="54" rx="10" ry="4" fill="#f59e0b"/>
    <ellipse cx="70" cy="54" rx="10" ry="4" fill="#eab308"/>
    <ellipse cx="95" cy="54" rx="10" ry="4" fill="#f59e0b"/>
    <!-- Stainless steel body -->
    <rect x="16" y="68" width="108" height="36" rx="3" fill="url(#metal)" stroke="#475569" stroke-width="2"/>
    <rect x="22" y="74" width="96" height="15" rx="2" fill="#dc2626"/>
    <text x="70" y="85" font-family="'Segoe UI', sans-serif" font-size="9.5" font-weight="900" fill="#fef08a" text-anchor="middle">BÁNH MÌ PÂTÉ NÓNG</text>
    <!-- Industrial rubber wheels -->
    <circle cx="38" cy="106" r="11" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="38" cy="106" r="4" fill="#cbd5e1"/>
    <circle cx="102" cy="106" r="11" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="102" cy="106" r="4" fill="#cbd5e1"/>
  `),

  // Tier 3: Modern Food Cart with Warm LED Signs
  cart_tier_3: cartSvg(`
    <path d="M 16 16 L 124 16 L 130 36 L 10 36 Z" fill="#ea580c"/>
    <path d="M 30 16 L 45 16 L 47 36 L 32 36 Z" fill="#fde047"/>
    <path d="M 65 16 L 80 16 L 82 36 L 67 36 Z" fill="#fde047"/>
    <path d="M 100 16 L 115 16 L 117 36 L 102 36 Z" fill="#fde047"/>
    <!-- Glass with warm glowing interior -->
    <rect x="20" y="40" width="100" height="28" fill="#fef9c3" stroke="#f59e0b" stroke-width="1.8" opacity="0.9"/>
    <ellipse cx="40" cy="54" rx="11" ry="4.5" fill="#f59e0b"/>
    <ellipse cx="70" cy="54" rx="11" ry="4.5" fill="#eab308"/>
    <ellipse cx="100" cy="54" rx="11" ry="4.5" fill="#f59e0b"/>
    <!-- Glowing LED sign -->
    <rect x="14" y="68" width="112" height="38" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
    <rect x="18" y="72" width="104" height="18" rx="2" fill="#ea580c"/>
    <text x="70" y="85" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="900" fill="#fef08a" text-anchor="middle">★ BÁNH MÌ GIÒN RỤM ★</text>
    <!-- Alloy wheels -->
    <circle cx="36" cy="108" r="11" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="36" cy="108" r="4" fill="#fef08a"/>
    <circle cx="104" cy="108" r="11" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="104" cy="108" r="4" fill="#fef08a"/>
  `),

  // Tier 4: Luxury Street Kiosk with Neon Signage
  cart_tier_4: cartSvg(`
    <rect x="12" y="14" width="116" height="22" rx="4" fill="#1e3a8a" stroke="#3b82f6" stroke-width="2"/>
    <text x="70" y="29" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="900" fill="#60a5fa" text-anchor="middle">SAIGON BREAD KIOSK</text>
    <rect x="18" y="38" width="104" height="30" rx="3" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
    <ellipse cx="40" cy="52" rx="11" ry="4.5" fill="#f59e0b"/>
    <ellipse cx="70" cy="52" rx="11" ry="4.5" fill="#eab308"/>
    <ellipse cx="100" cy="52" rx="11" ry="4.5" fill="#f59e0b"/>
    <rect x="12" y="68" width="116" height="38" rx="4" fill="#0f172a" stroke="#3b82f6" stroke-width="2.5"/>
    <rect x="18" y="73" width="104" height="18" rx="2" fill="#1d4ed8"/>
    <text x="70" y="86" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">ẨM THỰC CAO CẤP</text>
    <circle cx="36" cy="108" r="11" fill="#1e293b" stroke="#60a5fa" stroke-width="2.5"/>
    <circle cx="36" cy="108" r="4" fill="#93c5fd"/>
    <circle cx="104" cy="108" r="11" fill="#1e293b" stroke="#60a5fa" stroke-width="2.5"/>
    <circle cx="104" cy="108" r="4" fill="#93c5fd"/>
  `),

  // Tier 5: 5-Star Royal Food Truck
  cart_tier_5: cartSvg(`
    <rect x="8" y="12" width="124" height="24" rx="5" fill="#ca8a04" stroke="#fef08a" stroke-width="2"/>
    <text x="70" y="28" font-family="'Segoe UI', sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">👑 BÁNH MÌ HOÀNG GIA 👑</text>
    <rect x="14" y="38" width="112" height="30" rx="3" fill="#fef9c3" stroke="#eab308" stroke-width="2"/>
    <ellipse cx="40" cy="52" rx="11" ry="4.5" fill="#f59e0b"/>
    <ellipse cx="70" cy="52" rx="11" ry="4.5" fill="#eab308"/>
    <ellipse cx="100" cy="52" rx="11" ry="4.5" fill="#f59e0b"/>
    <rect x="8" y="68" width="124" height="38" rx="5" fill="#854d0e" stroke="#facc15" stroke-width="2.5"/>
    <rect x="14" y="73" width="112" height="18" rx="2" fill="#a16207"/>
    <text x="70" y="86" font-family="'Segoe UI', sans-serif" font-size="10" font-weight="900" fill="#fef08a" text-anchor="middle">CHUẨN VỊ 5 SAO VIỆT NAM</text>
    <circle cx="34" cy="108" r="12" fill="#ca8a04" stroke="#fde047" stroke-width="2.5"/>
    <circle cx="34" cy="108" r="5" fill="#fef08a"/>
    <circle cx="106" cy="108" r="12" fill="#ca8a04" stroke="#fde047" stroke-width="2.5"/>
    <circle cx="106" cy="108" r="5" fill="#fef08a"/>
  `),
};

// ==========================================
// 3. LOCATIONS THUMBNAIL PLACEHOLDERS
// ==========================================
const locSvg = (title, color) => `
<svg xmlns="http://www.w3.org/2000/svg" width="242" height="245" viewBox="0 0 242 245">
  <rect width="242" height="245" fill="${color}" rx="8"/>
  <rect x="10" y="10" width="222" height="150" fill="#ffffff" rx="6" opacity="0.9"/>
  <text x="121" y="90" font-size="36" text-anchor="middle">🏙️</text>
  <rect x="10" y="170" width="222" height="65" fill="#0f172a" rx="6"/>
  <text x="121" y="208" font-family="'Segoe UI', sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
</svg>`;

const locations = {
  sidewalk_start: locSvg('Vỉa Hè Khởi Nghiệp', '#fef08a'),
  school_gate: locSvg('Cổng Trường Học', '#bae6fd'),
  traditional_market: locSvg('Chợ Truyền Thống', '#fed7aa'),
  office_quarter: locSvg('Khu Văn Phòng', '#e0e7ff'),
  central_park: locSvg('Công Viên Trung Tâm', '#bbf7d0'),
  bus_station: locSvg('Bến Xe Liên Tỉnh', '#ddd6fe'),
  food_street: locSvg('Phố Đi Bộ Ẩm Thực', '#fecdd3'),
  city_center: locSvg('Trung Tâm Quận 1', '#fef3c7'),
};

async function run() {
  console.log('Generating all character sprites at HD 128x160 (density 144)...');
  for (const [name, svgContent] of Object.entries(characterList)) {
    await sharp(Buffer.from(svgContent), { density: 144 }).png().toFile(path.join(charDir, `${name}.png`));
  }
  console.log('Generating all cart tiers at HD (density 144)...');
  for (const [name, svgContent] of Object.entries(carts)) {
    await sharp(Buffer.from(svgContent), { density: 144 }).png().toFile(path.join(cartDir, `${name}.png`));
  }
  console.log('Generating all location previews at HD (density 144)...');
  for (const [name, svgContent] of Object.entries(locations)) {
    await sharp(Buffer.from(svgContent), { density: 144 }).png().toFile(path.join(locDir, `${name}.png`));
  }

  // Generate walk spritesheet (380x100 with 5 frames of 76x100 each)
  const walkFrame = await sharp(path.join(charDir, 'player_walk.png')).resize(76, 100).png().toBuffer();
  const idleFrame = await sharp(path.join(charDir, 'player_idle.png')).resize(76, 100).png().toBuffer();
  await sharp({
    create: { width: 380, height: 100, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: idleFrame, left: 0, top: 0 },
      { input: walkFrame, left: 76, top: 0 },
      { input: idleFrame, left: 152, top: 0 },
      { input: walkFrame, left: 228, top: 0 },
      { input: idleFrame, left: 304, top: 0 },
    ])
    .png()
    .toFile(path.join(sheetDir, 'player_walk_sheet.png'));

  console.log('All character sprites, carts, locations and spritesheets successfully rebuilt!');
}

run().catch(console.error);

