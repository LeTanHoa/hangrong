import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('public/assets/props');
fs.mkdirSync(root, { recursive: true });

const svgPng = async (name, body, width = 64, height = 64) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(root, `${name}.png`));
  console.log(`Generated ${name}.png (${width}x${height})`);
};

async function run() {
  const outline = '#1e293b';

  // 1. Máy bơm hơi sửa xe (Air Compressor Pump)
  await svgPng('prop_air_pump', `
    <!-- Tank -->
    <ellipse cx="32" cy="44" rx="20" ry="12" fill="#ef4444" stroke="${outline}" stroke-width="2.5"/>
    <rect x="18" y="32" width="28" height="14" fill="#dc2626"/>
    <!-- Motor on top -->
    <rect x="22" y="20" width="20" height="14" rx="2" fill="#475569" stroke="${outline}" stroke-width="2"/>
    <!-- Gauge / Pressure Meter -->
    <circle cx="44" cy="18" r="6" fill="#ffffff" stroke="${outline}" stroke-width="1.8"/>
    <line x1="44" y1="18" x2="47" y2="15" stroke="#ef4444" stroke-width="1.5"/>
    <!-- Air Hose (Yellow coil) -->
    <path d="M 46 24 Q 56 30 52 42 T 48 54" fill="none" stroke="#eab308" stroke-width="2.5"/>
    <!-- Wheels & Handle -->
    <circle cx="20" cy="52" r="6" fill="#1e293b"/>
    <circle cx="44" cy="52" r="6" fill="#1e293b"/>
    <path d="M 16 34 L 10 24 L 14 24" fill="none" stroke="${outline}" stroke-width="2.5"/>
  `, 64, 64);

  // 2. Hộp đồ nghề cơ khí (Toolbox)
  await svgPng('prop_toolbox', `
    <!-- Toolbox body -->
    <rect x="10" y="28" width="44" height="26" rx="3" fill="#2563eb" stroke="${outline}" stroke-width="2.5"/>
    <!-- Lid clasp -->
    <rect x="8" y="22" width="48" height="8" rx="2" fill="#1d4ed8" stroke="${outline}" stroke-width="2"/>
    <rect x="28" y="26" width="8" height="6" fill="#f8fafc" stroke="${outline}" stroke-width="1.5"/>
    <!-- Handle -->
    <path d="M 24 22 V 15 H 40 V 22" fill="none" stroke="${outline}" stroke-width="2.5"/>
    <!-- Small Wrench peeking out -->
    <path d="M 44 24 L 54 14" stroke="#94a3b8" stroke-width="3"/>
    <circle cx="54" cy="14" r="3" fill="none" stroke="#94a3b8" stroke-width="2"/>
  `, 64, 64);

  // 3. Lốp xe máy dựa tường (Stacked Tires)
  await svgPng('prop_tires', `
    <!-- Tire 1 (Back leaning) -->
    <ellipse cx="26" cy="34" rx="14" ry="22" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/>
    <ellipse cx="26" cy="34" rx="7" ry="14" fill="#cbd5e1" opacity="0.3"/>
    <!-- Tire 2 (Front) -->
    <ellipse cx="38" cy="38" rx="15" ry="22" fill="#334155" stroke="#0f172a" stroke-width="2.5"/>
    <ellipse cx="38" cy="38" rx="8" ry="14" fill="#f1f5f9" opacity="0.25"/>
    <!-- Tire tread details -->
    <line x1="42" y1="20" x2="48" y2="24" stroke="#0f172a" stroke-width="2"/>
    <line x1="46" y1="32" x2="52" y2="36" stroke="#0f172a" stroke-width="2"/>
    <line x1="46" y1="44" x2="51" y2="48" stroke="#0f172a" stroke-width="2"/>
  `, 64, 64);

  // 4. Biển hiệu đứng vỉa hè "BƠM VÁ XE"
  await svgPng('prop_standing_sign_suaxe', `
    <!-- Wooden A-frame easel -->
    <line x1="14" y1="58" x2="26" y2="10" stroke="#78350f" stroke-width="3"/>
    <line x1="50" y1="58" x2="38" y2="10" stroke="#78350f" stroke-width="3"/>
    <!-- Signboard board -->
    <rect x="12" y="14" width="40" height="36" rx="3" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
    <rect x="15" y="17" width="34" height="30" fill="#fef9c3"/>
    <!-- Text simulated -->
    <text x="32" y="27" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" font-weight="900" fill="#dc2626" text-anchor="middle">BƠM VÁ</text>
    <text x="32" y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="7" font-weight="900" fill="#1e293b" text-anchor="middle">XE MÁY</text>
    <text x="32" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="6" font-weight="700" fill="#0284c7" text-anchor="middle">5K - 20K</text>
  `, 64, 64);

  // 5. Bình trà đá & Quầy nước vỉa hè (Tea station)
  await svgPng('prop_tea_station', `
    <!-- Small wood table / stool -->
    <rect x="12" y="32" width="40" height="6" rx="2" fill="#b45309" stroke="${outline}" stroke-width="2"/>
    <line x1="18" y1="38" x2="16" y2="56" stroke="#78350f" stroke-width="3"/>
    <line x1="46" y1="38" x2="48" y2="56" stroke="#78350f" stroke-width="3"/>
    <!-- Big Orange / Red Thermal Drink Container -->
    <rect x="18" y="12" width="22" height="20" rx="3" fill="#f97316" stroke="${outline}" stroke-width="2"/>
    <!-- Lid -->
    <rect x="16" y="9" width="26" height="4" rx="2" fill="#ea580c" stroke="${outline}" stroke-width="1.5"/>
    <rect x="26" y="6" width="6" height="3" fill="#ffffff" stroke="${outline}" stroke-width="1"/>
    <!-- Faucet / Spigot -->
    <rect x="38" y="24" width="6" height="4" fill="#94a3b8" stroke="${outline}" stroke-width="1"/>
    <line x1="41" y1="28" x2="41" y2="30" stroke="#0284c7" stroke-width="2"/>
    <!-- Clear Glass with Straw -->
    <rect x="43" y="20" width="7" height="12" fill="#bae6fd" stroke="${outline}" stroke-width="1" opacity="0.8"/>
    <line x1="44" y1="16" x2="48" y2="28" stroke="#ef4444" stroke-width="1.5"/>
  `, 64, 64);

  // 6. Ghế cắt tóc xoay cổ điển vỉa hè (Barber chair)
  await svgPng('prop_barber_chair', `
    <!-- Cast iron base -->
    <ellipse cx="32" cy="56" rx="18" ry="6" fill="#64748b" stroke="${outline}" stroke-width="2.5"/>
    <line x1="32" y1="54" x2="32" y2="42" stroke="#94a3b8" stroke-width="5"/>
    <!-- Seat cushion (Red vinyl) -->
    <ellipse cx="32" cy="40" rx="16" ry="7" fill="#dc2626" stroke="${outline}" stroke-width="2"/>
    <!-- Backrest -->
    <rect x="20" y="18" width="24" height="18" rx="4" fill="#b91c1c" stroke="${outline}" stroke-width="2"/>
    <!-- Headrest -->
    <rect x="25" y="10" width="14" height="6" rx="2" fill="#991b1b" stroke="${outline}" stroke-width="1.5"/>
    <!-- Armrests -->
    <path d="M 16 34 V 28 H 20" fill="none" stroke="${outline}" stroke-width="2.5"/>
    <path d="M 48 34 V 28 H 44" fill="none" stroke="${outline}" stroke-width="2.5"/>
    <!-- Footrest -->
    <rect x="22" y="47" width="20" height="3" fill="#cbd5e1" stroke="${outline}" stroke-width="1.5"/>
  `, 64, 64);

  // 7. Cột xoay Barber Pole (Đỏ Trắng Xanh)
  await svgPng('prop_barber_pole', `
    <!-- Top & Bottom Gold Caps -->
    <circle cx="32" cy="8" r="6" fill="#facc15" stroke="${outline}" stroke-width="1.5"/>
    <rect x="26" y="13" width="12" height="4" fill="#ca8a04" stroke="${outline}" stroke-width="1"/>
    <!-- Glass Cylinder -->
    <rect x="26" y="17" width="12" height="36" rx="2" fill="#ffffff" stroke="${outline}" stroke-width="1.5"/>
    <!-- Diagonal Stripes -->
    <clipPath id="poleClip">
      <rect x="27" y="18" width="10" height="34"/>
    </clipPath>
    <g clip-path="url(#poleClip)">
      <line x1="20" y1="20" x2="45" y2="30" stroke="#dc2626" stroke-width="4"/>
      <line x1="20" y1="28" x2="45" y2="38" stroke="#2563eb" stroke-width="4"/>
      <line x1="20" y1="36" x2="45" y2="46" stroke="#dc2626" stroke-width="4"/>
      <line x1="20" y1="44" x2="45" y2="54" stroke="#2563eb" stroke-width="4"/>
    </g>
    <!-- Bottom Cap -->
    <rect x="26" y="53" width="12" height="4" fill="#ca8a04" stroke="${outline}" stroke-width="1"/>
    <circle cx="32" cy="58" r="4" fill="#facc15" stroke="${outline}" stroke-width="1.5"/>
  `, 64, 64);

  // 8. Gương soi viền gỗ & Bàn hớt tóc nhỏ (Barber Mirror)
  await svgPng('prop_barber_mirror', `
    <!-- Mirror frame -->
    <rect x="14" y="8" width="36" height="42" rx="3" fill="#bae6fd" stroke="#78350f" stroke-width="3"/>
    <!-- Glass highlight -->
    <polygon points="18,12 28,12 18,34" fill="#ffffff" opacity="0.6"/>
    <!-- Shelf with bottles and scissors -->
    <rect x="10" y="48" width="44" height="6" fill="#9a3412" stroke="${outline}" stroke-width="2"/>
    <rect x="16" y="40" width="5" height="8" fill="#38bdf8"/>
    <rect x="24" y="38" width="6" height="10" fill="#ec4899"/>
    <!-- Scissors -->
    <line x1="38" y1="41" x2="44" y2="47" stroke="#94a3b8" stroke-width="2"/>
    <line x1="44" y1="41" x2="38" y2="47" stroke="#94a3b8" stroke-width="2"/>
  `, 64, 64);

  // 9. Biển hiệu đứng vỉa hè "HỚT TÓC NAM"
  await svgPng('prop_standing_sign_cattoc', `
    <!-- Wooden A-frame easel -->
    <line x1="14" y1="58" x2="26" y2="10" stroke="#78350f" stroke-width="3"/>
    <line x1="50" y1="58" x2="38" y2="10" stroke="#78350f" stroke-width="3"/>
    <!-- Signboard board -->
    <rect x="12" y="14" width="40" height="36" rx="3" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
    <rect x="15" y="17" width="34" height="30" fill="#f8fafc"/>
    <text x="32" y="27" font-family="'Segoe UI', Arial, sans-serif" font-size="7.5" font-weight="900" fill="#1e40af" text-anchor="middle">CẮT TÓC</text>
    <text x="32" y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="7" font-weight="900" fill="#dc2626" text-anchor="middle">NAM BÌNH DÂN</text>
    <text x="32" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="6" font-weight="700" fill="#15803d" text-anchor="middle">30.000Đ</text>
  `, 64, 64);

  console.log('All shop props successfully generated!');
}

run().catch(console.error);

