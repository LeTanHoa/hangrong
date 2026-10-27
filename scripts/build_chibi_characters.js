import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const charDir = path.resolve('public/assets/characters');
fs.mkdirSync(charDir, { recursive: true });

const charSvg = (body, width = 64, height = 80) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fed7aa" />
        <stop offset="100%" stop-color="#fbcfe8" />
      </linearGradient>
      <linearGradient id="blush" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fda4af" />
        <stop offset="100%" stop-color="#f43f5e" />
      </linearGradient>
    </defs>
    <!-- Ground subtle shadow -->
    <ellipse cx="32" cy="76" rx="16" ry="3.5" fill="#1e293b" opacity="0.3" />
    ${body}
  </svg>`;
};

// Base Chibi Face Helper
const chibiHead = (hairColor, hairPath, eyes = '', mouth = '', accessory = '') => `
  <!-- Ears -->
  <circle cx="16" cy="36" r="4" fill="#fed7aa" stroke="#9a3412" stroke-width="1"/>
  <circle cx="48" cy="36" r="4" fill="#fed7aa" stroke="#9a3412" stroke-width="1"/>
  <!-- Head base -->
  <ellipse cx="32" cy="35" rx="17" ry="15" fill="#fef08a" stroke="#78350f" stroke-width="1.5"/>
  <ellipse cx="32" cy="35" rx="16" ry="14" fill="#ffedd5"/>
  <!-- Blush -->
  <circle cx="21" cy="40" r="3.5" fill="#fda4af" opacity="0.6"/>
  <circle cx="43" cy="40" r="3.5" fill="#fda4af" opacity="0.6"/>
  <!-- Hair Base & Bangs -->
  ${hairPath}
  <!-- Eyes -->
  ${eyes || `
    <ellipse cx="25" cy="35" rx="2.8" ry="4" fill="#0f172a"/>
    <circle cx="24" cy="33.5" r="1.2" fill="#ffffff"/>
    <ellipse cx="39" cy="35" rx="2.8" ry="4" fill="#0f172a"/>
    <circle cx="38" cy="33.5" r="1.2" fill="#ffffff"/>
  `}
  <!-- Mouth -->
  ${mouth || `<path d="M 30 42 Q 32 44.5 34 42" fill="none" stroke="#be123c" stroke-width="1.4" stroke-linecap="round"/>`}
  <!-- Accessory (Hat, glasses, etc.) -->
  ${accessory}
`;

const characters = {
  // 1. MAIN PLAYER (Bé Hàng Rong) - IDLE
  player_idle: charSvg(`
    <!-- Body & Apron -->
    <rect x="23" y="47" width="18" height="18" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="49" width="14" height="15" fill="#ea580c" rx="2"/>
    <!-- Feet / Shoes -->
    <ellipse cx="27" cy="72" rx="4" ry="3" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
    <ellipse cx="37" cy="72" rx="4" ry="3" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
    <!-- Hands holding crispy golden baguette on plate -->
    <circle cx="20" cy="56" r="3" fill="#fed7aa"/>
    <circle cx="44" cy="56" r="3" fill="#fed7aa"/>
    <rect x="36" y="52" width="16" height="8" rx="2" fill="#cbd5e1"/>
    <ellipse cx="44" cy="55" rx="6" ry="2.5" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
    <!-- Head with Orange Cap -->
    ${chibiHead('#334155', `
      <path d="M 16 34 Q 15 20 32 20 Q 49 20 48 34 Q 44 23 32 24 Q 20 23 16 34 Z" fill="#1e293b"/>
      <path d="M 22 26 Q 26 32 30 27" fill="none" stroke="#1e293b" stroke-width="2"/>
    `, '', `<path d="M 29 41 Q 32 46 35 41 Z" fill="#be123c"/>`, `
      <!-- Orange baseball cap worn backwards -->
      <path d="M 17 24 Q 32 12 47 24 Z" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
      <ellipse cx="32" cy="17" rx="14" ry="6" fill="#ea580c"/>
      <circle cx="32" cy="13" r="2.5" fill="#ffffff"/>
      <path d="M 40 20 L 52 18" stroke="#ea580c" stroke-width="3" stroke-linecap="round"/>
    `)}
  `),

  // 2. MAIN PLAYER - WALK
  player_walk: charSvg(`
    <rect x="23" y="47" width="18" height="18" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="49" width="14" height="15" fill="#ea580c" rx="2"/>
    <!-- Feet walking cadence -->
    <ellipse cx="25" cy="70" rx="4" ry="3.5" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
    <ellipse cx="40" cy="73" rx="4" ry="2.8" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
    <!-- Arms swinging -->
    <ellipse cx="18" cy="55" rx="3.5" ry="4" fill="#fed7aa"/>
    <ellipse cx="46" cy="54" rx="3.5" ry="4" fill="#fed7aa"/>
    ${chibiHead('#334155', `
      <path d="M 16 34 Q 15 20 32 20 Q 49 20 48 34 Q 44 23 32 24 Q 20 23 16 34 Z" fill="#1e293b"/>
    `, '', `<path d="M 29 41 Q 32 45 35 41 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="17" rx="14" ry="6" fill="#ea580c"/>
      <circle cx="32" cy="13" r="2.5" fill="#ffffff"/>
      <path d="M 40 20 L 52 18" stroke="#ea580c" stroke-width="3" stroke-linecap="round"/>
    `)}
  `),

  // 3. MAIN PLAYER - COOK
  player_cook: charSvg(`
    <rect x="23" y="47" width="18" height="18" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="49" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="72" rx="4" ry="3" fill="#ea580c"/>
    <ellipse cx="37" cy="72" rx="4" ry="3" fill="#ea580c"/>
    <!-- Tongs & frying spatula -->
    <line x1="16" y1="52" x2="10" y2="44" stroke="#475569" stroke-width="2.5"/>
    <rect x="42" y="48" width="12" height="12" fill="#94a3b8" rx="2"/>
    ${chibiHead('#334155', `
      <path d="M 16 34 Q 15 20 32 20 Q 49 20 48 34 Z" fill="#1e293b"/>
    `, '', `<path d="M 30 42 Q 32 45 34 42" fill="none" stroke="#be123c" stroke-width="1.5"/>`, `
      <!-- Chef Hat -->
      <path d="M 22 18 C 18 10, 24 5, 32 5 C 40 5, 46 10, 42 18 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
      <rect x="22" y="16" width="20" height="6" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
    `)}
  `),

  // 4. MAIN PLAYER - SERVE
  player_serve: charSvg(`
    <rect x="23" y="47" width="18" height="18" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="49" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="72" rx="4" ry="3" fill="#ea580c"/>
    <ellipse cx="37" cy="72" rx="4" ry="3" fill="#ea580c"/>
    <!-- Serving Platter lifted high -->
    <ellipse cx="48" cy="42" rx="10" ry="4" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
    <ellipse cx="48" cy="39" rx="6" ry="2.5" fill="#f59e0b"/>
    <circle cx="44" cy="48" r="3" fill="#fed7aa"/>
    ${chibiHead('#334155', `
      <path d="M 16 34 Q 15 20 32 20 Q 49 20 48 34 Z" fill="#1e293b"/>
    `, `
      <!-- Happy winking eye -->
      <path d="M 23 35 Q 26 31 28 35" fill="none" stroke="#0f172a" stroke-width="2"/>
      <ellipse cx="39" cy="35" rx="2.8" ry="4" fill="#0f172a"/>
      <circle cx="38" cy="33.5" r="1.2" fill="#ffffff"/>
    `, `<path d="M 29 41 Q 32 46 35 41 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="17" rx="14" ry="6" fill="#ea580c"/>
    `)}
  `),

  // 5. MAIN PLAYER - CELEBRATE
  player_celebrate: charSvg(`
    <rect x="23" y="47" width="18" height="18" rx="4" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
    <rect x="25" y="49" width="14" height="15" fill="#ea580c" rx="2"/>
    <ellipse cx="27" cy="71" rx="4" ry="3" fill="#ea580c"/>
    <ellipse cx="37" cy="71" rx="4" ry="3" fill="#ea580c"/>
    <!-- V victory hands in air -->
    <circle cx="15" cy="42" r="3.5" fill="#fed7aa"/>
    <circle cx="49" cy="42" r="3.5" fill="#fed7aa"/>
    <!-- Little sparkles -->
    <text x="10" y="32" font-size="10" fill="#facc15">✨</text>
    <text x="46" y="32" font-size="10" fill="#facc15">✨</text>
    ${chibiHead('#334155', `
      <path d="M 16 34 Q 15 20 32 20 Q 49 20 48 34 Z" fill="#1e293b"/>
    `, `
      <!-- Joyful closed ^ ^ eyes -->
      <path d="M 22 35 L 25 32 L 28 35" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M 36 35 L 39 32 L 42 35" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>
    `, `<path d="M 28 40 Q 32 47 36 40 Z" fill="#be123c"/>`, `
      <ellipse cx="32" cy="17" rx="14" ry="6" fill="#ea580c"/>
    `)}
  `),

  // ================= 12 DISTINCT CUSTOMER TYPES =================
  // 6. CUST: STUDENT SCHOOL (Học sinh khăn quàng đỏ)
  cust_student_school: charSvg(`
    <!-- White shirt with red scarf -->
    <rect x="24" y="47" width="16" height="18" rx="3" fill="#f8fafc" stroke="#64748b" stroke-width="1"/>
    <!-- Red Scarf (Khăn quàng đỏ) -->
    <polygon points="28,47 36,47 32,54" fill="#dc2626"/>
    <line x1="32" y1="54" x2="33" y2="61" stroke="#dc2626" stroke-width="2.5"/>
    <ellipse cx="28" cy="72" rx="3.5" ry="2.5" fill="#1e293b"/>
    <ellipse cx="36" cy="72" rx="3.5" ry="2.5" fill="#1e293b"/>
    <!-- Blue school backpack strap -->
    <rect x="23" y="49" width="3" height="14" fill="#0284c7" rx="1"/>
    <rect x="38" y="49" width="3" height="14" fill="#0284c7" rx="1"/>
    ${chibiHead('#1e293b', `
      <!-- Neat boy student hair -->
      <path d="M 16 32 C 16 18, 48 18, 48 32 C 45 22, 36 22, 32 23 C 28 22, 19 22, 16 32 Z" fill="#1e293b"/>
      <path d="M 24 24 Q 28 30 32 25" fill="none" stroke="#1e293b" stroke-width="2"/>
    `)}
  `),

  // 7. CUST: STUDENT UNI (Sinh viên đại học tai nghe)
  cust_student_uni: charSvg(`
    <!-- Cool hoodie -->
    <rect x="22" y="47" width="20" height="18" rx="4" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1"/>
    <ellipse cx="27" cy="72" rx="4" ry="3" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
    <ellipse cx="37" cy="72" rx="4" ry="3" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
    ${chibiHead('#334155', `
      <path d="M 16 34 C 15 18, 49 18, 48 34 C 42 22, 34 22, 30 24 C 24 22, 18 24, 16 34 Z" fill="#475569"/>
    `, `
      <!-- Round eyeglasses -->
      <circle cx="25" cy="35" r="5" fill="none" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="39" cy="35" r="5" fill="none" stroke="#1e293b" stroke-width="1.5"/>
      <line x1="30" y1="35" x2="34" y2="35" stroke="#1e293b" stroke-width="1.5"/>
      <circle cx="25" cy="35" r="2" fill="#0f172a"/>
      <circle cx="39" cy="35" r="2" fill="#0f172a"/>
    `, '', `
      <!-- White headphones around neck -->
      <path d="M 18 45 Q 32 50 46 45" fill="none" stroke="#e2e8f0" stroke-width="3"/>
      <rect x="15" y="40" width="5" height="8" rx="2" fill="#e2e8f0"/>
      <rect x="44" y="40" width="5" height="8" rx="2" fill="#e2e8f0"/>
    `)}
  `),

  // 8. CUST: OFFICE WORKER (Nhân viên văn phòng sơ mi cà vạt)
  cust_office_worker: charSvg(`
    <!-- Blue shirt with tie -->
    <rect x="23" y="47" width="18" height="18" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="1"/>
    <polygon points="31,47 33,47 34,56 32,59 30,56" fill="#1e3a8a"/>
    <ellipse cx="27" cy="72" rx="4" ry="2.8" fill="#1e293b"/>
    <ellipse cx="37" cy="72" rx="4" ry="2.8" fill="#1e293b"/>
    <!-- Laptop briefcase -->
    <rect x="44" y="54" width="11" height="9" rx="1.5" fill="#475569" stroke="#1e293b" stroke-width="0.8"/>
    ${chibiHead('#0f172a', `
      <!-- Side parted neat office hair -->
      <path d="M 16 32 C 16 16, 48 16, 48 32 C 40 20, 24 20, 16 32 Z" fill="#0f172a"/>
      <path d="M 22 22 L 34 26" stroke="#0f172a" stroke-width="2"/>
    `)}
  `),

  // 9. CUST: DELIVERY DRIVER (Tài xế công nghệ áo xanh lá)
  cust_delivery_driver: charSvg(`
    <!-- Green Tech Delivery Jacket -->
    <rect x="22" y="47" width="20" height="18" rx="3" fill="#16a34a" stroke="#15803d" stroke-width="1.2"/>
    <line x1="32" y1="47" x2="32" y2="65" stroke="#ffffff" stroke-width="1.5"/>
    <ellipse cx="27" cy="72" rx="4" ry="3" fill="#1e293b"/>
    <ellipse cx="37" cy="72" rx="4" ry="3" fill="#1e293b"/>
    ${chibiHead('#1e293b', `
      <path d="M 16 34 Q 32 18 48 34 Z" fill="#1e293b"/>
    `, '', `<path d="M 30 42 Q 32 45 34 42" fill="none" stroke="#be123c" stroke-width="1.5"/>`, `
      <!-- Green Delivery Helmet with visor -->
      <path d="M 16 26 C 16 12, 48 12, 48 26 Z" fill="#16a34a" stroke="#14532d" stroke-width="1.5"/>
      <path d="M 18 26 L 46 26" stroke="#facc15" stroke-width="2.5"/>
    `)}
  `),

  // 10. CUST: NEIGHBORHOOD AUNTIE (Cô hàng xóm mặc đồ bộ hoa nón lá)
  cust_neighborhood_auntie: charSvg(`
    <!-- Floral patterned pyjama pajamas -->
    <rect x="22" y="47" width="20" height="18" rx="4" fill="#fde047" stroke="#ca8a04" stroke-width="1"/>
    <circle cx="26" cy="53" r="1.5" fill="#f43f5e"/>
    <circle cx="34" cy="58" r="1.5" fill="#f43f5e"/>
    <circle cx="38" cy="52" r="1.5" fill="#f43f5e"/>
    <ellipse cx="27" cy="72" rx="4" ry="2.5" fill="#ec4899"/>
    <ellipse cx="37" cy="72" rx="4" ry="2.5" fill="#ec4899"/>
    ${chibiHead('#451a03', `
      <!-- Hair bun -->
      <circle cx="32" cy="18" r="6" fill="#451a03"/>
      <path d="M 16 34 C 16 20, 48 20, 48 34 Z" fill="#451a03"/>
    `, '', `<path d="M 29 42 Q 32 46 35 42 Z" fill="#be123c"/>`, `
      <!-- Conical palm hat (Nón lá) hanging slightly behind -->
      <polygon points="12,24 52,24 32,10" fill="#fef08a" stroke="#ca8a04" stroke-width="1.2" opacity="0.95"/>
      <line x1="22" y1="24" x2="32" y2="10" stroke="#ca8a04" stroke-width="0.8"/>
      <line x1="42" y1="24" x2="32" y2="10" stroke="#ca8a04" stroke-width="0.8"/>
    `)}
  `),

  // 11. CUST: ELDERLY CITIZEN (Cụ già hiền từ quạt nan)
  cust_elderly_citizen: charSvg(`
    <!-- Traditional brown silk pyjamas -->
    <rect x="23" y="47" width="18" height="18" rx="3" fill="#b45309" stroke="#78350f" stroke-width="1"/>
    <ellipse cx="27" cy="72" rx="3.5" ry="2.5" fill="#451a03"/>
    <ellipse cx="37" cy="72" rx="3.5" ry="2.5" fill="#451a03"/>
    <!-- Palm leaf fan in hand -->
    <path d="M 14 55 Q 10 45 18 45 Q 22 55 14 55 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8"/>
    ${chibiHead('#94a3b8', `
      <!-- White thinning hair & white eyebrows -->
      <path d="M 16 34 C 16 20, 48 20, 48 34 C 42 26, 22 26, 16 34 Z" fill="#e2e8f0"/>
      <path d="M 23 28 L 27 28" stroke="#cbd5e1" stroke-width="1.8"/>
      <path d="M 37 28 L 41 28" stroke="#cbd5e1" stroke-width="1.8"/>
    `, `
      <!-- Peaceful smiling eyes -->
      <path d="M 23 35 Q 26 38 29 35" fill="none" stroke="#334155" stroke-width="1.8"/>
      <path d="M 35 35 Q 38 38 41 35" fill="none" stroke="#334155" stroke-width="1.8"/>
    `, `<path d="M 30 42 Q 32 45 34 42" fill="none" stroke="#b45309" stroke-width="1.5"/>`)}
  `),

  // 12. CUST: FOREIGN TOURIST (Tây ba lô máy ảnh)
  cust_foreign_tourist: charSvg(`
    <!-- Hawaiian floral vacation shirt -->
    <rect x="22" y="47" width="20" height="18" rx="3" fill="#f43f5e" stroke="#be123c" stroke-width="1"/>
    <ellipse cx="27" cy="72" rx="4" ry="3" fill="#a16207"/>
    <ellipse cx="37" cy="72" rx="4" ry="3" fill="#a16207"/>
    <!-- Camera hanging from neck strap -->
    <rect x="27" y="56" width="10" height="7" rx="1.5" fill="#1e293b"/>
    <circle cx="32" cy="59.5" r="2.2" fill="#38bdf8"/>
    <line x1="27" y1="48" x2="29" y2="56" stroke="#475569" stroke-width="1"/>
    <line x1="37" y1="48" x2="35" y2="56" stroke="#475569" stroke-width="1"/>
    ${chibiHead('#eab308', `
      <!-- Blonde hair -->
      <path d="M 16 34 C 15 18, 49 18, 48 34 C 42 22, 22 22, 16 34 Z" fill="#fde047"/>
    `, `
      <!-- Blue eyes -->
      <ellipse cx="25" cy="35" rx="2.8" ry="4" fill="#0284c7"/>
      <circle cx="24" cy="33.5" r="1.2" fill="#ffffff"/>
      <ellipse cx="39" cy="35" rx="2.8" ry="4" fill="#0284c7"/>
      <circle cx="38" cy="33.5" r="1.2" fill="#ffffff"/>
    `, `<path d="M 29 42 Q 32 46 35 42 Z" fill="#be123c"/>`)}
  `),

  // 13. CUST: FOOD CRITIC (Chuyên gia ẩm thực sổ tay)
  cust_food_critic: charSvg(`
    <rect x="23" y="47" width="18" height="18" rx="3" fill="#475569" stroke="#1e293b" stroke-width="1"/>
    <polygon points="31,47 33,47 33,55 31,55" fill="#f59e0b"/>
    <ellipse cx="27" cy="72" rx="4" ry="2.8" fill="#0f172a"/>
    <ellipse cx="37" cy="72" rx="4" ry="2.8" fill="#0f172a"/>
    <!-- Notebook & Pen -->
    <rect x="42" y="52" width="10" height="13" rx="1.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
    <line x1="45" y1="56" x2="49" y2="56" stroke="#78350f" stroke-width="1"/>
    <line x1="45" y1="60" x2="49" y2="60" stroke="#78350f" stroke-width="1"/>
    ${chibiHead('#1e293b', `
      <path d="M 16 32 C 16 16, 48 16, 48 32 C 40 22, 24 22, 16 32 Z" fill="#1e293b"/>
    `, `
      <circle cx="25" cy="35" r="4.5" fill="none" stroke="#eab308" stroke-width="1.5"/>
      <circle cx="39" cy="35" r="4.5" fill="none" stroke="#eab308" stroke-width="1.5"/>
      <line x1="29.5" y1="35" x2="34.5" y2="35" stroke="#eab308" stroke-width="1.5"/>
      <ellipse cx="25" cy="35" rx="2" ry="3" fill="#0f172a"/>
      <ellipse cx="39" cy="35" rx="2" ry="3" fill="#0f172a"/>
    `, `<path d="M 30 42 L 34 42" stroke="#be123c" stroke-width="1.5"/>`)}
  `),

  // 14. CUST: LOYAL OFFICE LADY (Chị văn phòng đầm hồng)
  cust_loyal_office_lady: charSvg(`
    <!-- Elegant pink dress -->
    <polygon points="25,47 39,47 43,68 21,68" fill="#f472b6" stroke="#db2777" stroke-width="1"/>
    <ellipse cx="27" cy="72" rx="3.5" ry="2.5" fill="#be185d"/>
    <ellipse cx="37" cy="72" rx="3.5" ry="2.5" fill="#be185d"/>
    <!-- Luxury handbag -->
    <rect x="14" y="56" width="8" height="9" rx="1.5" fill="#d97706"/>
    <path d="M 16 56 V 51 H 20 V 56" fill="none" stroke="#b45309" stroke-width="1.2"/>
    ${chibiHead('#451a03', `
      <!-- Long feminine side bangs -->
      <path d="M 16 34 C 15 18, 49 18, 48 34 C 44 22, 36 22, 32 23 C 28 22, 20 22, 16 34 Z" fill="#451a03"/>
      <path d="M 14 34 Q 12 50 16 54" fill="none" stroke="#451a03" stroke-width="3"/>
      <path d="M 50 34 Q 52 50 48 54" fill="none" stroke="#451a03" stroke-width="3"/>
    `, '', `<path d="M 29 42 Q 32 46 35 42 Z" fill="#db2777"/>`, `
      <circle cx="43" cy="24" r="3" fill="#ec4899"/>
    `)}
  `),

  // 15. CUST: FAMILY WITH KIDS (Mẹ & em bé)
  cust_family_with_kids: charSvg(`
    <polygon points="23,47 37,47 41,68 19,68" fill="#818cf8" stroke="#4f46e5" stroke-width="1"/>
    <ellipse cx="26" cy="72" rx="3.5" ry="2.5" fill="#4338ca"/>
    <ellipse cx="34" cy="72" rx="3.5" ry="2.5" fill="#4338ca"/>
    <!-- Cute little kid on side holding pinwheel -->
    <ellipse cx="48" cy="62" rx="8" ry="8" fill="#ffedd5" stroke="#f97316" stroke-width="1"/>
    <rect x="44" y="68" width="8" height="6" fill="#fde047" rx="2"/>
    <ellipse cx="46" cy="61" rx="1.5" ry="2" fill="#0f172a"/>
    <ellipse cx="50" cy="61" rx="1.5" ry="2" fill="#0f172a"/>
    <!-- Colorful Pinwheel in hand -->
    <line x1="52" y1="58" x2="55" y2="46" stroke="#78350f" stroke-width="1.5"/>
    <polygon points="55,46 52,43 55,40 58,43" fill="#ef4444"/>
    <polygon points="55,46 58,49 55,52 52,49" fill="#3b82f6"/>
    ${chibiHead('#334155', `
      <path d="M 16 34 C 16 18, 48 18, 48 34 Z" fill="#334155"/>
    `, '', `<path d="M 29 42 Q 32 45 35 42 Z" fill="#be123c"/>`)}
  `),

  // 16. CUST: CELEBRITY VIP (Khách VIP đeo kính râm)
  cust_celebrity_vip: charSvg(`
    <!-- Stylish purple jacket -->
    <rect x="22" y="47" width="20" height="18" rx="3" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1.2"/>
    <polygon points="28,47 32,53 36,47" fill="#facc15"/>
    <ellipse cx="27" cy="72" rx="4" ry="2.8" fill="#1e1b4b"/>
    <ellipse cx="37" cy="72" rx="4" ry="2.8" fill="#1e1b4b"/>
    <!-- VIP gold watch / necklace -->
    <circle cx="43" cy="55" r="2.5" fill="#facc15"/>
    ${chibiHead('#0f172a', `
      <path d="M 16 30 C 16 14, 48 14, 48 30 C 42 18, 22 18, 16 30 Z" fill="#0f172a"/>
    `, `
      <!-- Cool dark aviator sunglasses -->
      <polygon points="20,31 29,31 28,39 21,39" fill="#0f172a" stroke="#facc15" stroke-width="1.2"/>
      <polygon points="35,31 44,31 43,39 36,39" fill="#0f172a" stroke="#facc15" stroke-width="1.2"/>
      <line x1="29" y1="33" x2="35" y2="33" stroke="#facc15" stroke-width="1.5"/>
      <line x1="22" y1="33" x2="27" y2="37" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/>
      <line x1="37" y1="33" x2="42" y2="37" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/>
    `, `<path d="M 30 43 L 34 43" stroke="#be123c" stroke-width="1.5"/>`)}
  `),

  // 17. CUST: FACTORY WORKER (Chú công nhân nón bảo hộ vàng)
  cust_factory_worker: charSvg(`
    <!-- Blue Industrial Overalls -->
    <rect x="22" y="47" width="20" height="18" rx="3" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
    <ellipse cx="27" cy="72" rx="4" ry="3" fill="#334155"/>
    <ellipse cx="37" cy="72" rx="4" ry="3" fill="#334155"/>
    ${chibiHead('#1e293b', `
      <path d="M 16 34 Q 32 20 48 34 Z" fill="#1e293b"/>
    `, '', `<path d="M 30 42 Q 32 45 34 42" fill="none" stroke="#be123c" stroke-width="1.5"/>`, `
      <!-- Yellow Hardhat -->
      <path d="M 16 26 C 16 12, 48 12, 48 26 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
      <ellipse cx="32" cy="26" rx="17" ry="3" fill="#eab308"/>
    `)}
  `),
};

async function run() {
  for (const [name, svgContent] of Object.entries(characters)) {
    const pngPath = path.join(charDir, `${name}.png`);
    await sharp(Buffer.from(svgContent)).png().toFile(pngPath);
    console.log(`Generated high-res chibi character: ${name}.png`);
  }

  // Also duplicate player_idle to player_boy and player_girl for fallback compatibility
  await sharp(path.join(charDir, 'player_idle.png')).toFile(path.join(charDir, 'player_boy.png'));
  await sharp(path.join(charDir, 'cust_loyal_office_lady.png')).toFile(path.join(charDir, 'player_girl.png'));

  console.log('All characters successfully rebuilt in high-definition chibi art!');
}

run().catch(console.error);

