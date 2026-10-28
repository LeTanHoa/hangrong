import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const coopmartBadgePath = path.resolve('public/assets/logos/coopmart_badge.png');
const coopmartBadgeBase64 = fs.existsSync(coopmartBadgePath)
  ? `data:image/png;base64,${fs.readFileSync(coopmartBadgePath).toString('base64')}`
  : '';

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
  <!-- Sidewalk base concrete -->
  <rect x="0" y="240" width="800" height="202" fill="url(#slabGrad)"/>

  <!-- Pavement horizon shade at building base -->
  <rect x="0" y="240" width="800" height="6" fill="#64748b" opacity="0.3"/>
  <line x1="0" y1="240" x2="800" y2="240" stroke="#475569" stroke-width="1.2"/>

  <!-- Specific sidewalk decorations -->
  ${decorations}

  <!-- Curb bevel (y: 442..465) -->
  <rect x="0" y="442" width="800" height="9" fill="url(#curbTop)" stroke="#94a3b8" stroke-width="0.8"/>
  <line x1="0" y1="442" x2="800" y2="442" stroke="#ffffff" stroke-width="1.5"/>
  <rect x="0" y="451" width="800" height="14" fill="url(#curbFace)"/>
  <line x1="0" y1="451" x2="800" y2="451" stroke="#475569" stroke-width="1"/>

  <!-- Vertical curb blocks (every 100px) -->
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

function renderStorefront({
  x,
  wallColor,
  wallStroke,
  signBg,
  signBorder,
  signTitle,
  signSubtitle,
  titleColor = '#fef08a',
  subtitleColor = '#ffffff',
  awningColor1,
  awningColor2,
  interior,
  counterColor,
  counterBorder,
  counterText,
  counterTextColor = '#ffffff',
}) {
  const awningStripes = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const sx = x + 4 + i * 24;
    const ex = Math.min(x + 196, sx + 22);
    const color = i % 2 === 0 ? awningColor1 : awningColor2;
    return `<path d="M ${sx} 72 L ${ex} 72 L ${ex + 2} 102 L ${sx + 2} 102 Z" fill="${color}"/>`;
  }).join('');

  // Auto-fit text within signboard and counter boundaries
  const cleanTitle = signTitle.replace(/&amp;/g, '&');
  const cleanSub = signSubtitle.replace(/&amp;/g, '&');
  const cleanCounter = counterText.replace(/&amp;/g, '&');

  // Title: max inner width is 160px (signboard is 180px)
  let titleFontSize = 13.0;
  if (cleanTitle.length > 25) titleFontSize = 9.2;
  else if (cleanTitle.length > 20) titleFontSize = 10.2;
  else if (cleanTitle.length > 15) titleFontSize = 11.2;
  else if (cleanTitle.length > 12) titleFontSize = 12.0;

  const titleAttr = cleanTitle.length > 14
    ? `lengthAdjust="spacingAndGlyphs" textLength="160"`
    : `letter-spacing="0.3"`;

  // Subtitle: max inner width is 164px
  let subFontSize = 8.2;
  if (cleanSub.length > 32) subFontSize = 6.8;
  else if (cleanSub.length > 24) subFontSize = 7.4;
  else if (cleanSub.length > 18) subFontSize = 7.9;

  const subAttr = cleanSub.length > 20
    ? `lengthAdjust="spacingAndGlyphs" textLength="164"`
    : '';

  // Counter text: max inner width is 154px (counter box is 172px)
  let counterFontSize = 9.2;
  if (cleanCounter.length > 28) counterFontSize = 7.8;
  else if (cleanCounter.length > 22) counterFontSize = 8.4;
  else if (cleanCounter.length > 16) counterFontSize = 8.9;

  const counterAttr = cleanCounter.length > 18
    ? `lengthAdjust="spacingAndGlyphs" textLength="154"`
    : '';

  return `
    <g id="shop_${x}">
      <!-- Facade Wall -->
      <rect x="${x}" y="0" width="200" height="240" fill="${wallColor}" stroke="${wallStroke}" stroke-width="1.5"/>
      <line x1="${x}" y1="18" x2="${x + 200}" y2="18" stroke="${wallStroke}" stroke-width="1" opacity="0.5"/>
      <line x1="${x}" y1="70" x2="${x + 200}" y2="70" stroke="${wallStroke}" stroke-width="1.2"/>

      <!-- Signboard -->
      <g filter="url(#signShadow)">
        <rect x="${x + 10}" y="22" width="180" height="44" rx="4" fill="${signBg}" stroke="${signBorder}" stroke-width="2"/>
        <text x="${x + 100}" y="44" font-family="'Segoe UI', Roboto, sans-serif" font-size="${titleFontSize}" font-weight="900" fill="${titleColor}" text-anchor="middle" ${titleAttr}>${signTitle}</text>
        <text x="${x + 100}" y="57" font-family="'Segoe UI', Roboto, sans-serif" font-size="${subFontSize}" font-weight="800" fill="${subtitleColor}" text-anchor="middle" ${subAttr}>${signSubtitle}</text>
      </g>

      <!-- Awning -->
      <g filter="url(#awningShadow)">
        <path d="M ${x + 2} 72 L ${x + 198} 72 L ${x + 200} 102 L ${x} 102 Z" fill="${awningColor1}" stroke="${wallStroke}" stroke-width="1"/>
        ${awningStripes}
      </g>

      <!-- Shop Interior / Showcase Window -->
      <rect x="${x + 12}" y="106" width="176" height="134" fill="#1e293b" stroke="#0f172a" stroke-width="1.8"/>
      ${interior}

      <!-- Bottom Counter -->
      <rect x="${x + 14}" y="210" width="172" height="30" fill="${counterColor}" stroke="${counterBorder}" stroke-width="1.5"/>
      <text x="${x + 100}" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="${counterFontSize}" font-weight="900" fill="${counterTextColor}" text-anchor="middle" ${counterAttr}>${counterText}</text>
    </g>
  `;
}

// =========================================================================
// SCREEN 1: VỈA HÈ KHỞI NGHIỆP (Bánh Mì | Sửa Xe | Trà Đá | Cắt Tóc)
// =========================================================================
const screen1 = [
  renderStorefront({
    x: 0,
    wallColor: '#fff7ed',
    wallStroke: '#ea580c',
    signBg: '#c2410c',
    signBorder: '#fdba74',
    signTitle: 'TIỆM BÁNH MÌ GIA TRUYỀN',
    signSubtitle: 'PÁTÊ NÓNG GIÒN • THỊT NƯỚNG • CHẢ LỤA',
    awningColor1: '#ea580c',
    awningColor2: '#fef08a',
    counterColor: '#c2410c',
    counterBorder: '#9a3412',
    counterText: 'BÁNH MÌ THỊT NƯỚNG GIÒN: 20K',
    interior: `
      <rect x="18" y="112" width="164" height="94" fill="#ffedd5" stroke="#ea580c" stroke-width="1.5"/>
      <rect x="26" y="140" width="46" height="36" rx="2" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
      <ellipse cx="49" cy="158" rx="16" ry="8" fill="#d97706"/>
      <rect x="80" y="140" width="46" height="36" rx="2" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
      <ellipse cx="103" cy="158" rx="16" ry="8" fill="#dc2626"/>
      <rect x="134" y="140" width="42" height="36" rx="2" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
      <ellipse cx="155" cy="158" rx="14" ry="7" fill="#16a34a"/>
    `,
  }),
  renderStorefront({
    x: 200,
    wallColor: '#fef08a',
    wallStroke: '#ca8a04',
    signBg: '#dc2626',
    signBorder: '#facc15',
    signTitle: 'SỬA XE MÁY BÁC BA',
    signSubtitle: 'BƠM VÁ XE • THAY NHỚT • RỬA XE',
    awningColor1: '#b91c1c',
    awningColor2: '#ffffff',
    counterColor: '#991b1b',
    counterBorder: '#7f1d1d',
    counterText: 'BƠM VÁ XE MÁY LẤY LIỀN • 10K',
    interior: `
      <rect x="218" y="112" width="164" height="94" fill="#334155"/>
      <rect x="225" y="116" width="95" height="40" fill="#475569" rx="2"/>
      <line x1="235" y1="120" x2="235" y2="145" stroke="#e2e8f0" stroke-width="2.5"/>
      <line x1="250" y1="120" x2="250" y2="145" stroke="#e2e8f0" stroke-width="2.5"/>
      <line x1="265" y1="120" x2="265" y2="145" stroke="#e2e8f0" stroke-width="2.5"/>
      <ellipse cx="348" cy="180" rx="14" ry="22" fill="#0f172a" stroke="#334155" stroke-width="3"/>
      <ellipse cx="362" cy="185" rx="14" ry="22" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
    `,
  }),
  renderStorefront({
    x: 400,
    wallColor: '#f0fdfa',
    wallStroke: '#0d9488',
    signBg: '#0f766e',
    signBorder: '#2dd4bf',
    signTitle: 'QUÁN NƯỚC &amp; TRÀ ĐÁ CÔ BẢY',
    signSubtitle: 'TRÀ ĐÁ • CÀ PHÊ SỮA • NƯỚC SÂM LẠNH',
    awningColor1: '#0f766e',
    awningColor2: '#ffffff',
    counterColor: '#0f766e',
    counterBorder: '#115e59',
    counterText: 'TRÀ ĐÁ 3K • CÀ PHÊ SỮA ĐÁ 15K',
    interior: `
      <rect x="418" y="112" width="164" height="94" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.5"/>
      <rect x="430" y="130" width="34" height="46" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
      <rect x="475" y="132" width="28" height="42" rx="2" fill="#fed7aa" stroke="#ea580c" stroke-width="1.5"/>
      <rect x="515" y="128" width="56" height="48" rx="2" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="543" cy="148" r="10" fill="#fef08a" stroke="#eab308" stroke-width="1"/>
    `,
  }),
  renderStorefront({
    x: 600,
    wallColor: '#eff6ff',
    wallStroke: '#2563eb',
    signBg: '#1d4ed8',
    signBorder: '#93c5fd',
    signTitle: 'CẮT TÓC NAM CHÚ TƯ',
    signSubtitle: 'HỚT TÓC • CẠO MẶT • RÁY TAI BÌNH DÂN',
    awningColor1: '#1d4ed8',
    awningColor2: '#ffffff',
    counterColor: '#1d4ed8',
    counterBorder: '#1e40af',
    counterText: 'CẮT TÓC PHONG ĐỘ • 30.000Đ',
    interior: `
      <rect x="618" y="112" width="164" height="94" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
      <rect x="635" y="118" width="55" height="60" rx="3" fill="#f8fafc" stroke="#60a5fa" stroke-width="2"/>
      <rect x="710" y="135" width="45" height="40" rx="3" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
      <line x1="732" y1="175" x2="732" y2="195" stroke="#475569" stroke-width="5"/>
    `,
  }),
].join('');

// =========================================================================
// SCREEN 2: CỔNG TRƯỜNG HỌC (Cổng Trường | Trà Sữa | Xiên Que | Nhà Sách)
// =========================================================================
const screen2 = [
  renderStorefront({
    x: 0,
    wallColor: '#fef2f2',
    wallStroke: '#b91c1c',
    signBg: '#991b1b',
    signBorder: '#f87171',
    signTitle: 'TRƯỜNG CHU VĂN AN',
    signSubtitle: 'CỔNG TRƯỜNG HỌC • KHU VỰC VĂN HÓA',
    awningColor1: '#991b1b',
    awningColor2: '#ffffff',
    counterColor: '#991b1b',
    counterBorder: '#7f1d1d',
    counterText: 'CỔNG TRƯỜNG: VUI BƯỚC ĐẾN TRƯỜNG',
    interior: `
      <rect x="18" y="112" width="164" height="94" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
      <path d="M 40 120 L 160 120 L 160 200 L 40 200 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2"/>
      <path d="M 50 130 Q 100 115 150 130 L 150 195 L 50 195 Z" fill="#f8fafc"/>
      <line x1="70" y1="130" x2="70" y2="195" stroke="#b91c1c" stroke-width="2"/>
      <line x1="100" y1="125" x2="100" y2="195" stroke="#b91c1c" stroke-width="2.5"/>
      <line x1="130" y1="130" x2="130" y2="195" stroke="#b91c1c" stroke-width="2"/>
    `,
  }),
  renderStorefront({
    x: 200,
    wallColor: '#fdf4ff',
    wallStroke: '#c026d3',
    signBg: '#a21caf',
    signBorder: '#f0abfc',
    signTitle: 'TRÀ SỮA TRÂN CHÂU BOBA',
    signSubtitle: 'TRÀ ĐÀO CAM SẢ • TRÀ TẮC KHỔNG LỒ',
    awningColor1: '#c026d3',
    awningColor2: '#fdf4ff',
    counterColor: '#a21caf',
    counterBorder: '#86198f',
    counterText: 'TRÀ SỮA ĐƯỜNG ĐEN: 22K',
    interior: `
      <rect x="218" y="112" width="164" height="94" fill="#fae8ff" stroke="#d946ef" stroke-width="1.5"/>
      <rect x="240" y="125" width="35" height="55" rx="4" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
      <circle cx="250" cy="165" r="3" fill="#451a03"/>
      <circle cx="260" cy="168" r="3" fill="#451a03"/>
      <circle cx="265" cy="160" r="3" fill="#451a03"/>
      <line x1="258" y1="115" x2="258" y2="135" stroke="#ef4444" stroke-width="3"/>
      <rect x="295" y="130" width="70" height="48" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    `,
  }),
  renderStorefront({
    x: 400,
    wallColor: '#fffbeb',
    wallStroke: '#d97706',
    signBg: '#b45309',
    signBorder: '#fde68a',
    signTitle: 'XIÊN QUE CHIÊN &amp; BÒ BÍA',
    signSubtitle: 'CÁ VIÊN • HỒ LÔ • KHOAI TÂY LẮC PHÔ MAI',
    awningColor1: '#d97706',
    awningColor2: '#fef3c7',
    counterColor: '#b45309',
    counterBorder: '#78350f',
    counterText: 'XIÊN ĐỒNG GIÁ: 5K • 10K',
    interior: `
      <rect x="418" y="112" width="164" height="94" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
      <rect x="430" y="135" width="40" height="40" rx="3" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
      <line x1="438" y1="145" x2="438" y2="170" stroke="#b91c1c" stroke-width="3"/>
      <line x1="450" y1="140" x2="450" y2="170" stroke="#f59e0b" stroke-width="3"/>
      <line x1="462" y1="145" x2="462" y2="170" stroke="#16a34a" stroke-width="3"/>
      <rect x="485" y="135" width="85" height="40" rx="2" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
    `,
  }),
  renderStorefront({
    x: 600,
    wallColor: '#f0fdf4',
    wallStroke: '#16a34a',
    signBg: '#15803d',
    signBorder: '#86efac',
    signTitle: 'NHÀ SÁCH TUỔI THƠ',
    signSubtitle: 'TRUYỆN TRANH • DỤNG CỤ HỌC TẬP • BÁO HOA',
    awningColor1: '#16a34a',
    awningColor2: '#ffffff',
    counterColor: '#15803d',
    counterBorder: '#14532d',
    counterText: 'TRUYỆN TRANH &amp; BÚT MÀU MỚI VỀ',
    interior: `
      <rect x="618" y="112" width="164" height="94" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
      <rect x="630" y="122" width="140" height="6" fill="#166534"/>
      <rect x="635" y="130" width="18" height="28" fill="#3b82f6" rx="1"/>
      <rect x="657" y="130" width="18" height="28" fill="#ef4444" rx="1"/>
      <rect x="679" y="130" width="18" height="28" fill="#eab308" rx="1"/>
      <rect x="701" y="130" width="18" height="28" fill="#ec4899" rx="1"/>
      <rect x="723" y="130" width="18" height="28" fill="#10b981" rx="1"/>
    `,
  }),
].join('');

// =========================================================================
// SCREEN 3: CHỢ TRUYỀN THỐNG (Cổng Chợ | Rau Củ Quả | Giò Chả | Gia Vị)
// =========================================================================
const screen3 = [
  renderStorefront({
    x: 0,
    wallColor: '#fff1f2',
    wallStroke: '#e11d48',
    signBg: '#be123c',
    signBorder: '#fecdd3',
    signTitle: 'CHỢ TRUYỀN THỐNG ĐẦU MỐI',
    signSubtitle: 'GIAO THƯƠNG SẦM UẤT • BÁCH HÓA NÔNG SẢN',
    awningColor1: '#be123c',
    awningColor2: '#fecdd3',
    counterColor: '#be123c',
    counterBorder: '#9f1239',
    counterText: 'CỔNG CHỢ MỞ CỬA: 04:00 - 20:00',
    interior: `
      <rect x="18" y="112" width="164" height="94" fill="#ffe4e6" stroke="#f43f5e" stroke-width="1.5"/>
      <path d="M 30 140 Q 100 110 170 140 L 160 200 L 40 200 Z" fill="#9f1239" stroke="#881337" stroke-width="2"/>
      <rect x="70" y="150" width="60" height="45" rx="3" fill="#f8fafc"/>
      <text x="100" y="175" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#be123c" text-anchor="middle">CHỢ TÂM</text>
    `,
  }),
  renderStorefront({
    x: 200,
    wallColor: '#f0fdf4',
    wallStroke: '#15803d',
    signBg: '#166534',
    signBorder: '#bbf7d0',
    signTitle: 'SẠP RAU CỦ ĐÀ LẠT',
    signSubtitle: 'XÀ LÁCH • CÀ CHUA • DƯA LEO SẠCH GIAO TRONG NGÀY',
    awningColor1: '#16a34a',
    awningColor2: '#fef08a',
    counterColor: '#166534',
    counterBorder: '#14532d',
    counterText: 'RAU CỦ TƯƠI SẠCH GIÁ SỈ MỖI NGÀY',
    interior: `
      <rect x="218" y="112" width="164" height="94" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <rect x="230" y="130" width="40" height="30" rx="3" fill="#ef4444"/>
      <circle cx="240" cy="142" r="5" fill="#b91c1c"/>
      <circle cx="255" cy="142" r="5" fill="#b91c1c"/>
      <rect x="280" y="130" width="40" height="30" rx="3" fill="#22c55e"/>
      <rect x="330" y="130" width="40" height="30" rx="3" fill="#f97316"/>
    `,
  }),
  renderStorefront({
    x: 400,
    wallColor: '#fef2f2',
    wallStroke: '#dc2626',
    signBg: '#b91c1c',
    signBorder: '#fca5a5',
    signTitle: 'GIÒ CHẢ &amp; THỊT NGUỘI',
    signSubtitle: 'CHẢ LỤA • CHẢ QUẾ • GIÒ THỦ TRUYỀN THỐNG',
    awningColor1: '#b91c1c',
    awningColor2: '#ffffff',
    counterColor: '#b91c1c',
    counterBorder: '#7f1d1d',
    counterText: 'CHẢ LỤA THƠM NGON ĐẶC BIỆT',
    interior: `
      <rect x="418" y="112" width="164" height="94" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
      <rect x="430" y="130" width="22" height="45" rx="10" fill="#15803d" stroke="#166534" stroke-width="2"/>
      <rect x="460" y="130" width="22" height="45" rx="10" fill="#ca8a04" stroke="#a16207" stroke-width="2"/>
      <rect x="490" y="130" width="22" height="45" rx="10" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      <rect x="525" y="135" width="45" height="40" rx="2" fill="#cbd5e1"/>
    `,
  }),
  renderStorefront({
    x: 600,
    wallColor: '#fffbeb',
    wallStroke: '#d97706',
    signBg: '#92400e',
    signBorder: '#fde68a',
    signTitle: 'TIỆM GIA VỊ &amp; ĐỒ KHÔ',
    signSubtitle: 'NƯỚC MẮM NHĨ • HẠT TIÊU • NẤM HƯƠNG • MỘC NHĨ',
    awningColor1: '#d97706',
    awningColor2: '#ffffff',
    counterColor: '#92400e',
    counterBorder: '#78350f',
    counterText: 'GIA VỊ NẤU ĂN ĐẦY ĐỦ GIÁ GỐC',
    interior: `
      <rect x="618" y="112" width="164" height="94" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
      <rect x="630" y="125" width="30" height="35" rx="3" fill="#f59e0b"/>
      <rect x="670" y="125" width="30" height="35" rx="3" fill="#dc2626"/>
      <rect x="710" y="125" width="30" height="35" rx="3" fill="#475569"/>
      <rect x="745" y="125" width="25" height="35" rx="3" fill="#15803d"/>
    `,
  }),
].join('');

// =========================================================================
// SCREEN 4: KHU VĂN PHÒNG (Office Tower | Highland Coffee | Bento | Bakery)
// =========================================================================
const screen4 = [
  renderStorefront({
    x: 0,
    wallColor: '#f8fafc',
    wallStroke: '#0284c7',
    signBg: '#0369a1',
    signBorder: '#38bdf8',
    signTitle: 'LANDMARK TOWER OFFICE',
    signSubtitle: 'CAO ỐC VĂN PHÒNG HIỆN ĐẠI • DÂN IT &amp; CÔNG SỞ',
    awningColor1: '#0284c7',
    awningColor2: '#f0f9ff',
    counterColor: '#0369a1',
    counterBorder: '#075985',
    counterText: 'SẢNH CHÍNH TÒA NHÀ • LỄ TÂN 24/7',
    interior: `
      <rect x="18" y="112" width="164" height="94" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
      <rect x="35" y="120" width="130" height="60" fill="#38bdf8" opacity="0.3"/>
      <line x1="75" y1="120" x2="75" y2="180" stroke="#0284c7" stroke-width="2"/>
      <line x1="125" y1="120" x2="125" y2="180" stroke="#0284c7" stroke-width="2"/>
      <circle cx="100" cy="150" r="14" fill="#ffffff" stroke="#0369a1" stroke-width="2"/>
    `,
  }),
  renderStorefront({
    x: 200,
    wallColor: '#fff7ed',
    wallStroke: '#c2410c',
    signBg: '#7c2d12',
    signBorder: '#fdba74',
    signTitle: 'HIGHLAND COFFEE &amp; ESPRESSO',
    signSubtitle: 'CÀ PHÊ PHA MÁY • TRÀ SEN VÀNG • FREEZE MATCHA',
    awningColor1: '#7c2d12',
    awningColor2: '#fff7ed',
    counterColor: '#7c2d12',
    counterBorder: '#431407',
    counterText: 'CÀ PHÊ SÁNG CÔNG SỞ: 25K - 35K',
    interior: `
      <rect x="218" y="112" width="164" height="94" fill="#ffedd5" stroke="#ea580c" stroke-width="1.5"/>
      <rect x="235" y="130" width="50" height="42" rx="3" fill="#475569" stroke="#1e293b" stroke-width="2"/>
      <rect x="245" y="122" width="30" height="10" fill="#334155"/>
      <rect x="305" y="125" width="60" height="50" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <ellipse cx="335" cy="150" rx="14" ry="7" fill="#78350f"/>
    `,
  }),
  renderStorefront({
    x: 400,
    wallColor: '#f0fdf4',
    wallStroke: '#16a34a',
    signBg: '#15803d',
    signBorder: '#86efac',
    signTitle: 'CƠM TRƯA BENTO &amp; SALAD',
    signSubtitle: 'CƠM VĂN PHÒNG NÓNG HỔI • EAT CLEAN • SALAD BAR',
    awningColor1: '#16a34a',
    awningColor2: '#f0fdf4',
    counterColor: '#15803d',
    counterBorder: '#14532d',
    counterText: 'BENTO ĐỦ CHẤT • ĐẶT TRƯỚC GIAO TẬN BÀN',
    interior: `
      <rect x="418" y="112" width="164" height="94" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
      <rect x="430" y="132" width="40" height="38" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="445" cy="145" r="5" fill="#ef4444"/>
      <circle cx="455" cy="155" r="6" fill="#22c55e"/>
      <rect x="480" y="132" width="40" height="38" rx="3" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
      <rect x="530" y="132" width="40" height="38" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>
    `,
  }),
  renderStorefront({
    x: 600,
    wallColor: '#fefce8',
    wallStroke: '#ca8a04',
    signBg: '#a16207',
    signBorder: '#fef08a',
    signTitle: 'PARIS BAGUETTE &amp; BAKERY',
    signSubtitle: 'BÁNH CROISSANT • BÁNH MÌ KẸP • BÁNH NGỌT CHÂU ÂU',
    awningColor1: '#ca8a04',
    awningColor2: '#fefce8',
    counterColor: '#a16207',
    counterBorder: '#713f12',
    counterText: 'BÁNH NƯỚNG MỚI MỖI 30 PHÚT',
    interior: `
      <rect x="618" y="112" width="164" height="94" fill="#fef9c3" stroke="#eab308" stroke-width="1.5"/>
      <ellipse cx="650" cy="150" rx="16" ry="10" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      <ellipse cx="690" cy="150" rx="18" ry="12" fill="#d97706" stroke="#92400e" stroke-width="1.5"/>
      <ellipse cx="735" cy="150" rx="14" ry="14" fill="#ea580c" stroke="#9a3412" stroke-width="1.5"/>
    `,
  }),
].join('');

// =========================================================================
// SCREEN 5: CÔNG VIÊN (Cổng Công Viên | Quầy Kem | Nước Mía | Thuê Xe Đạp)
// =========================================================================
const screen5 = [
  renderStorefront({
    x: 0,
    wallColor: '#f0fdf4',
    wallStroke: '#15803d',
    signBg: '#14532d',
    signBorder: '#86efac',
    signTitle: 'CÔNG VIÊN CÂY XANH TRUNG TÂM',
    signSubtitle: 'LÁ PHỔI XANH ĐÔ THỊ • KHÔNG GIAN DƯỠNG SINH',
    awningColor1: '#15803d',
    awningColor2: '#ffffff',
    counterColor: '#14532d',
    counterBorder: '#052e16',
    counterText: 'CÔNG VIÊN MỞ CỬA MIỄN PHÍ',
    interior: `
      <rect x="18" y="112" width="164" height="94" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5"/>
      <path d="M 30 150 Q 100 100 170 150" stroke="#166534" stroke-width="4" fill="none"/>
      <circle cx="100" cy="140" r="16" fill="#facc15" opacity="0.8"/>
      <path d="M 60 175 L 75 145 L 90 175 Z" fill="#15803d"/>
      <path d="M 110 175 L 125 145 L 140 175 Z" fill="#15803d"/>
    `,
  }),
  renderStorefront({
    x: 200,
    wallColor: '#fff1f2',
    wallStroke: '#e11d48',
    signBg: '#be123c',
    signBorder: '#fecdd3',
    signTitle: 'KEM TƯƠI Ý &amp; WAFFLE GIÒN',
    signSubtitle: 'KEM DÂU TÂY • MATCHA • SOCOLA BỈ • ỐC QUẾ GIÒN RỤM',
    awningColor1: '#e11d48',
    awningColor2: '#fff1f2',
    counterColor: '#be123c',
    counterBorder: '#9f1239',
    counterText: 'KEM TƯƠI 3 MÀU: 15.000Đ',
    interior: `
      <rect x="218" y="112" width="164" height="94" fill="#ffe4e6" stroke="#f43f5e" stroke-width="1.5"/>
      <rect x="245" y="125" width="45" height="50" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
      <circle cx="258" cy="142" r="5" fill="#f43f5e"/>
      <circle cx="272" cy="142" r="5" fill="#fbbf24"/>
      <path d="M 320 135 L 340 135 L 330 165 Z" fill="#d97706" stroke="#b45309" stroke-width="1.5"/>
      <circle cx="330" cy="130" r="10" fill="#ec4899"/>
    `,
  }),
  renderStorefront({
    x: 400,
    wallColor: '#f7fee7',
    wallStroke: '#65a30d',
    signBg: '#4d7c0f',
    signBorder: '#bef264',
    signTitle: 'NƯỚC MÍA SIÊU SẠCH &amp; DỪA XIÊM',
    signSubtitle: 'NƯỚC MÍA SẦU RIÊNG • DỪA TẮC • SINH TỐ BƠ SÁP',
    awningColor1: '#65a30d',
    awningColor2: '#fef08a',
    counterColor: '#4d7c0f',
    counterBorder: '#365314',
    counterText: 'NƯỚC MÍA LY LỚN: 10.000Đ',
    interior: `
      <rect x="418" y="112" width="164" height="94" fill="#ecfccb" stroke="#84cc16" stroke-width="1.5"/>
      <rect x="435" y="130" width="55" height="42" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
      <line x1="450" y1="135" x2="450" y2="165" stroke="#16a34a" stroke-width="3"/>
      <line x1="465" y1="135" x2="465" y2="165" stroke="#84cc16" stroke-width="3"/>
      <circle cx="530" cy="150" r="14" fill="#a3e635" stroke="#4d7c0f" stroke-width="2"/>
    `,
  }),
  renderStorefront({
    x: 600,
    wallColor: '#fffbeb',
    wallStroke: '#d97706',
    signBg: '#b45309',
    signBorder: '#fde68a',
    signTitle: 'THUÊ XE ĐẠP &amp; THUYỀN VỊT',
    signSubtitle: 'XE ĐẠP ĐÔI HÓNG GIÓ • THUYỀN ĐẠP NƯỚC HỒ CÔNG VIÊN',
    awningColor1: '#d97706',
    awningColor2: '#ffffff',
    counterColor: '#b45309',
    counterBorder: '#78350f',
    counterText: 'THUÊ XE ĐẠP: 30K / GIỜ',
    interior: `
      <rect x="618" y="112" width="164" height="94" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
      <circle cx="645" cy="155" r="15" fill="none" stroke="#0284c7" stroke-width="3"/>
      <circle cx="685" cy="155" r="15" fill="none" stroke="#0284c7" stroke-width="3"/>
      <line x1="645" y1="155" x2="665" y2="140" stroke="#0284c7" stroke-width="3"/>
      <line x1="685" y1="155" x2="665" y2="140" stroke="#0284c7" stroke-width="3"/>
      <rect x="720" y="130" width="45" height="45" rx="3" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
    `,
  }),
].join('');

// =========================================================================
// SCREEN 6: BẾN XE (Nhà Chờ | Cơm Tấm | Bánh Bao | Kiosk Nước)
// =========================================================================
const screen6 = [
  renderStorefront({
    x: 0,
    wallColor: '#f1f5f9',
    wallStroke: '#334155',
    signBg: '#1e293b',
    signBorder: '#94a3b8',
    signTitle: 'BẾN XE LIÊN TỈNH MIỀN TÂY',
    signSubtitle: 'CỬA NGÕ GIAO THÔNG 24/7 • ĐI CÁC TỈNH ĐỒNG BẰNG',
    awningColor1: '#334155',
    awningColor2: '#f1f5f9',
    counterColor: '#1e293b',
    counterBorder: '#0f172a',
    counterText: 'XE XUẤT BẾN LIÊN TỤC MỖI 15 PHÚT',
    interior: `
      <rect x="18" y="112" width="164" height="94" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
      <rect x="35" y="125" width="130" height="30" fill="#0f172a" rx="2"/>
      <text x="100" y="145" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#22c55e" text-anchor="middle">CHUYẾN KẾ: 10:15 - CẦN THƠ</text>
      <rect x="40" y="170" width="120" height="15" fill="#334155" rx="2"/>
    `,
  }),
  renderStorefront({
    x: 200,
    wallColor: '#fff7ed',
    wallStroke: '#ea580c',
    signBg: '#c2410c',
    signBorder: '#fed7aa',
    signTitle: 'CƠM TẤM SƯỜN BÌ CHẢ ĐÊM',
    signSubtitle: 'SƯỜN NƯỚNG THAN HỒNG • MỠ HÀNH • TRỨNG ỐP LA',
    awningColor1: '#ea580c',
    awningColor2: '#fff7ed',
    counterColor: '#c2410c',
    counterBorder: '#9a3412',
    counterText: 'CƠM SƯỜN NƯỚNG ĐẶC BIỆT: 35K',
    interior: `
      <rect x="218" y="112" width="164" height="94" fill="#ffedd5" stroke="#f97316" stroke-width="1.5"/>
      <rect x="235" y="132" width="55" height="42" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
      <path d="M 245 130 Q 250 115 255 130" stroke="#f97316" stroke-width="2" fill="none"/>
      <path d="M 265 130 Q 270 115 275 130" stroke="#f97316" stroke-width="2" fill="none"/>
      <circle cx="335" cy="150" r="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="335" cy="150" r="12" fill="#d97706"/>
    `,
  }),
  renderStorefront({
    x: 400,
    wallColor: '#fef2f2',
    wallStroke: '#dc2626',
    signBg: '#b91c1c',
    signBorder: '#fca5a5',
    signTitle: 'BÁNH BAO NÓNG &amp; XÔI KHÚC',
    signSubtitle: 'BÁNH BAO XÁ XÍU TRỨNG CÚT • XÔI XÉO BẮC BỘ',
    awningColor1: '#dc2626',
    awningColor2: '#ffffff',
    counterColor: '#b91c1c',
    counterBorder: '#7f1d1d',
    counterText: 'BÁNH BAO NÓNG HỔI: 15K / CÁI',
    interior: `
      <rect x="418" y="112" width="164" height="94" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
      <rect x="440" y="130" width="50" height="45" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
      <ellipse cx="465" cy="130" rx="25" ry="6" fill="#94a3b8"/>
      <path d="M 455 125 Q 450 110 458 100" stroke="#e2e8f0" stroke-width="2.5" fill="none"/>
      <path d="M 475 125 Q 480 110 472 100" stroke="#e2e8f0" stroke-width="2.5" fill="none"/>
      <circle cx="535" cy="150" r="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    `,
  }),
  renderStorefront({
    x: 600,
    wallColor: '#f0f9ff',
    wallStroke: '#0284c7',
    signBg: '#0369a1',
    signBorder: '#bae6fd',
    signTitle: 'KIOSK NƯỚC &amp; SIM THẺ XE ĐÒ',
    signSubtitle: 'NƯỚC NGỌT ƯỚP LẠNH • BÁNH NGỌT • BÁO CHÍ ĐI ĐƯỜNG',
    awningColor1: '#0284c7',
    awningColor2: '#ffffff',
    counterColor: '#0369a1',
    counterBorder: '#075985',
    counterText: 'BÁN MANG ĐI NHANH GỌN KỊP XE',
    interior: `
      <rect x="618" y="112" width="164" height="94" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
      <rect x="630" y="125" width="22" height="32" rx="2" fill="#ef4444"/>
      <rect x="660" y="125" width="22" height="32" rx="2" fill="#3b82f6"/>
      <rect x="690" y="125" width="22" height="32" rx="2" fill="#22c55e"/>
      <rect x="720" y="125" width="40" height="35" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    `,
  }),
].join('');

// =========================================================================
// SCREEN 7: PHỐ ẨM THỰC ĐÊM (Phở Bò | Tạp Hoá Cô Ba | Bánh Tráng | Sửa Khoá)
// =========================================================================
const screen7 = [
  renderStorefront({
    x: 0,
    wallColor: '#fef2f2',
    wallStroke: '#dc2626',
    signBg: '#991b1b',
    signBorder: '#facc15',
    signTitle: 'PHỞ BÒ • BÚN BÒ HUẾ',
    signSubtitle: 'GIA TRUYỀN 30 NĂM • NÓNG HỔI ĐẶC BIỆT',
    awningColor1: '#dc2626',
    awningColor2: '#fef08a',
    counterColor: '#991b1b',
    counterBorder: '#7f1d1d',
    counterText: 'TÔ ĐẦY ĐỦ: 45.000Đ',
    interior: `
      <rect x="18" y="112" width="164" height="94" fill="#fee2e2" stroke="#fca5a5" stroke-width="1.5"/>
      <rect x="28" y="146" width="48" height="54" rx="3" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
      <ellipse cx="52" cy="146" rx="24" ry="6" fill="#94a3b8"/>
      <path d="M 44 140 Q 38 124 48 114" stroke="#f87171" stroke-width="2.5" fill="none" opacity="0.6"/>
      <rect x="86" y="148" width="88" height="50" rx="2" fill="#bae6fd" stroke="#0284c7" stroke-width="1.8" opacity="0.85"/>
      <ellipse cx="108" cy="172" rx="16" ry="8" fill="#b91c1c"/>
      <ellipse cx="146" cy="172" rx="18" ry="9" fill="#16a34a"/>
    `,
  }),
  renderStorefront({
    x: 200,
    wallColor: '#f0f9ff',
    wallStroke: '#0284c7',
    signBg: '#0369a1',
    signBorder: '#93c5fd',
    signTitle: 'TIỆM TẠP HOÁ CÔ BA',
    signSubtitle: 'BIA NƯỚC NGỌT • BÁNH KẸO • ĐỒ HỘP GIA DỤNG',
    awningColor1: '#0284c7',
    awningColor2: '#f0f9ff',
    counterColor: '#0284c7',
    counterBorder: '#0369a1',
    counterText: 'GIÁ BÌNH DÂN • PHỤC VỤ TẬN TÂM',
    interior: `
      <rect x="218" y="112" width="164" height="94" fill="#e0f2fe" stroke="#93c5fd" stroke-width="1.5"/>
      <rect x="230" y="122" width="14" height="20" fill="#ef4444" rx="2"/>
      <rect x="250" y="122" width="14" height="20" fill="#eab308" rx="2"/>
      <rect x="270" y="122" width="14" height="20" fill="#22c55e" rx="2"/>
      <rect x="290" y="122" width="14" height="20" fill="#3b82f6" rx="2"/>
      <rect x="235" y="152" width="30" height="24" fill="#ef4444" rx="2"/>
      <rect x="275" y="152" width="30" height="24" fill="#22c55e" rx="2"/>
    `,
  }),
  renderStorefront({
    x: 400,
    wallColor: '#fffbeb',
    wallStroke: '#f59e0b',
    signBg: '#c2410c',
    signBorder: '#fde047',
    signTitle: 'BÁNH TRÁNG TRỘN BÉ ÚT',
    signSubtitle: 'CÁ VIÊN CHIÊN • TRÀ TẮC • KHOAI TÂY LẮC',
    awningColor1: '#ea580c',
    awningColor2: '#fef08a',
    counterColor: '#f59e0b',
    counterBorder: '#d97706',
    counterText: 'ĂN VẶT TUỔI HỌC TRÒ: 20K',
    interior: `
      <rect x="418" y="112" width="164" height="94" fill="#fef3c7" stroke="#fcd34d" stroke-width="1.5"/>
      <rect x="428" y="145" width="40" height="38" rx="3" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
      <rect x="474" y="145" width="46" height="38" rx="3" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
      <circle cx="488" cy="164" r="6" fill="#dc2626"/>
      <circle cx="505" cy="164" r="6" fill="#f59e0b"/>
      <rect x="526" y="145" width="48" height="38" rx="3" fill="#ffedd5" stroke="#ea580c" stroke-width="1.5"/>
    `,
  }),
  renderStorefront({
    x: 600,
    wallColor: '#f0fdf4',
    wallStroke: '#16a34a',
    signBg: '#15803d',
    signBorder: '#fef08a',
    signTitle: 'SỬA KHOÁ • MAY VÁ CHÚ SÁU',
    signSubtitle: 'LÀM CHÌA LẤY LIỀN • SỬA QUẦN ÁO TẬN TÂM',
    awningColor1: '#16a34a',
    awningColor2: '#ffffff',
    counterColor: '#15803d',
    counterBorder: '#14532d',
    counterText: 'CẮT CHÌA 1 PHÚT • LẤY NGAY',
    interior: `
      <rect x="618" y="112" width="164" height="94" fill="#dcfce7" stroke="#86efac" stroke-width="1.5"/>
      <rect x="628" y="146" width="44" height="42" rx="2" fill="#475569" stroke="#1e293b" stroke-width="2"/>
      <circle cx="650" cy="162" r="8" fill="#facc15"/>
      <rect x="708" y="162" width="58" height="12" fill="#78350f" rx="1"/>
      <rect x="724" y="138" width="32" height="24" rx="3" fill="#0f172a"/>
    `,
  }),
].join('');

// =========================================================================
// SCREEN 8: TRUNG TÂM THÀNH PHỐ (Mall Grand Hall | Kiosk 5 Sao | Bingsu | Pastry)
// =========================================================================
const screen8 = [
  renderStorefront({
    x: 0,
    wallColor: '#fafafa',
    wallStroke: '#d4af37',
    signBg: '#18181b',
    signBorder: '#eab308',
    signTitle: 'LANDMARK LUXURY MALL',
    signSubtitle: 'ĐẠI SẢNH TRUNG TÂM THƯƠNG MẠI HOÀNG GIA',
    awningColor1: '#18181b',
    awningColor2: '#eab308',
    counterColor: '#18181b',
    counterBorder: '#713f12',
    counterText: 'CHECK-IN TRUNG TÂM THÀNH PHỐ ĐẲNG CẤP',
    interior: `
      <rect x="18" y="112" width="164" height="94" fill="#f4f4f5" stroke="#eab308" stroke-width="1.5"/>
      <path d="M 40 120 L 160 120 L 140 190 L 60 190 Z" fill="#e4e4e7" stroke="#d4af37" stroke-width="1.5"/>
      <polygon points="100,125 110,140 130,140 115,150 120,165 100,155 80,165 85,150 70,140 90,140" fill="#facc15"/>
    `,
  }),
  renderStorefront({
    x: 200,
    wallColor: '#18181b',
    wallStroke: '#eab308',
    signBg: '#09090b',
    signBorder: '#facc15',
    signTitle: 'KIOSK ẨM THỰC 5 SAO',
    signSubtitle: 'FUSION CUISINE • BÁNH MÌ GOURMET BÒ WAGYU',
    awningColor1: '#09090b',
    awningColor2: '#d4af37',
    counterColor: '#09090b',
    counterBorder: '#a16207',
    counterText: 'BÁNH MÌ GOURMET THƯỢNG HẠNG: 65K',
    interior: `
      <rect x="218" y="112" width="164" height="94" fill="#27272a" stroke="#ca8a04" stroke-width="1.5"/>
      <rect x="235" y="130" width="60" height="45" rx="3" fill="#3f3f46" stroke="#71717a" stroke-width="1.5"/>
      <circle cx="265" cy="152" r="10" fill="#eab308"/>
      <rect x="310" y="130" width="60" height="45" rx="3" fill="#ffffff" stroke="#eab308" stroke-width="1.5"/>
    `,
  }),
  renderStorefront({
    x: 400,
    wallColor: '#fff7ed',
    wallStroke: '#f97316',
    signBg: '#ea580c',
    signBorder: '#fde047',
    signTitle: 'BINGSU HOÀNG GIA &amp; TRÀ ĐÀO',
    signSubtitle: 'BINGSU XOÀI TUYẾT • TRÀ HOA QUẢ HẢI ĐẢO',
    awningColor1: '#ea580c',
    awningColor2: '#fff7ed',
    counterColor: '#ea580c',
    counterBorder: '#c2410c',
    counterText: 'BINGSU TUYẾT XOÀI: 45.000Đ',
    interior: `
      <rect x="418" y="112" width="164" height="94" fill="#ffedd5" stroke="#f97316" stroke-width="1.5"/>
      <ellipse cx="465" cy="165" rx="20" ry="10" fill="#fdba74"/>
      <path d="M 445 165 Q 465 120 485 165 Z" fill="#ffffff" stroke="#fde047" stroke-width="1.5"/>
      <circle cx="465" cy="122" r="6" fill="#ef4444"/>
      <rect x="510" y="135" width="45" height="45" rx="2" fill="#bae6fd"/>
    `,
  }),
  renderStorefront({
    x: 600,
    wallColor: '#fdf2f8',
    wallStroke: '#ec4899',
    signBg: '#be185d',
    signBorder: '#fbcfe8',
    signTitle: 'TIỆM BÁNH ÂU FRENCH PASTRY',
    signSubtitle: 'MACARON PARIS • BÁNH MOUSSE PHÚC BỒN TỬ',
    awningColor1: '#be185d',
    awningColor2: '#fdf2f8',
    counterColor: '#be185d',
    counterBorder: '#9d174d',
    counterText: 'BÁNH ÂU PHÁP NỔI TIẾNG',
    interior: `
      <rect x="618" y="112" width="164" height="94" fill="#fce7f3" stroke="#f472b6" stroke-width="1.5"/>
      <circle cx="645" cy="140" r="8" fill="#f43f5e"/>
      <circle cx="665" cy="140" r="8" fill="#38bdf8"/>
      <circle cx="685" cy="140" r="8" fill="#a855f7"/>
      <circle cx="705" cy="140" r="8" fill="#facc15"/>
      <rect x="725" y="130" width="45" height="45" rx="2" fill="#ffffff" stroke="#ec4899" stroke-width="1.5"/>
    `,
  }),
].join('');

// =========================================================================
// SCREEN 9: TRUNG TÂM THƯƠNG MẠI - SIÊU THỊ CO.OPMART ĐÀ NẴNG (FULL SCREEN)
// =========================================================================
const screen9 = `
  <!-- Grand Supermarket Complex Facade (x: 0..800, y: 0..240) -->
  <g id="coopmart_danang_facade">
    <!-- Main Modern Building Wall -->
    <rect x="0" y="0" width="800" height="240" fill="#f8fafc" stroke="#0284c7" stroke-width="2"/>
    
    <!-- Top Architectural Blue &amp; Red Crown Header -->
    <rect x="0" y="0" width="800" height="18" fill="#0284c7"/>
    <rect x="0" y="18" width="800" height="4" fill="#e11d48"/>
    
    <!-- Upper Building Windows &amp; Modern Mall Glass Panel Matrix -->
    <rect x="20" y="24" width="760" height="60" fill="#e0f2fe" rx="3" stroke="#bae6fd" stroke-width="1.5"/>
    ${[40, 100, 160, 220, 280, 340, 400, 460, 520, 580, 640, 700].map(gx => `
      <line x1="${gx}" y1="24" x2="${gx}" y2="84" stroke="#7dd3fc" stroke-width="1.2" opacity="0.6"/>
    `).join('')}

    <!-- Giant Iconic CO.OPMART ĐÀ NẴNG Main Signboard with Official Brand Logo -->
    <g filter="url(#signShadow)">
      <!-- Sign Board Outer Frame -->
      <rect x="80" y="20" width="640" height="54" rx="8" fill="#0369a1" stroke="#e11d48" stroke-width="3"/>
      <rect x="85" y="24" width="630" height="46" rx="6" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>

      <!-- Official Co.opmart Logo Badge (Left) -->
      <rect x="94" y="26" width="58" height="42" rx="6" fill="#ffffff" stroke="#bae6fd" stroke-width="1.5"/>
      <image href="${coopmartBadgeBase64}" x="96" y="27" width="54" height="40" preserveAspectRatio="xMidYMid meet"/>

      <!-- Official Co.opmart Logo Badge (Right) -->
      <rect x="648" y="26" width="58" height="42" rx="6" fill="#ffffff" stroke="#bae6fd" stroke-width="1.5"/>
      <image href="${coopmartBadgeBase64}" x="650" y="27" width="54" height="40" preserveAspectRatio="xMidYMid meet"/>
      
      <!-- Typography -->
      <text x="400" y="44" font-family="'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.2">SIÊU THỊ CO.OPMART ĐÀ NẴNG</text>
      <text x="400" y="60" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="1">TRUNG TÂM THƯƠNG MẠI • BẠN CỦA MỌI NHÀ • PHỤC VỤ TẬN TÂM</text>
    </g>

    <!-- Grand Awning &amp; Canopy with Steel Truss (y: 76..106) -->
    <g filter="url(#awningShadow)">
      <rect x="10" y="76" width="780" height="30" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
      <rect x="10" y="102" width="780" height="4" fill="#e11d48"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => `
        <line x1="${20 + i * 50}" y1="76" x2="${40 + i * 50}" y2="102" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
      `).join('')}
      <!-- Section Badges on Canopy -->
      <rect x="35" y="81" width="160" height="20" rx="3" fill="#e11d48"/>
      <text x="115" y="95" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">🥖 CO.OP BAKERY</text>

      <rect x="300" y="81" width="200" height="20" rx="3" fill="#ffffff"/>
      <text x="400" y="95" font-family="'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="900" fill="#0284c7" text-anchor="middle">🛒 CỔNG CHÍNH VÀO SIÊU THỊ</text>

      <rect x="605" y="81" width="160" height="20" rx="3" fill="#15803d"/>
      <text x="685" y="95" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">🥗 FOOD COURT &amp; CAFE</text>
    </g>

    <!-- Lower Level Storefront Units (y: 110..240) -->

    <!-- SECTION 1: CO.OP BAKERY &amp; DELI (x: 10..240) -->
    <g id="coop_bakery">
      <rect x="12" y="110" width="230" height="130" fill="#fffbeb" stroke="#d97706" stroke-width="1.8"/>
      <rect x="20" y="118" width="214" height="88" fill="#ffffff" stroke="#fcd34d" stroke-width="1.5"/>
      <!-- Bakery Racks &amp; Golden Baguettes -->
      <rect x="26" y="138" width="55" height="38" rx="2" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2"/>
      <ellipse cx="53" cy="157" rx="18" ry="8" fill="#d97706"/>
      <rect x="88" y="138" width="55" height="38" rx="2" fill="#ffedd5" stroke="#ea580c" stroke-width="1.2"/>
      <ellipse cx="115" cy="157" rx="18" ry="8" fill="#ea580c"/>
      <rect x="150" y="138" width="76" height="38" rx="2" fill="#fee2e2" stroke="#ef4444" stroke-width="1.2"/>
      <ellipse cx="172" cy="157" rx="12" ry="7" fill="#b91c1c"/>
      <ellipse cx="202" cy="157" rx="12" ry="7" fill="#16a34a"/>
      <!-- Bottom Counter -->
      <rect x="14" y="210" width="226" height="30" fill="#d97706" stroke="#b45309" stroke-width="1.5"/>
      <text x="127" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle" lengthAdjust="spacingAndGlyphs" textLength="210">BÁNH MÌ TƯƠI RA LÒ MỖI 15 PHÚT: 15K - 25K</text>
    </g>

    <!-- SECTION 2: GRAND AUTOMATIC SLIDING GLASS DOORS (x: 250..550) -->
    <g id="coop_entrance">
      <rect x="250" y="110" width="300" height="130" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
      <!-- Interior Store Aisle View with illuminated shelves -->
      <rect x="256" y="116" width="288" height="92" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- Checkout Lanes with Green Cashier Lights -->
      <rect x="270" y="130" width="40" height="24" rx="2" fill="#1e293b"/>
      <circle cx="290" cy="125" r="4" fill="#22c55e"/>
      <text x="290" y="146" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">QUẦY 1</text>

      <rect x="325" y="130" width="40" height="24" rx="2" fill="#1e293b"/>
      <circle cx="345" cy="125" r="4" fill="#22c55e"/>
      <text x="345" y="146" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">QUẦY 2</text>

      <rect x="435" y="130" width="40" height="24" rx="2" fill="#1e293b"/>
      <circle cx="455" cy="125" r="4" fill="#22c55e"/>
      <text x="455" y="146" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">QUẦY 3</text>

      <rect x="490" y="130" width="40" height="24" rx="2" fill="#1e293b"/>
      <circle cx="510" cy="125" r="4" fill="#22c55e"/>
      <text x="510" y="146" font-family="'Segoe UI', sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">QUẦY 4</text>

      <!-- Glass Sliding Doors Frame with Co.opmart Official Logo Overhead -->
      <g filter="url(#signShadow)">
        <rect x="362" y="112" width="76" height="44" rx="4" fill="#ffffff" stroke="#0284c7" stroke-width="1.8"/>
        <image href="${coopmartBadgeBase64}" x="364" y="113" width="72" height="42" preserveAspectRatio="xMidYMid meet"/>
      </g>
      <rect x="375" y="156" width="50" height="52" fill="#38bdf8" opacity="0.35" stroke="#0284c7" stroke-width="2"/>
      <line x1="400" y1="156" x2="400" y2="208" stroke="#ffffff" stroke-width="2.5"/>

      <!-- Shopping Carts Line (In front of entrance) -->
      ${[270, 295, 320, 440, 465, 490].map(cx => `
        <rect x="${cx}" y="172" width="22" height="18" fill="none" stroke="#cbd5e1" stroke-width="1.8" rx="2"/>
        <line x1="${cx}" y1="178" x2="${cx + 22}" y2="178" stroke="#94a3b8" stroke-width="1.2"/>
        <circle cx="${cx + 4}" cy="194" r="3" fill="#334155"/>
        <circle cx="${cx + 18}" cy="194" r="3" fill="#334155"/>
        <rect x="${cx + 18}" y="168" width="3" height="6" fill="#e11d48"/>
      `).join('')}

      <!-- Welcoming Entrance Door Base -->
      <rect x="252" y="210" width="296" height="30" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
      <text x="400" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle" lengthAdjust="spacingAndGlyphs" textLength="280">KÍNH CHÀO QUÝ KHÁCH • MUA SẮM THẢ GA GIÁ ƯU ĐÃI</text>
    </g>

    <!-- SECTION 3: FOOD COURT &amp; REFRESHMENTS (x: 560..790) -->
    <g id="coop_foodcourt">
      <rect x="558" y="110" width="230" height="130" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.8"/>
      <rect x="566" y="118" width="214" height="88" fill="#ffffff" stroke="#86efac" stroke-width="1.5"/>
      <!-- Food Court Showcases &amp; Drinks -->
      <rect x="575" y="135" width="45" height="42" rx="3" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
      <circle cx="597" cy="156" r="12" fill="#ef4444"/>
      <rect x="628" y="135" width="45" height="42" rx="3" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="650" cy="156" r="12" fill="#f59e0b"/>
      <rect x="682" y="135" width="90" height="42" rx="3" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5"/>
      <circle cx="705" cy="156" r="10" fill="#0284c7"/>
      <circle cx="730" cy="156" r="10" fill="#16a34a"/>
      <circle cx="755" cy="156" r="10" fill="#ec4899"/>
      <!-- Bottom Counter -->
      <rect x="560" y="210" width="226" height="30" fill="#15803d" stroke="#14532d" stroke-width="1.5"/>
      <text x="673" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="900" fill="#ffffff" text-anchor="middle" lengthAdjust="spacingAndGlyphs" textLength="210">KHU ẨM THỰC TỰ CHỌN • HÀNG NGÀN MÓN NGON</text>
    </g>
  </g>
`;

const allScreens = [
  { id: 1, name: 'Vỉa Hè Khởi Nghiệp', content: screen1 },
  { id: 2, name: 'Cổng Trường Học', content: screen2 },
  { id: 3, name: 'Chợ Truyền Thống', content: screen3 },
  { id: 4, name: 'Khu Văn Phòng', content: screen4 },
  { id: 5, name: 'Công Viên', content: screen5 },
  { id: 6, name: 'Bến Xe', content: screen6 },
  { id: 7, name: 'Phố Ẩm Thực', content: screen7 },
  { id: 8, name: 'Trung Tâm Thành Phố', content: screen8 },
  { id: 9, name: 'Trung Tâm Thương Mại - Siêu Thị Co.opmart Đà Nẵng', content: screen9 },
];

async function run() {
  const root = path.resolve('public/assets');

  for (const s of allScreens) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${commonDefs}
      <rect width="${width}" height="${height}" fill="url(#skyGrad)"/>
      ${s.content}
      ${sidewalkAndCurb()}
    </svg>`;

    const fileName = `background_street_${s.id}.png`;
    const targetPath = path.join(root, fileName);

    // 800x520 with density 144 yields 1600x1040 HD!
    await sharp(Buffer.from(svg), { density: 144 }).png().toFile(targetPath);
    console.log(`Generated HD ${fileName} (${s.name})`);
  }

  // Also maintain background_sidewalk.png compatibility
  fs.copyFileSync(path.join(root, 'background_street_1.png'), path.join(root, 'background_sidewalk.png'));

  // Generate thumbnail for Location 9 in V-Phone Map (484x490)
  const thumbSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="484" height="490" viewBox="0 0 484 490">
    <defs>
      <linearGradient id="thumbSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="60%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="484" height="490" fill="url(#thumbSky)"/>
    <!-- Building Facade -->
    <rect x="22" y="80" width="440" height="340" rx="8" fill="#f8fafc" stroke="#0284c7" stroke-width="4"/>
    <rect x="22" y="80" width="440" height="25" fill="#0284c7"/>
    <rect x="22" y="105" width="440" height="8" fill="#e11d48"/>
    <!-- Big Official Co.opmart Logo -->
    <rect x="42" y="125" width="400" height="86" rx="8" fill="#0369a1" stroke="#e11d48" stroke-width="3"/>
    <rect x="52" y="130" width="100" height="76" rx="6" fill="#ffffff" stroke="#bae6fd" stroke-width="2"/>
    <image href="${coopmartBadgeBase64}" x="54" y="132" width="96" height="72" preserveAspectRatio="xMidYMid meet"/>
    <text x="280" y="160" font-family="'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">CO.OPMART ĐÀ NẴNG</text>
    <text x="280" y="185" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#fde047" text-anchor="middle">BẠN CỦA MỌI NHÀ</text>
    <!-- Glass Doors -->
    <rect x="142" y="240" width="200" height="180" rx="4" fill="#e0f2fe" stroke="#0284c7" stroke-width="3"/>
    <line x1="242" y1="240" x2="242" y2="420" stroke="#0284c7" stroke-width="3"/>
    <!-- Banner -->
    <rect x="52" y="435" width="380" height="35" rx="6" fill="#e11d48"/>
    <text x="242" y="458" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">TRUNG TÂM THƯƠNG MẠI</text>
  </svg>`;
  const locationThumbPath = path.resolve('public/assets/locations/commercial_center.png');
  await sharp(Buffer.from(thumbSvg)).png().toFile(locationThumbPath);
  console.log('Generated thumbnail public/assets/locations/commercial_center.png');

  console.log('Successfully created all 9 street screens!');
}

run().catch(console.error);
