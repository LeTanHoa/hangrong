import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const width = 800;
const height = 520;

const commonDefs = `
  <defs>
    <!-- Sky gradient -->
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc" />
      <stop offset="60%" stop-color="#bae6fd" />
      <stop offset="100%" stop-color="#e0f2fe" />
    </linearGradient>

    <!-- Clean, smooth concrete sidewalk gradient without awkward grid lines -->
    <linearGradient id="slabGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0" />
      <stop offset="30%" stop-color="#cbd5e1" />
      <stop offset="75%" stop-color="#d8e0e8" />
      <stop offset="100%" stop-color="#c1cbd6" />
    </linearGradient>

    <!-- Curb top bevel -->
    <linearGradient id="curbTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>

    <!-- Curb vertical face -->
    <linearGradient id="curbFace" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="40%" stop-color="#64748b" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>

    <!-- Road asphalt (smooth dark grey) -->
    <linearGradient id="roadAsphalt" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2d3139" />
      <stop offset="35%" stop-color="#3b3e47" />
      <stop offset="100%" stop-color="#26282f" />
    </linearGradient>

    <!-- Fire hydrant gradient -->
    <linearGradient id="hydrantGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b91c1c" />
      <stop offset="30%" stop-color="#ef4444" />
      <stop offset="65%" stop-color="#f87171" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>

    <!-- Drop shadow for sharp signs -->
    <filter id="signShadow" x="-10%" y="-10%" width="125%" height="130%">
      <feDropShadow dx="0" dy="2.5" stdDeviation="1.5" flood-color="#0f172a" flood-opacity="0.35"/>
    </filter>
    <filter id="awningShadow" x="-5%" y="-5%" width="110%" height="135%">
      <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.3"/>
    </filter>
  </defs>
`;

const sidewalkAndCurb = (decorations = '') => `
  <!-- Sidewalk base concrete (Clean, continuous, spacious pavement without leftover grid lines) -->
  <rect x="0" y="240" width="800" height="202" fill="url(#slabGrad)"/>

  <!-- Subtle natural pavement horizon shade at building base -->
  <rect x="0" y="240" width="800" height="6" fill="#64748b" opacity="0.3"/>
  <line x1="0" y1="240" x2="800" y2="240" stroke="#475569" stroke-width="1.2"/>

  <!-- Specific sidewalk decorations (fire hydrant, curb lamp, etc.) -->
  ${decorations}

  <!-- Curb bevel (y: 442..465) -->
  <rect x="0" y="442" width="800" height="9" fill="url(#curbTop)" stroke="#94a3b8" stroke-width="0.8"/>
  <line x1="0" y1="442" x2="800" y2="442" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="0" y="451" width="800" height="14" fill="url(#curbFace)"/>
  <line x1="0" y1="451" x2="800" y2="451" stroke="#475569" stroke-width="1"/>

  <!-- Vertical curb blocks (Clean kerb stone divisions every 100px) -->
  ${[0, 100, 200, 300, 400, 500, 600, 700, 800].map((x) => `
    <line x1="${x}" y1="442" x2="${x}" y2="465" stroke="#1e293b" stroke-width="1.5" opacity="0.7"/>
    <line x1="${x + 1}" y1="442" x2="${x + 1}" y2="465" stroke="#ffffff" stroke-width="0.8" opacity="0.5"/>
  `).join('')}

  <!-- Road Asphalt (y: 465..520) -->
  <rect x="0" y="465" width="800" height="55" fill="url(#roadAsphalt)"/>
  <line x1="0" y1="465" x2="800" y2="465" stroke="#1e293b" stroke-width="1.5"/>
  <path d="M 60 495 Q 180 488 280 498 Q 210 508 100 504 Z" fill="#474a54" opacity="0.35"/>
  <path d="M 420 488 Q 540 480 660 492 Q 580 502 460 498 Z" fill="#474a54" opacity="0.35"/>
`;

// =========================================================================
// SCREEN 1: TIỆM BÁNH MÌ | SỬA XE MÁY | TRÀ ĐÁ CÀ PHÊ | CẮT TÓC NAM
// =========================================================================
const screen1Decorations = `
  <!-- Red Fire Hydrant on curb (x: 190) -->
  <g id="fire-hydrant">
    <ellipse cx="190" cy="432" rx="18" ry="6" fill="#475569" opacity="0.35"/>
    <ellipse cx="190" cy="428" rx="15" ry="5" fill="#7f1d1d"/>
    <rect x="176" y="416" width="28" height="12" rx="2" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.5"/>
    <rect x="173" y="412" width="34" height="5" rx="1.5" fill="#991b1b" stroke="#7f1d1d" stroke-width="1"/>
    <rect x="178" y="372" width="24" height="42" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.5"/>
    <line x1="183" y1="373" x2="183" y2="412" stroke="#7f1d1d" stroke-width="1.8"/>
    <line x1="188" y1="373" x2="188" y2="412" stroke="#f87171" stroke-width="1.5"/>
    <line x1="193" y1="373" x2="193" y2="412" stroke="#f87171" stroke-width="1.5"/>
    <line x1="197" y1="373" x2="197" y2="412" stroke="#7f1d1d" stroke-width="1.8"/>
    <path d="M 178 382 L 166 384 L 166 394 L 178 396 Z" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.2"/>
    <rect x="163" y="383" width="4" height="12" rx="1" fill="#f87171" stroke="#7f1d1d" stroke-width="1"/>
    <path d="M 202 382 L 214 384 L 214 394 L 202 396 Z" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.2"/>
    <rect x="213" y="383" width="4" height="12" rx="1" fill="#f87171" stroke="#7f1d1d" stroke-width="1"/>
    <rect x="174" y="367" width="32" height="6" rx="2" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.2"/>
    <path d="M 176 367 Q 190 354 204 367 Z" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.5"/>
    <rect x="187" y="352" width="6" height="5" fill="#f87171" stroke="#7f1d1d" stroke-width="1"/>
  </g>
`;

const screen1Storefronts = `
  <!-- SHOP 1: SỬA XE MÁY (x: 0..200) -->
  <g id="shop1" transform="translate(200 0)">
    <!-- Wall & Upper Bricks -->
    <rect x="0" y="0" width="200" height="240" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
    <line x1="0" y1="18" x2="200" y2="18" stroke="#eab308" stroke-width="1" opacity="0.6"/>
    <line x1="0" y1="70" x2="200" y2="70" stroke="#ca8a04" stroke-width="1.5"/>

    <!-- Crisp Signboard -->
    <g filter="url(#signShadow)">
      <rect x="10" y="22" width="180" height="44" rx="4" fill="#dc2626" stroke="#991b1b" stroke-width="2.5"/>
      <rect x="13" y="25" width="174" height="38" rx="2" fill="#ef4444" stroke="#facc15" stroke-width="1.5"/>
      <text x="100" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1">SỬA XE MÁY</text>
      <text x="100" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle">BƠM VÁ XE • THAY NHỚT • RỬA XE</text>
    </g>

    <!-- Striped Awning -->
    <g filter="url(#awningShadow)">
      <path d="M 4 72 L 196 72 L 198 102 L 2 102 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="1"/>
      <path d="M 24 72 L 44 72 L 46 102 L 26 102 Z" fill="#ffffff"/>
      <path d="M 64 72 L 84 72 L 86 102 L 66 102 Z" fill="#ffffff"/>
      <path d="M 104 72 L 124 72 L 126 102 L 106 102 Z" fill="#ffffff"/>
      <path d="M 144 72 L 164 72 L 166 102 L 146 102 Z" fill="#ffffff"/>
      <path d="M 184 72 L 196 72 L 198 102 L 186 102 Z" fill="#ffffff"/>
    </g>

    <!-- Workshop Door & Interior -->
    <rect x="12" y="106" width="176" height="134" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
    <rect x="18" y="112" width="164" height="128" fill="#334155"/>

    <!-- Tool Pegboard -->
    <rect x="25" y="116" width="95" height="55" fill="#475569" rx="2" stroke="#1e293b" stroke-width="1.2"/>
    <line x1="35" y1="122" x2="35" y2="148" stroke="#e2e8f0" stroke-width="3"/>
    <line x1="48" y1="122" x2="48" y2="152" stroke="#e2e8f0" stroke-width="3"/>
    <line x1="62" y1="122" x2="62" y2="144" stroke="#e2e8f0" stroke-width="3"/>
    <line x1="75" y1="122" x2="75" y2="150" stroke="#e2e8f0" stroke-width="3"/>
    <line x1="88" y1="122" x2="88" y2="142" stroke="#e2e8f0" stroke-width="3"/>

    <!-- Air Compressor & Oil Can -->
    <ellipse cx="44" cy="225" rx="16" ry="8" fill="#ef4444" stroke="#991b1b" stroke-width="1.8"/>
    <rect x="34" y="210" width="20" height="14" fill="#dc2626" rx="2"/>
    <circle cx="50" cy="204" r="5" fill="#f8fafc" stroke="#1e293b" stroke-width="1.5"/>

    <!-- Workbench & Spare parts -->
    <rect x="74" y="202" width="48" height="26" fill="#2563eb" rx="2" stroke="#1e3a8a" stroke-width="1.5"/>
    <rect x="84" y="186" width="26" height="14" rx="2" fill="#3b82f6" stroke="#1e293b" stroke-width="1.2"/>

    <!-- Motorcycle Tires leaning against wall -->
    <ellipse cx="148" cy="208" rx="14" ry="22" fill="#0f172a" stroke="#334155" stroke-width="3"/>
    <ellipse cx="148" cy="208" rx="6" ry="12" fill="#475569"/>
    <ellipse cx="162" cy="214" rx="14" ry="22" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
    <ellipse cx="162" cy="214" rx="6" ry="12" fill="#334155"/>

    <!-- Shutter top valance -->
    <rect x="12" y="106" width="176" height="16" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
    <line x1="12" y1="114" x2="188" y2="114" stroke="#475569" stroke-width="1.5"/>
  </g>

  <!-- SHOP 2: TIỆM BÁNH MÌ (x: 200..400) -->
  <g id="shop2" transform="translate(-200 0)">
    <!-- Warm Facade -->
    <rect x="200" y="0" width="200" height="240" fill="#fff7ed" stroke="#ea580c" stroke-width="1.5"/>
    <line x1="200" y1="18" x2="400" y2="18" stroke="#fdba74" stroke-width="1" opacity="0.6"/>

    <!-- Crisp Signboard -->
    <g filter="url(#signShadow)">
      <rect x="210" y="22" width="180" height="44" rx="4" fill="#c2410c" stroke="#9a3412" stroke-width="2.5"/>
      <rect x="213" y="25" width="174" height="38" rx="2" fill="#ea580c" stroke="#fef08a" stroke-width="1.5"/>
      <text x="300" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1">TIỆM BÁNH MÌ</text>
      <text x="300" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle">BÁNH MÌ PÂTÉ • THỊT NƯỚNG NÓNG GIÒN</text>
    </g>

    <!-- Warm Orange & Yellow Awning -->
    <g filter="url(#awningShadow)">
      <path d="M 204 72 L 396 72 L 398 102 L 202 102 Z" fill="#ea580c" stroke="#c2410c" stroke-width="1"/>
      <path d="M 224 72 L 244 72 L 246 102 L 226 102 Z" fill="#fef08a"/>
      <path d="M 264 72 L 284 72 L 286 102 L 266 102 Z" fill="#fef08a"/>
      <path d="M 304 72 L 324 72 L 326 102 L 306 102 Z" fill="#fef08a"/>
      <path d="M 344 72 L 364 72 L 366 102 L 346 102 Z" fill="#fef08a"/>
      <path d="M 384 72 L 396 72 L 398 102 L 386 102 Z" fill="#fef08a"/>
    </g>

    <!-- Storefront Glass Case -->
    <rect x="212" y="106" width="176" height="134" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
    <rect x="220" y="114" width="160" height="92" rx="3" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>

    <!-- Glass Reflection Highlights -->
    <polygon points="230,116 280,116 250,204 222,204" fill="#ffffff" opacity="0.35"/>

    <!-- Bread Shelf 1: Crispy Golden Baguettes -->
    <rect x="226" y="146" width="148" height="5" fill="#78350f" rx="1"/>
    <ellipse cx="245" cy="138" rx="13" ry="5.5" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
    <ellipse cx="275" cy="138" rx="13" ry="5.5" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
    <ellipse cx="305" cy="138" rx="13" ry="5.5" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
    <ellipse cx="335" cy="138" rx="13" ry="5.5" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>

    <!-- Bread Shelf 2: Meat, Pâté & Herbs -->
    <rect x="226" y="176" width="148" height="5" fill="#78350f" rx="1"/>
    <ellipse cx="248" cy="168" rx="14" ry="6" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
    <ellipse cx="278" cy="168" rx="14" ry="6" fill="#16a34a" stroke="#14532d" stroke-width="1"/>
    <ellipse cx="308" cy="168" rx="14" ry="6" fill="#dc2626" stroke="#991b1b" stroke-width="1"/>
    <ellipse cx="338" cy="168" rx="14" ry="6" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>

    <!-- Bottom Counter Wall -->
    <rect x="214" y="210" width="172" height="30" fill="#9a3412" stroke="#7c2d12" stroke-width="1.5"/>
    <text x="300" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#fef08a" text-anchor="middle">GIÒN RỤM • ĐẦY ĐỦ NHÂN: 25.000Đ</text>
  </g>

  <!-- SHOP 3: TRÀ ĐÁ - NƯỚC MÍA (x: 400..600) -->
  <g id="shop3">
    <!-- Fresh Mint Teal Facade -->
    <rect x="400" y="0" width="200" height="240" fill="#f0fdfa" stroke="#0f766e" stroke-width="1.5"/>
    <line x1="400" y1="18" x2="600" y2="18" stroke="#99f6e4" stroke-width="1" opacity="0.6"/>

    <!-- Crisp Signboard -->
    <g filter="url(#signShadow)">
      <rect x="410" y="22" width="180" height="44" rx="4" fill="#0369a1" stroke="#075985" stroke-width="2.5"/>
      <rect x="413" y="25" width="174" height="38" rx="2" fill="#0284c7" stroke="#bae6fd" stroke-width="1.5"/>
      <text x="500" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">QUÁN TRÀ ĐÁ</text>
      <text x="500" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" fill="#fef08a" text-anchor="middle">NƯỚC MÍA SIÊU SẠCH • CÀ PHÊ SỮA</text>
    </g>

    <!-- Green & White Awning -->
    <g filter="url(#awningShadow)">
      <path d="M 404 72 L 596 72 L 598 102 L 402 102 Z" fill="#15803d" stroke="#166534" stroke-width="1"/>
      <path d="M 424 72 L 444 72 L 446 102 L 426 102 Z" fill="#ffffff"/>
      <path d="M 464 72 L 484 72 L 486 102 L 466 102 Z" fill="#ffffff"/>
      <path d="M 504 72 L 524 72 L 526 102 L 506 102 Z" fill="#ffffff"/>
      <path d="M 544 72 L 564 72 L 566 102 L 546 102 Z" fill="#ffffff"/>
      <path d="M 584 72 L 596 72 L 598 102 L 586 102 Z" fill="#ffffff"/>
    </g>

    <!-- Drink Bar Storefront -->
    <rect x="412" y="106" width="176" height="134" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
    <rect x="420" y="120" width="160" height="88" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>

    <!-- Big Stainless Steel Sugarcane / Ice Drink Station -->
    <rect x="432" y="148" width="36" height="56" rx="2" fill="#cbd5e1" stroke="#475569" stroke-width="1.8"/>
    <circle cx="450" cy="168" r="9" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>

    <!-- Colorful Drink Pitchers (Trà chanh, Trà tắc, Cà phê) -->
    <rect x="480" y="152" width="22" height="42" fill="#f59e0b" rx="3" stroke="#b45309" stroke-width="1.5"/>
    <rect x="508" y="148" width="22" height="46" fill="#f97316" rx="3" stroke="#c2410c" stroke-width="1.5"/>
    <rect x="536" y="156" width="22" height="38" fill="#78350f" rx="3" stroke="#451a03" stroke-width="1.5"/>

    <!-- Bottom Counter -->
    <rect x="414" y="210" width="172" height="30" fill="#0d9488" stroke="#0f766e" stroke-width="1.5"/>
    <text x="500" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">GIẢI KHÁT BÌNH DÂN: 5K - 15K</text>
  </g>

  <!-- SHOP 4: CẮT TÓC NAM (x: 600..800) -->
  <g id="shop4">
    <!-- Clean Salon Facade -->
    <rect x="600" y="0" width="200" height="240" fill="#f8fafc" stroke="#2563eb" stroke-width="1.5"/>
    <line x1="600" y1="18" x2="800" y2="18" stroke="#93c5fd" stroke-width="1" opacity="0.6"/>

    <!-- Crisp Signboard -->
    <g filter="url(#signShadow)">
      <rect x="610" y="22" width="180" height="44" rx="4" fill="#1e40af" stroke="#1e3a8a" stroke-width="2.5"/>
      <rect x="613" y="25" width="174" height="38" rx="2" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"/>
      <text x="700" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">CẮT TÓC NAM</text>
      <text x="700" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" fill="#fde047" text-anchor="middle">HỚT TÓC • CẠO MẶT • RÁY TAI • GỘI ĐẦU</text>
    </g>

    <!-- Blue & White Awning -->
    <g filter="url(#awningShadow)">
      <path d="M 604 72 L 796 72 L 798 102 L 602 102 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="1"/>
      <path d="M 624 72 L 644 72 L 646 102 L 626 102 Z" fill="#ffffff"/>
      <path d="M 664 72 L 684 72 L 686 102 L 666 102 Z" fill="#ffffff"/>
      <path d="M 704 72 L 724 72 L 726 102 L 706 102 Z" fill="#ffffff"/>
      <path d="M 744 72 L 764 72 L 766 102 L 746 102 Z" fill="#ffffff"/>
      <path d="M 784 72 L 796 72 L 798 102 L 786 102 Z" fill="#ffffff"/>
    </g>

    <!-- Salon Interior & Mirrors -->
    <rect x="612" y="106" width="176" height="134" fill="#f1f5f9" stroke="#1e40af" stroke-width="2"/>
    <rect x="620" y="114" width="160" height="94" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>

    <!-- Mirrors with Frames -->
    <rect x="630" y="120" width="46" height="58" rx="3" fill="#ffffff" stroke="#64748b" stroke-width="2"/>
    <polygon points="634,124 656,124 642,174 634,174" fill="#bae6fd" opacity="0.6"/>
    <rect x="708" y="120" width="46" height="58" rx="3" fill="#ffffff" stroke="#64748b" stroke-width="2"/>
    <polygon points="712,124 734,124 720,174 712,174" fill="#bae6fd" opacity="0.6"/>

    <!-- Classic Barber Chair Base & Leather Seat -->
    <ellipse cx="653" cy="204" rx="15" ry="4.5" fill="#64748b"/>
    <line x1="653" y1="204" x2="653" y2="194" stroke="#94a3b8" stroke-width="4"/>
    <ellipse cx="653" cy="192" rx="13" ry="5.5" fill="#dc2626" stroke="#991b1b" stroke-width="1.2"/>
    <rect x="645" y="176" width="16" height="14" rx="2" fill="#b91c1c" stroke="#7f1d1d" stroke-width="1"/>

    <!-- Barber Pole (Left entrance) -->
    <rect x="613" y="118" width="12" height="42" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="613" y1="124" x2="625" y2="132" stroke="#dc2626" stroke-width="3"/>
    <line x1="613" y1="134" x2="625" y2="142" stroke="#2563eb" stroke-width="3"/>
    <line x1="613" y1="144" x2="625" y2="152" stroke="#dc2626" stroke-width="3"/>

    <!-- Bottom Counter -->
    <rect x="614" y="210" width="172" height="30" fill="#1d4ed8" stroke="#1e40af" stroke-width="1.5"/>
    <text x="700" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">GIÁ BÌNH DÂN: 30.000Đ</text>
  </g>
`;

// =========================================================================
// SCREEN 2: QUÁN PHỞ BÒ | TIỆM TẠP HOÁ | BÁNH TRÁNG TRỘN | SỬA KHOÁ MAY VÁ
// =========================================================================
const screen2Decorations = `
  <!-- Sidewalk Street Lamp at Left Edge (x: 40) -->
  <g id="street-lamp-screen2">
    <rect x="36" y="250" width="8" height="12" rx="2" fill="#334155"/>
    <line x1="40" y1="250" x2="40" y2="95" stroke="#1e293b" stroke-width="4"/>
    <path d="M 40 105 Q 40 75 56 75 L 62 75" fill="none" stroke="#1e293b" stroke-width="3.5"/>
    <path d="M 56 75 L 68 85 L 54 85 Z" fill="#475569"/>
    <circle cx="61" cy="86" r="5" fill="#fef08a"/>
  </g>
`;

const screen2Storefronts = `
  <!-- SHOP 1: QUÁN PHỞ BÒ - BÚN BÒ HUẾ (x: 0..200) -->
  <g id="shop2-1">
    <rect x="0" y="0" width="200" height="240" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5"/>

    <!-- Crisp Signboard -->
    <g filter="url(#signShadow)">
      <rect x="10" y="22" width="180" height="44" rx="4" fill="#991b1b" stroke="#7f1d1d" stroke-width="2.5"/>
      <rect x="13" y="25" width="174" height="38" rx="2" fill="#b91c1c" stroke="#facc15" stroke-width="1.5"/>
      <text x="100" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="14.5" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1">PHỞ BÒ • BÚN BÒ</text>
      <text x="100" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle">GIA TRUYỀN 30 NĂM • NÓNG HỔI ĐẶC BIỆT</text>
    </g>

    <!-- Red & Gold Awning -->
    <g filter="url(#awningShadow)">
      <path d="M 4 72 L 196 72 L 198 102 L 2 102 Z" fill="#dc2626" stroke="#b91c1c" stroke-width="1"/>
      <path d="M 24 72 L 44 72 L 46 102 L 26 102 Z" fill="#fef08a"/>
      <path d="M 64 72 L 84 72 L 86 102 L 66 102 Z" fill="#fef08a"/>
      <path d="M 104 72 L 124 72 L 126 102 L 106 102 Z" fill="#fef08a"/>
      <path d="M 144 72 L 164 72 L 166 102 L 146 102 Z" fill="#fef08a"/>
      <path d="M 184 72 L 196 72 L 198 102 L 186 102 Z" fill="#fef08a"/>
    </g>

    <!-- Kitchen Display -->
    <rect x="12" y="106" width="176" height="134" fill="#fee2e2" stroke="#b91c1c" stroke-width="2"/>
    <rect x="20" y="114" width="160" height="92" fill="#ffffff" stroke="#fca5a5" stroke-width="2"/>

    <!-- Giant Stainless Steel Broth Pot -->
    <rect x="28" y="146" width="48" height="54" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
    <ellipse cx="52" cy="146" rx="24" ry="6" fill="#94a3b8"/>
    <!-- Rising Steam -->
    <path d="M 44 140 Q 38 124 48 114" stroke="#f87171" stroke-width="2.5" fill="none" opacity="0.6"/>
    <path d="M 56 140 Q 62 124 54 114" stroke="#f87171" stroke-width="2.5" fill="none" opacity="0.6"/>

    <!-- Showcase with Beef and Herbs -->
    <rect x="86" y="148" width="88" height="50" rx="2" fill="#bae6fd" stroke="#0284c7" stroke-width="1.8" opacity="0.85"/>
    <ellipse cx="108" cy="172" rx="16" ry="8" fill="#b91c1c" stroke="#7f1d1d" stroke-width="1"/>
    <ellipse cx="146" cy="172" rx="18" ry="9" fill="#16a34a" stroke="#14532d" stroke-width="1"/>

    <!-- Bottom Counter -->
    <rect x="14" y="210" width="172" height="30" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.5"/>
    <text x="100" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#fef08a" text-anchor="middle">TÔ ĐẦY ĐỦ: 45.000Đ</text>
  </g>

  <!-- SHOP 2: TIỆM TẠP HOÁ CÔ BA (x: 200..400) -->
  <g id="shop2-2">
    <rect x="200" y="0" width="200" height="240" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5"/>

    <!-- Crisp Signboard -->
    <g filter="url(#signShadow)">
      <rect x="210" y="22" width="180" height="44" rx="4" fill="#0369a1" stroke="#075985" stroke-width="2.5"/>
      <rect x="213" y="25" width="174" height="38" rx="2" fill="#0284c7" stroke="#fde047" stroke-width="1.5"/>
      <text x="300" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">TẠP HOÁ CÔ BA</text>
      <text x="300" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" fill="#fef08a" text-anchor="middle">BIA • NƯỚC NGỌT • BÁNH KẸO • GIA DỤNG</text>
    </g>

    <!-- Blue & White Awning -->
    <g filter="url(#awningShadow)">
      <path d="M 204 72 L 396 72 L 398 102 L 202 102 Z" fill="#0284c7" stroke="#0369a1" stroke-width="1"/>
      <path d="M 224 72 L 244 72 L 246 102 L 226 102 Z" fill="#ffffff"/>
      <path d="M 264 72 L 284 72 L 286 102 L 266 102 Z" fill="#ffffff"/>
      <path d="M 304 72 L 324 72 L 326 102 L 306 102 Z" fill="#ffffff"/>
      <path d="M 344 72 L 364 72 L 366 102 L 346 102 Z" fill="#ffffff"/>
      <path d="M 384 72 L 396 72 L 398 102 L 386 102 Z" fill="#ffffff"/>
    </g>

    <!-- Grocery Storefront shelves -->
    <rect x="212" y="106" width="176" height="134" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
    <rect x="220" y="114" width="160" height="94" fill="#ffffff" stroke="#93c5fd" stroke-width="1.8"/>

    <!-- Snack packets and cans -->
    <rect x="225" y="142" width="150" height="4" fill="#0284c7"/>
    <rect x="230" y="122" width="14" height="20" fill="#ef4444" rx="2"/>
    <rect x="248" y="122" width="14" height="20" fill="#eab308" rx="2"/>
    <rect x="266" y="122" width="14" height="20" fill="#22c55e" rx="2"/>
    <rect x="284" y="122" width="14" height="20" fill="#3b82f6" rx="2"/>
    <rect x="302" y="122" width="14" height="20" fill="#ec4899" rx="2"/>
    <rect x="320" y="122" width="14" height="20" fill="#f97316" rx="2"/>

    <!-- Crates below -->
    <rect x="225" y="178" width="150" height="4" fill="#0284c7"/>
    <rect x="232" y="152" width="24" height="24" fill="#ef4444" rx="2" stroke="#991b1b" stroke-width="1"/>
    <rect x="262" y="152" width="24" height="24" fill="#22c55e" rx="2" stroke="#166534" stroke-width="1"/>
    <rect x="292" y="152" width="24" height="24" fill="#eab308" rx="2" stroke="#a16207" stroke-width="1"/>
    <rect x="322" y="152" width="24" height="24" fill="#3b82f6" rx="2" stroke="#1d4ed8" stroke-width="1"/>

    <!-- Bottom Counter -->
    <rect x="214" y="210" width="172" height="30" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
    <text x="300" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">GIÁ BÌNH DÂN • PHỤC VỤ TẬN TÂM</text>
  </g>

  <!-- SHOP 3: BÁNH TRÁNG TRỘN & ĂN VẶT (x: 400..600) -->
  <g id="shop2-3">
    <rect x="400" y="0" width="200" height="240" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>

    <!-- Crisp Signboard -->
    <g filter="url(#signShadow)">
      <rect x="410" y="22" width="180" height="44" rx="4" fill="#c2410c" stroke="#9a3412" stroke-width="2.5"/>
      <rect x="413" y="25" width="174" height="38" rx="2" fill="#ea580c" stroke="#fde047" stroke-width="1.5"/>
      <text x="500" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">BÁNH TRÁNG TRỘN</text>
      <text x="500" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle">CÁ VIÊN CHIÊN • TRÀ TẮC • KHOAI TÂY LẮC</text>
    </g>

    <!-- Orange & Gold Awning -->
    <g filter="url(#awningShadow)">
      <path d="M 404 72 L 596 72 L 598 102 L 402 102 Z" fill="#ea580c" stroke="#c2410c" stroke-width="1"/>
      <path d="M 424 72 L 444 72 L 446 102 L 426 102 Z" fill="#fef08a"/>
      <path d="M 464 72 L 484 72 L 486 102 L 466 102 Z" fill="#fef08a"/>
      <path d="M 504 72 L 524 72 L 526 102 L 506 102 Z" fill="#fef08a"/>
      <path d="M 544 72 L 564 72 L 566 102 L 546 102 Z" fill="#fef08a"/>
      <path d="M 584 72 L 596 72 L 598 102 L 586 102 Z" fill="#fef08a"/>
    </g>

    <!-- Snack Showcase Counter -->
    <rect x="412" y="106" width="176" height="134" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
    <rect x="420" y="116" width="160" height="92" fill="#ffffff" stroke="#fcd34d" stroke-width="2"/>

    <!-- Glass counter with snack ingredients -->
    <rect x="428" y="145" width="40" height="38" rx="3" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
    <ellipse cx="448" cy="164" rx="14" ry="8" fill="#84cc16"/>
    <rect x="474" y="145" width="46" height="38" rx="3" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
    <circle cx="488" cy="164" r="6" fill="#dc2626"/>
    <circle cx="505" cy="164" r="6" fill="#f59e0b"/>
    <rect x="526" y="145" width="48" height="38" rx="3" fill="#ffedd5" stroke="#ea580c" stroke-width="1.5"/>
    <line x1="535" y1="152" x2="564" y2="174" stroke="#ea580c" stroke-width="3.5"/>

    <!-- Bottom Counter -->
    <rect x="414" y="210" width="172" height="30" fill="#f59e0b" stroke="#d97706" stroke-width="1.5"/>
    <text x="500" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#78350f" text-anchor="middle">ĐỒ ĂN VẶT TUỔI HỌC TRÒ: 20K</text>
  </g>

  <!-- SHOP 4: SỬA KHOÁ - LÀM CHÌA - MAY VÁ (x: 600..800) -->
  <g id="shop2-4">
    <rect x="600" y="0" width="200" height="240" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>

    <!-- Crisp Signboard -->
    <g filter="url(#signShadow)">
      <rect x="610" y="22" width="180" height="44" rx="4" fill="#15803d" stroke="#14532d" stroke-width="2.5"/>
      <rect x="613" y="25" width="174" height="38" rx="2" fill="#16a34a" stroke="#fef08a" stroke-width="1.5"/>
      <text x="700" y="45" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">SỬA KHOÁ • MAY VÁ</text>
      <text x="700" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="800" fill="#ffffff" text-anchor="middle">LÀM CHÌA LẤY LIỀN • SỬA QUẦN ÁO</text>
    </g>

    <!-- Green & White Awning -->
    <g filter="url(#awningShadow)">
      <path d="M 604 72 L 796 72 L 798 102 L 602 102 Z" fill="#16a34a" stroke="#15803d" stroke-width="1"/>
      <path d="M 624 72 L 644 72 L 646 102 L 626 102 Z" fill="#ffffff"/>
      <path d="M 664 72 L 684 72 L 686 102 L 666 102 Z" fill="#ffffff"/>
      <path d="M 704 72 L 724 72 L 726 102 L 706 102 Z" fill="#ffffff"/>
      <path d="M 744 72 L 764 72 L 766 102 L 746 102 Z" fill="#ffffff"/>
      <path d="M 784 72 L 796 72 L 798 102 L 786 102 Z" fill="#ffffff"/>
    </g>

    <!-- Workshop Door & Bench -->
    <rect x="612" y="106" width="176" height="134" fill="#dcfce7" stroke="#15803d" stroke-width="2"/>
    <rect x="620" y="114" width="160" height="94" fill="#ffffff" stroke="#86efac" stroke-width="1.8"/>

    <!-- Key cutting machine -->
    <rect x="628" y="146" width="44" height="42" rx="2" fill="#475569" stroke="#1e293b" stroke-width="2"/>
    <circle cx="650" cy="162" r="8" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>

    <!-- Classic Sewing Machine -->
    <rect x="708" y="162" width="58" height="12" fill="#78350f" rx="1"/>
    <rect x="724" y="138" width="32" height="24" rx="3" fill="#0f172a"/>
    <circle cx="752" cy="148" r="6" fill="#f8fafc"/>
    <line x1="718" y1="138" x2="718" y2="162" stroke="#0f172a" stroke-width="3"/>

    <!-- Bottom Counter -->
    <rect x="614" y="210" width="172" height="30" fill="#15803d" stroke="#14532d" stroke-width="1.5"/>
    <text x="700" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">CẮT CHÌA 1 PHÚT • LẤY NGAY</text>
  </g>
`;

async function run() {
  const root = path.resolve('public/assets');

  // Build Screen 1 SVG
  const svgScreen1 = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${commonDefs}
    <rect width="${width}" height="${height}" fill="url(#skyGrad)"/>
    ${screen1Storefronts}
    ${sidewalkAndCurb(screen1Decorations)}
  </svg>`;

  // Build Screen 2 SVG
  const svgScreen2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${commonDefs}
    <rect width="${width}" height="${height}" fill="url(#skyGrad)"/>
    ${screen2Storefronts}
    ${sidewalkAndCurb(screen2Decorations)}
  </svg>`;

  // Render at density: 144 to generate ultra-sharp 1600x1040 HD textures!
  await sharp(Buffer.from(svgScreen1), { density: 144 }).png().toFile(path.join(root, 'background_street_1.png'));
  await sharp(Buffer.from(svgScreen1), { density: 144 }).png().toFile(path.join(root, 'background_sidewalk.png'));
  await sharp(Buffer.from(svgScreen2), { density: 144 }).png().toFile(path.join(root, 'background_street_2.png'));

  console.log('Successfully generated HD background_street_1.png and background_street_2.png (1600x1040)!');
}

run().catch(console.error);
