import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const width = 800;
const height = 520;

// Gradients and patterns
const defs = `
  <defs>
    <!-- Sky / Roof background -->
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd" />
      <stop offset="100%" stop-color="#e0f2fe" />
    </linearGradient>

    <!-- Concrete sidewalk slab gradient (matching the user's reference image) -->
    <linearGradient id="slabGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0" />
      <stop offset="25%" stop-color="#cbd5e1" />
      <stop offset="70%" stop-color="#d8e0e8" />
      <stop offset="100%" stop-color="#b8c2cc" />
    </linearGradient>

    <!-- Curb top bevel -->
    <linearGradient id="curbTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>

    <!-- Curb vertical face (matching reference image) -->
    <linearGradient id="curbFace" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="35%" stop-color="#64748b" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>

    <!-- Road asphalt (matching reference image: smooth dark grey without yellow bars) -->
    <linearGradient id="roadAsphalt" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3b3d45" />
      <stop offset="35%" stop-color="#4a4d56" />
      <stop offset="100%" stop-color="#34363d" />
    </linearGradient>

    <!-- Red fire hydrant gradient -->
    <linearGradient id="hydrantGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b91c1c" />
      <stop offset="30%" stop-color="#ef4444" />
      <stop offset="65%" stop-color="#f87171" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>

    <!-- Tree trunk gradient -->
    <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9a6538" />
      <stop offset="35%" stop-color="#c98a50" />
      <stop offset="70%" stop-color="#b5763f" />
      <stop offset="100%" stop-color="#7c451f" />
    </linearGradient>
  </defs>
`;

// ==========================================
// FULL STOREFRONTS (y: 0 to 240)
// 4 Full shops side by side:
// Shop 1: 0 - 200 (Sửa Xe Máy)
// Shop 2: 200 - 400 (Tiệm Bánh Mì)
// Shop 3: 400 - 600 (Trà Đá - Nước Mía - Cà Phê)
// Shop 4: 600 - 800 (Cắt Tóc Nam)
// ==========================================
const storefronts = `
  <!-- Upper building brick/plaster facades (y: 0 to 240) -->

  <!-- ================= SHOP 1: TIỆM SỬA XE MÁY (x: 0..200) ================= -->
  <g id="shop-sua-xe">
    <!-- Building Wall -->
    <rect x="0" y="0" width="200" height="240" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
    <!-- Upper brick texture lines -->
    <line x1="0" y1="20" x2="200" y2="20" stroke="#facc15" stroke-width="1" opacity="0.6"/>
    <line x1="0" y1="40" x2="200" y2="40" stroke="#facc15" stroke-width="1" opacity="0.6"/>
    <line x1="0" y1="60" x2="200" y2="60" stroke="#facc15" stroke-width="1" opacity="0.6"/>

    <!-- Main Signboard: SỬA XE MÁY -->
    <rect x="10" y="24" width="180" height="42" rx="4" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>
    <rect x="13" y="27" width="174" height="36" rx="2" fill="#ef4444" stroke="#facc15" stroke-width="1.5"/>
    <text x="100" y="47" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14.5" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1">SỬA XE MÁY</text>
    <text x="100" y="59" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">BƠM VÁ XE • THAY NHỚT • RỬA XE</text>

    <!-- Awnings (Mái hiên di động sọc đỏ - trắng) -->
    <path d="M 5 72 L 195 72 L 198 100 L 2 100 Z" fill="#b91c1c"/>
    <path d="M 25 72 L 45 72 L 48 100 L 28 100 Z" fill="#f8fafc"/>
    <path d="M 65 72 L 85 72 L 88 100 L 68 100 Z" fill="#f8fafc"/>
    <path d="M 105 72 L 125 72 L 128 100 L 108 100 Z" fill="#f8fafc"/>
    <path d="M 145 72 L 165 72 L 168 100 L 148 100 Z" fill="#f8fafc"/>
    <path d="M 185 72 L 195 72 L 198 100 L 188 100 Z" fill="#f8fafc"/>
    <!-- Scallop awning border -->
    <path d="M 2 100 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 16 0" fill="#b91c1c"/>

    <!-- Full Shop Front Door: Cửa cuốn sắt màu xám xanh mở 3/4 -->
    <rect x="12" y="106" width="176" height="134" fill="#334155" stroke="#1e293b" stroke-width="2"/>
    <!-- Inside workshop: Pegboard with hanging tools, spare parts -->
    <rect x="18" y="112" width="164" height="128" fill="#1e293b"/>
    <!-- Pegboard wall -->
    <rect x="25" y="116" width="95" height="55" fill="#475569" rx="2"/>
    <!-- Hanging wrenches & pliers -->
    <line x1="35" y1="122" x2="35" y2="144" stroke="#94a3b8" stroke-width="3"/>
    <circle cx="35" cy="120" r="3" fill="#cbd5e1"/>
    <line x1="48" y1="122" x2="48" y2="148" stroke="#94a3b8" stroke-width="3"/>
    <circle cx="48" cy="120" r="3" fill="#cbd5e1"/>
    <line x1="62" y1="122" x2="62" y2="140" stroke="#94a3b8" stroke-width="3"/>
    <circle cx="62" cy="120" r="3" fill="#cbd5e1"/>
    <line x1="75" y1="122" x2="75" y2="146" stroke="#94a3b8" stroke-width="3"/>
    <circle cx="75" cy="120" r="3" fill="#cbd5e1"/>
    <!-- Motor oil bottles shelf -->
    <rect x="126" y="120" width="50" height="7" fill="#64748b"/>
    <rect x="130" y="112" width="10" height="8" rx="1" fill="#ef4444"/>
    <rect x="144" y="112" width="10" height="8" rx="1" fill="#eab308"/>
    <rect x="158" y="112" width="10" height="8" rx="1" fill="#3b82f6"/>

    <!-- WORKSHOP FLOOR DETAILS (Neatly inside shop floor, y: 180..240) -->
    <!-- Red Air compressor pump in left corner inside shop -->
    <ellipse cx="44" cy="225" rx="16" ry="8" fill="#ef4444" stroke="#991b1b" stroke-width="1.8"/>
    <rect x="34" y="212" width="20" height="12" fill="#dc2626"/>
    <circle cx="44" cy="206" r="4" fill="#ffffff" stroke="#1e293b" stroke-width="1.2"/>
    <line x1="44" y1="206" x2="46" y2="204" stroke="#ef4444" stroke-width="1.2"/>
    <circle cx="34" cy="230" r="4" fill="#0f172a"/>
    <circle cx="54" cy="230" r="4" fill="#0f172a"/>

    <!-- Mechanics workbench with metal toolbox in middle inside shop -->
    <rect x="74" y="202" width="48" height="26" fill="#2563eb" rx="2" stroke="#1e3a8a" stroke-width="1.5"/>
    <rect x="72" y="198" width="52" height="6" fill="#1d4ed8" rx="1"/>
    <!-- Metal Toolbox on workbench -->
    <rect x="84" y="186" width="26" height="12" rx="2" fill="#3b82f6" stroke="#1e293b" stroke-width="1.2"/>
    <rect x="94" y="184" width="6" height="3" fill="#f8fafc"/>

    <!-- Stack of motor tires resting against right wall inside shop -->
    <ellipse cx="152" cy="210" rx="14" ry="20" fill="#334155" stroke="#0f172a" stroke-width="2.5"/>
    <ellipse cx="152" cy="210" rx="7" ry="12" fill="#1e293b"/>
    <ellipse cx="164" cy="215" rx="14" ry="20" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/>
    <ellipse cx="164" cy="215" rx="7" ry="12" fill="#334155" opacity="0.4"/>

    <!-- Rolled-up corrugated shutter (cuốn lên phía trên) -->
    <rect x="12" y="106" width="176" height="24" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
    <line x1="12" y1="112" x2="188" y2="112" stroke="#475569" stroke-width="1.5"/>
    <line x1="12" y1="118" x2="188" y2="118" stroke="#475569" stroke-width="1.5"/>
    <line x1="12" y1="124" x2="188" y2="124" stroke="#475569" stroke-width="1.5"/>
  </g>


  <!-- ================= SHOP 2: TIỆM BÁNH MÌ (x: 200..400) ================= -->
  <g id="shop-banh-mi">
    <!-- Building Wall (Warm orange cream) -->
    <rect x="200" y="0" width="200" height="240" fill="#ffedd5" stroke="#ea580c" stroke-width="1.5"/>

    <!-- Main Signboard: TIỆM BÁNH MÌ SÀI GÒN -->
    <rect x="210" y="24" width="180" height="42" rx="4" fill="#ea580c" stroke="#c2410c" stroke-width="3"/>
    <rect x="213" y="27" width="174" height="36" rx="2" fill="#f97316" stroke="#fef08a" stroke-width="1.5"/>
    <text x="300" y="47" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14.5" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1">TIỆM BÁNH MÌ</text>
    <text x="300" y="59" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">BÁNH MÌ PÂTÉ • THỊT NƯỚNG NÓNG GIÒN</text>

    <!-- Awnings (Mái hiên sọc cam - vàng) -->
    <path d="M 205 72 L 395 72 L 398 100 L 202 100 Z" fill="#ea580c"/>
    <path d="M 225 72 L 245 72 L 248 100 L 228 100 Z" fill="#fef08a"/>
    <path d="M 265 72 L 285 72 L 288 100 L 268 100 Z" fill="#fef08a"/>
    <path d="M 305 72 L 325 72 L 328 100 L 308 100 Z" fill="#fef08a"/>
    <path d="M 345 72 L 365 72 L 368 100 L 348 100 Z" fill="#fef08a"/>
    <path d="M 385 72 L 395 72 L 398 100 L 388 100 Z" fill="#fef08a"/>
    <path d="M 202 100 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 16 0" fill="#ea580c"/>

    <!-- Full Shopfront: Cửa kính lớn trưng bày bánh mì thơm lừng -->
    <rect x="212" y="106" width="176" height="134" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
    <!-- Glass Showcase Window -->
    <rect x="220" y="115" width="160" height="90" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="2" opacity="0.85"/>
    <polygon points="225,120 255,120 235,160 225,160" fill="#ffffff" opacity="0.45"/>
    <!-- Shelves of crispy golden baguettes inside -->
    <rect x="228" y="145" width="144" height="5" fill="#78350f"/>
    <!-- Bread loaves on display -->
    <ellipse cx="245" cy="138" rx="12" ry="5" fill="#eab308" stroke="#a16207" stroke-width="1.2"/>
    <ellipse cx="275" cy="138" rx="12" ry="5" fill="#f59e0b" stroke="#a16207" stroke-width="1.2"/>
    <ellipse cx="305" cy="138" rx="12" ry="5" fill="#eab308" stroke="#a16207" stroke-width="1.2"/>
    <ellipse cx="335" cy="138" rx="12" ry="5" fill="#f59e0b" stroke="#a16207" stroke-width="1.2"/>
    <ellipse cx="355" cy="138" rx="8" ry="5" fill="#eab308" stroke="#a16207" stroke-width="1.2"/>

    <rect x="228" y="175" width="144" height="5" fill="#78350f"/>
    <ellipse cx="250" cy="168" rx="13" ry="5" fill="#f59e0b" stroke="#a16207" stroke-width="1.2"/>
    <ellipse cx="280" cy="168" rx="13" ry="5" fill="#eab308" stroke="#a16207" stroke-width="1.2"/>
    <ellipse cx="310" cy="168" rx="13" ry="5" fill="#f59e0b" stroke="#a16207" stroke-width="1.2"/>
    <ellipse cx="340" cy="168" rx="13" ry="5" fill="#eab308" stroke="#a16207" stroke-width="1.2"/>

    <!-- Wooden lower paneling -->
    <rect x="215" y="210" width="170" height="30" fill="#9a3412" stroke="#7c2d12" stroke-width="1.5"/>
    <line x1="255" y1="210" x2="255" y2="240" stroke="#7c2d12" stroke-width="1.5"/>
    <line x1="300" y1="210" x2="300" y2="240" stroke="#7c2d12" stroke-width="1.5"/>
    <line x1="345" y1="210" x2="345" y2="240" stroke="#7c2d12" stroke-width="1.5"/>
  </g>


  <!-- ================= SHOP 3: TRÀ ĐÁ - NƯỚC MÍA (x: 400..600) ================= -->
  <g id="shop-tra-da">
    <!-- Building Wall (Mint blue-green) -->
    <rect x="400" y="0" width="200" height="240" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.5"/>

    <!-- Main Signboard: TRÀ ĐÁ • NƯỚC MÍA • CÀ PHÊ -->
    <rect x="410" y="24" width="180" height="42" rx="4" fill="#0284c7" stroke="#0369a1" stroke-width="3"/>
    <rect x="413" y="27" width="174" height="36" rx="2" fill="#0ea5e9" stroke="#bae6fd" stroke-width="1.5"/>
    <text x="500" y="47" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14.5" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">QUÁN TRÀ ĐÁ</text>
    <text x="500" y="59" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">NƯỚC MÍA SIÊU SẠCH • CÀ PHÊ SỮA</text>

    <!-- Awnings (Mái hiên sọc xanh lá - trắng) -->
    <path d="M 405 72 L 595 72 L 598 100 L 402 100 Z" fill="#16a34a"/>
    <path d="M 425 72 L 445 72 L 448 100 L 428 100 Z" fill="#f8fafc"/>
    <path d="M 465 72 L 485 72 L 488 100 L 468 100 Z" fill="#f8fafc"/>
    <path d="M 505 72 L 525 72 L 528 100 L 508 100 Z" fill="#f8fafc"/>
    <path d="M 545 72 L 565 72 L 568 100 L 548 100 Z" fill="#f8fafc"/>
    <path d="M 585 72 L 595 72 L 598 100 L 588 100 Z" fill="#f8fafc"/>
    <path d="M 402 100 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 16 0" fill="#16a34a"/>

    <!-- Full Shopfront: Quầy pha chế nước mía, cà phê, tủ kính trái cây -->
    <rect x="412" y="106" width="176" height="134" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
    <!-- Preparation Counter inside -->
    <rect x="420" y="130" width="160" height="85" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Shelves with beverage cups and glass jars -->
    <rect x="430" y="135" width="40" height="35" rx="2" fill="#bae6fd" stroke="#38bdf8" stroke-width="1.5"/>
    <rect x="480" y="135" width="45" height="35" rx="2" fill="#a7f3d0" stroke="#34d399" stroke-width="1.5"/>
    <rect x="535" y="135" width="38" height="35" rx="2" fill="#fef08a" stroke="#facc15" stroke-width="1.5"/>
    <!-- Sugar cane squeezer illustration on counter -->
    <rect x="435" y="180" width="32" height="35" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
    <circle cx="451" cy="192" r="8" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>
    <rect x="500" y="178" width="22" height="37" fill="#f97316" rx="3" stroke="#ea580c" stroke-width="1.5"/>
    <rect x="540" y="184" width="20" height="31" fill="#0284c7" rx="3" stroke="#0369a1" stroke-width="1.5"/>
    <!-- Clean lower wall tile -->
    <rect x="415" y="215" width="170" height="25" fill="#99f6e4" stroke="#0d9488" stroke-width="1.5"/>
  </g>


  <!-- ================= SHOP 4: CẮT TÓC NAM (x: 600..800) ================= -->
  <g id="shop-cat-toc">
    <!-- Building Wall (Clean white / soft cream) -->
    <rect x="600" y="0" width="200" height="240" fill="#f8fafc" stroke="#2563eb" stroke-width="1.5"/>

    <!-- Main Signboard: CẮT TÓC NAM BÌNH DÂN -->
    <rect x="610" y="24" width="180" height="42" rx="4" fill="#ffffff" stroke="#2563eb" stroke-width="3"/>
    <rect x="613" y="27" width="174" height="36" rx="2" fill="#f1f5f9" stroke="#dc2626" stroke-width="1.5"/>
    <text x="700" y="47" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14.5" font-weight="900" fill="#1e40af" text-anchor="middle" letter-spacing="1">CẮT TÓC NAM</text>
    <text x="700" y="59" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="8.5" font-weight="700" fill="#dc2626" text-anchor="middle" letter-spacing="0.5">HỚT TÓC • CẠO MẶT • RÁY TAI • GỘI ĐẦU</text>

    <!-- Awnings (Mái hiên sọc xanh dương - trắng) -->
    <path d="M 605 72 L 795 72 L 798 100 L 602 100 Z" fill="#2563eb"/>
    <path d="M 625 72 L 645 72 L 648 100 L 628 100 Z" fill="#f8fafc"/>
    <path d="M 665 72 L 685 72 L 688 100 L 668 100 Z" fill="#f8fafc"/>
    <path d="M 705 72 L 725 72 L 728 100 L 708 100 Z" fill="#f8fafc"/>
    <path d="M 745 72 L 765 72 L 768 100 L 748 100 Z" fill="#f8fafc"/>
    <path d="M 785 72 L 795 72 L 798 100 L 788 100 Z" fill="#f8fafc"/>
    <path d="M 602 100 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 20 0 q 10 7, 16 0" fill="#2563eb"/>

    <!-- Full Shopfront: Cửa tiệm kính, nhìn thấy gương, ghế cắt tóc và đèn Barber pole -->
    <rect x="612" y="106" width="176" height="134" fill="#f1f5f9" stroke="#1e40af" stroke-width="2"/>
    <!-- Glass window into salon -->
    <rect x="620" y="115" width="160" height="95" fill="#bae6fd" stroke="#0284c7" stroke-width="2" opacity="0.8"/>
    <!-- Mirrors and styling stations inside -->
    <rect x="630" y="122" width="45" height="55" rx="3" fill="#e0f2fe" stroke="#64748b" stroke-width="1.8"/>
    <rect x="710" y="122" width="45" height="55" rx="3" fill="#e0f2fe" stroke="#64748b" stroke-width="1.8"/>
    <!-- Barber styling shelf with blow dryer and hair tonic bottles -->
    <rect x="628" y="177" width="50" height="5" fill="#78350f"/>
    <rect x="632" y="167" width="6" height="10" fill="#38bdf8"/>
    <rect x="642" y="165" width="6" height="12" fill="#ec4899"/>
    <rect x="652" y="168" width="8" height="9" fill="#eab308"/>

    <!-- Red Vinyl Barber Chair INSIDE the salon behind glass -->
    <ellipse cx="652" cy="204" rx="14" ry="4" fill="#64748b"/>
    <line x1="652" y1="204" x2="652" y2="195" stroke="#94a3b8" stroke-width="3"/>
    <ellipse cx="652" cy="193" rx="12" ry="5" fill="#dc2626" stroke="#991b1b" stroke-width="1.2"/>
    <rect x="644" y="178" width="16" height="12" rx="2" fill="#b91c1c"/>
    <rect x="647" y="172" width="10" height="5" rx="1" fill="#991b1b"/>

    <!-- Wall Barber Pole on exterior frame -->
    <rect x="614" y="120" width="10" height="35" rx="2" fill="#ffffff" stroke="#1e293b" stroke-width="1.2"/>
    <line x1="614" y1="126" x2="624" y2="132" stroke="#dc2626" stroke-width="2.5"/>
    <line x1="614" y1="134" x2="624" y2="140" stroke="#2563eb" stroke-width="2.5"/>
    <line x1="614" y1="142" x2="624" y2="148" stroke="#dc2626" stroke-width="2.5"/>
    <!-- Lower base tile with service text -->
    <rect x="615" y="215" width="170" height="25" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5"/>
    <text x="700" y="231" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">BÌNH DÂN: 30.000Đ</text>
  </g>
`;

// ==========================================
// VỈA HÈ (SIDEWALK), BÓ VỈA (CURB) & LÒNG ĐƯỜNG (ROAD)
// Exactly matching the user's reference image:
// - Clean grey concrete pavement slabs
// - Red fire hydrant on sidewalk
// - Tree with square brown dirt planter bed
// - 2-layer beveled grey concrete curb
// - Smooth dark grey asphalt road (NO yellow bars)
// ==========================================
const sidewalkAndRoad = `
  <!-- ================= VỈA HÈ (SIDEWALK) (y: 240 to 442) ================= -->
  <!-- Sidewalk base concrete slabs -->
  <rect x="0" y="240" width="800" height="202" fill="url(#slabGrad)"/>

  <!-- Subtle slab seam lines (Matching reference image: 4 large square horizontal slab rows) -->
  <!-- Horizontal slab joints -->
  <line x1="0" y1="290" x2="800" y2="290" stroke="#94a3b8" stroke-width="1.5" opacity="0.7"/>
  <line x1="0" y1="291" x2="800" y2="291" stroke="#f8fafc" stroke-width="1" opacity="0.6"/>

  <line x1="0" y1="350" x2="800" y2="350" stroke="#94a3b8" stroke-width="1.8" opacity="0.75"/>
  <line x1="0" y1="351" x2="800" y2="351" stroke="#f8fafc" stroke-width="1" opacity="0.6"/>

  <line x1="0" y1="410" x2="800" y2="410" stroke="#94a3b8" stroke-width="1.8" opacity="0.75"/>
  <line x1="0" y1="411" x2="800" y2="411" stroke="#f8fafc" stroke-width="1" opacity="0.6"/>

  <!-- Vertical slab joint lines (Every 160px across the sidewalk) -->
  ${[0, 160, 320, 480, 640, 800].map((x) => `
    <line x1="${x}" y1="240" x2="${x}" y2="442" stroke="#94a3b8" stroke-width="1.8" opacity="0.7"/>
    <line x1="${x + 1}" y1="240" x2="${x + 1}" y2="442" stroke="#f8fafc" stroke-width="1" opacity="0.5"/>
  `).join('')}

  <!-- Subtle concrete texture/shadow marks like in reference image -->
  <path d="M 40 270 Q 90 260 140 275 Q 110 288 50 282 Z" fill="#94a3b8" opacity="0.12"/>
  <path d="M 220 320 Q 280 310 340 325 Q 300 340 230 335 Z" fill="#94a3b8" opacity="0.12"/>
  <path d="M 520 275 Q 580 265 640 280 Q 600 295 530 290 Z" fill="#94a3b8" opacity="0.12"/>
  <path d="M 680 375 Q 730 365 770 380 Q 740 395 690 390 Z" fill="#94a3b8" opacity="0.12"/>


  <!-- ================= GỐC CÂY VÀ BỒN ĐẤT HÌNH VUÔNG (From reference image) ================= -->
  <!-- Square dirt tree planter bed (near right side / Shop 3-4 boundary, x: 580) -->
  <g id="square-tree-planter">
    <!-- Concrete frame of tree bed -->
    <rect x="550" y="246" width="60" height="42" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
    <!-- Rich dark brown dirt inside -->
    <rect x="554" y="250" width="52" height="34" fill="#603813"/>
    <rect x="557" y="253" width="46" height="28" fill="#784218"/>

    <!-- Tree trunk with root flair (Matching reference image) -->
    <!-- Roots spreading into dirt -->
    <path d="M 566 280 Q 575 258 578 240 L 590 240 Q 593 258 602 280 Z" fill="url(#trunkGrad)" stroke="#451a03" stroke-width="1.8"/>
    <!-- Root details -->
    <path d="M 572 278 Q 577 265 580 250" stroke="#451a03" stroke-width="1.8" fill="none"/>
    <path d="M 596 278 Q 591 265 588 250" stroke="#451a03" stroke-width="1.8" fill="none"/>
    <!-- Tree Trunk going up -->
    <path d="M 576 240 Q 574 150 568 80 L 596 80 Q 594 150 592 240 Z" fill="url(#trunkGrad)" stroke="#451a03" stroke-width="2"/>
    <!-- Foliage / Tree branches spreading above -->
    <circle cx="582" cy="65" r="50" fill="#15803d" opacity="0.95"/>
    <circle cx="550" cy="75" r="42" fill="#16a34a" opacity="0.9"/>
    <circle cx="615" cy="70" r="42" fill="#22c55e" opacity="0.85"/>
  </g>


  <!-- ================= TRỤ CỨU HOẢ MÀU ĐỎ (From reference image) ================= -->
  <!-- Red fire hydrant (x: 185, on sidewalk near curb bevel) -->
  <g id="fire-hydrant">
    <!-- Ground shadow -->
    <ellipse cx="190" cy="432" rx="18" ry="6" fill="#475569" opacity="0.45"/>
    <!-- Hydrant base -->
    <ellipse cx="190" cy="428" rx="15" ry="5" fill="#7f1d1d"/>
    <rect x="176" y="416" width="28" height="12" rx="2" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.5"/>
    <!-- Flange ring -->
    <rect x="173" y="412" width="34" height="5" rx="1.5" fill="#991b1b" stroke="#7f1d1d" stroke-width="1"/>

    <!-- Main Hydrant Barrel -->
    <rect x="178" y="372" width="24" height="42" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.5"/>
    <!-- Vertical ribs / fluting on barrel -->
    <line x1="183" y1="373" x2="183" y2="412" stroke="#7f1d1d" stroke-width="1.8"/>
    <line x1="188" y1="373" x2="188" y2="412" stroke="#f87171" stroke-width="1.5"/>
    <line x1="193" y1="373" x2="193" y2="412" stroke="#f87171" stroke-width="1.5"/>
    <line x1="197" y1="373" x2="197" y2="412" stroke="#7f1d1d" stroke-width="1.8"/>

    <!-- Left Nozzle -->
    <path d="M 178 382 L 166 384 L 166 394 L 178 396 Z" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.2"/>
    <rect x="163" y="383" width="4" height="12" rx="1" fill="#f87171" stroke="#7f1d1d" stroke-width="1"/>
    <!-- Right Nozzle -->
    <path d="M 202 382 L 214 384 L 214 394 L 202 396 Z" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.2"/>
    <rect x="213" y="383" width="4" height="12" rx="1" fill="#f87171" stroke="#7f1d1d" stroke-width="1"/>

    <!-- Hydrant Bonnet / Dome Head -->
    <rect x="174" y="367" width="32" height="6" rx="2" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.2"/>
    <path d="M 176 367 Q 190 354 204 367 Z" fill="url(#hydrantGrad)" stroke="#7f1d1d" stroke-width="1.5"/>
    <!-- Operating pentagon nut on top -->
    <rect x="187" y="352" width="6" height="5" fill="#f87171" stroke="#7f1d1d" stroke-width="1"/>
  </g>


  <!-- ================= BÓ VỈA HÈ 2 TẦNG (CURB BEVEL) (y: 442 to 465) ================= -->
  <!-- Top curb bevel ledge (Matching reference image: light grey surface) -->
  <rect x="0" y="442" width="800" height="9" fill="url(#curbTop)" stroke="#94a3b8" stroke-width="0.8"/>
  <line x1="0" y1="442" x2="800" y2="442" stroke="#f8fafc" stroke-width="1.2"/>

  <!-- Vertical curb drop face (Matching reference image: shaded grey face) -->
  <rect x="0" y="451" width="800" height="14" fill="url(#curbFace)"/>
  <line x1="0" y1="451" x2="800" y2="451" stroke="#64748b" stroke-width="1"/>

  <!-- Vertical curb slab joint lines (Matching reference image: clean vertical block joints) -->
  ${[0, 100, 200, 300, 400, 500, 600, 700, 800].map((x) => `
    <line x1="${x}" y1="442" x2="${x}" y2="465" stroke="#334155" stroke-width="1.8"/>
    <line x1="${x + 1}" y1="442" x2="${x + 1}" y2="465" stroke="#cbd5e1" stroke-width="1" opacity="0.6"/>
  `).join('')}


  <!-- ================= LÒNG ĐƯỜNG (ROAD) (y: 465 to 520) ================= -->
  <!-- Smooth dark grey asphalt roadway (Matching reference image: clean dark asphalt, NO yellow bars) -->
  <rect x="0" y="465" width="800" height="55" fill="url(#roadAsphalt)"/>
  <!-- Subtle road water/oil sheen reflection marks as in reference image -->
  <path d="M 60 495 Q 180 488 280 498 Q 210 508 100 504 Z" fill="#525560" opacity="0.25"/>
  <path d="M 420 488 Q 540 480 660 492 Q 580 502 460 498 Z" fill="#525560" opacity="0.25"/>
`;

const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${defs}
  <!-- Sky background -->
  <rect width="${width}" height="${height}" fill="url(#skyGrad)"/>
  <!-- Full storefronts (y: 0..240) -->
  ${storefronts}
  <!-- Sidewalk, Fire Hydrant, Square Tree Planter, Curb & Road (y: 240..520) -->
  ${sidewalkAndRoad}
</svg>`;

async function run() {
  const root = path.resolve('public/assets');
  await sharp(Buffer.from(fullSvg))
    .png()
    .toFile(path.join(root, 'background_sidewalk.png'));
  console.log('Successfully generated public/assets/background_sidewalk.png with full storefronts and clean grey concrete sidewalk!');
}

run().catch((err) => {
  console.error('Error generating street background:', err);
  process.exit(1);
});
