import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('public/assets/props');
fs.mkdirSync(outputDir, { recursive: true });

async function createStreetSignPost() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="280" viewBox="0 0 340 280">
    <defs>
      <!-- Metallic pole gradient -->
      <linearGradient id="poleGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#475569"/>
        <stop offset="25%" stop-color="#94a3b8"/>
        <stop offset="55%" stop-color="#f8fafc"/>
        <stop offset="85%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>

      <!-- Base plate gradient -->
      <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="50%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>

      <!-- Vietnamese street sign deep blue gradient -->
      <linearGradient id="boardGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="25%" stop-color="#0369a1"/>
        <stop offset="70%" stop-color="#075985"/>
        <stop offset="100%" stop-color="#082f49"/>
      </linearGradient>

      <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
    </defs>

    <!-- Ground Shadow on sidewalk pavement -->
    <ellipse cx="170" cy="270" rx="55" ry="8" fill="rgba(0,0,0,0.38)"/>

    <!-- Flanged Concrete/Steel Base -->
    <path d="M 142 270 L 152 254 L 188 254 L 198 270 Z" fill="url(#baseGrad)" stroke="#0f172a" stroke-width="1.8"/>
    <!-- Mounting Bolts -->
    <circle cx="152" cy="263" r="2.5" fill="#cbd5e1" stroke="#334155" stroke-width="0.8"/>
    <circle cx="188" cy="263" r="2.5" fill="#cbd5e1" stroke="#334155" stroke-width="0.8"/>
    <rect x="159" y="248" width="22" height="8" rx="2" fill="url(#poleGrad)" stroke="#334155" stroke-width="1.2"/>

    <!-- Upright Steel Pole -->
    <rect x="163" y="22" width="14" height="230" fill="url(#poleGrad)" stroke="#334155" stroke-width="1.5"/>

    <!-- Mid collar ring -->
    <rect x="160" y="148" width="20" height="6" rx="2" fill="url(#poleGrad)" stroke="#334155" stroke-width="1"/>

    <!-- Top Finial / Dome -->
    <circle cx="170" cy="18" r="9" fill="url(#poleGrad)" stroke="#334155" stroke-width="1.5"/>
    <circle cx="170" cy="9" r="4" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/>

    <!-- Mounting Clamping Brackets -->
    <rect x="154" y="56" width="32" height="10" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="154" y="118" width="32" height="10" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>

    <!-- Street Sign Board with Drop Shadow -->
    <g filter="url(#dropShadow)">
      <!-- Main Blue Street Plate with Crisp White Border -->
      <rect x="25" y="44" width="290" height="92" rx="10" fill="url(#boardGrad)" stroke="#ffffff" stroke-width="3.5"/>
      <!-- Inner White Pinstripe -->
      <rect x="31" y="50" width="278" height="80" rx="6" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
      
      <!-- Corner Rivets -->
      <circle cx="37" cy="56" r="2.2" fill="#e2e8f0"/>
      <circle cx="303" cy="56" r="2.2" fill="#e2e8f0"/>
      <circle cx="37" cy="124" r="2.2" fill="#e2e8f0"/>
      <circle cx="303" cy="124" r="2.2" fill="#e2e8f0"/>

      <!-- Top Subtitle Ribbon Pill -->
      <rect x="65" y="54" width="210" height="19" rx="4" fill="rgba(15,23,42,0.55)"/>

      <!-- Diagonal Glass Sheen -->
      <path d="M 32 51 L 135 51 L 80 129 L 32 129 Z" fill="rgba(255,255,255,0.08)"/>
    </g>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(path.join(outputDir, 'prop_street_sign_post.png'));
  console.log('Successfully created public/assets/props/prop_street_sign_post.png');
}

createStreetSignPost().catch(console.error);

