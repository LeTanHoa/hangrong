import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CHAR_SHEET = 'public/assets/raw/characters_sheet.jpg';
const LOC_SHEET = 'public/assets/raw/locations_sheet.jpg';

// Helper to remove light background and make it transparent
async function cropAndTransparent(inputPath, outputPath, rect, tolerance = 38) {
  const cropped = await sharp(inputPath)
    .extract(rect)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = cropped;
  const { width, height, channels } = info;

  // Sample corner pixel as background color
  const bgR = (data[0] + data[(width - 1) * channels]) / 2;
  const bgG = (data[1] + data[(width - 1) * channels + 1]) / 2;
  const bgB = (data[2] + data[(width - 1) * channels + 2]) / 2;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dist = Math.hypot(r - bgR, g - bgG, b - bgB);

    // Also remove near-white cards
    const isPale = r > 225 && g > 225 && b > 225;

    if (dist < tolerance || (isPale && (i < width * channels * 12 || i > width * channels * (height - 10)))) {
      data[i + 3] = 0; // Transparent
    } else if (dist < tolerance + 14) {
      data[i + 3] = Math.round(((dist - tolerance) / 14) * 255);
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);
}

// Crop background without transparency
async function cropImage(inputPath, outputPath, rect) {
  await sharp(inputPath)
    .extract(rect)
    .png()
    .toFile(outputPath);
}

async function run() {
  console.log('Extracting assets from master sheets...');

  // Ensure directories
  fs.mkdirSync('public/assets/characters', { recursive: true });
  fs.mkdirSync('public/assets/carts', { recursive: true });
  fs.mkdirSync('public/assets/locations', { recursive: true });
  fs.mkdirSync('public/assets/props', { recursive: true });

  // 1. EXTRACT 8 LOCATIONS (High-res 2.5D Isometric backgrounds)
  console.log('1. Extracting 8 Locations...');
  const locations = [
    { id: 'sidewalk_start', rect: { left: 10, top: 145, width: 242, height: 245 } },
    { id: 'school_gate', rect: { left: 260, top: 145, width: 242, height: 245 } },
    { id: 'traditional_market', rect: { left: 512, top: 145, width: 242, height: 245 } },
    { id: 'office_quarter', rect: { left: 765, top: 145, width: 242, height: 245 } },
    { id: 'central_park', rect: { left: 10, top: 450, width: 242, height: 255 } },
    { id: 'bus_station', rect: { left: 260, top: 450, width: 242, height: 255 } },
    { id: 'food_street', rect: { left: 512, top: 450, width: 242, height: 255 } },
    { id: 'city_center', rect: { left: 765, top: 450, width: 242, height: 255 } },
  ];

  for (const loc of locations) {
    await cropImage(LOC_SHEET, `public/assets/locations/${loc.id}.png`, loc.rect);
  }

  // 2. EXTRACT 5 CART TIERS (Standalone transparent PNGs)
  console.log('2. Extracting 5 Cart Tiers...');
  const carts = [
    { id: 'cart_tier_1', rect: { left: 45, top: 800, width: 150, height: 130 } },
    { id: 'cart_tier_2', rect: { left: 228, top: 800, width: 140, height: 130 } },
    { id: 'cart_tier_3', rect: { left: 395, top: 795, width: 155, height: 135 } },
    { id: 'cart_tier_4', rect: { left: 570, top: 790, width: 170, height: 140 } },
    { id: 'cart_tier_5', rect: { left: 765, top: 785, width: 215, height: 145 } },
  ];

  for (const cart of carts) {
    await cropAndTransparent(LOC_SHEET, `public/assets/carts/${cart.id}.png`, cart.rect, 35);
  }

  // 3. EXTRACT CHARACTERS (Player, Staff, 12 Customers)
  console.log('3. Extracting Chibi Characters...');
  const characters = [
    // Main Player
    { id: 'player_boy', rect: { left: 10, top: 68, width: 85, height: 158 } },
    { id: 'player_girl', rect: { left: 95, top: 68, width: 85, height: 158 } },

    // Player action states
    { id: 'player_idle', rect: { left: 315, top: 60, width: 38, height: 50 } },
    { id: 'player_walk', rect: { left: 525, top: 60, width: 38, height: 50 } },
    { id: 'player_run', rect: { left: 765, top: 60, width: 38, height: 50 } },
    { id: 'player_carry', rect: { left: 315, top: 195, width: 38, height: 50 } },
    { id: 'player_cook', rect: { left: 525, top: 195, width: 38, height: 50 } },
    { id: 'player_serve', rect: { left: 765, top: 195, width: 38, height: 50 } },
    { id: 'player_sell', rect: { left: 315, top: 330, width: 38, height: 50 } },
    { id: 'player_celebrate', rect: { left: 525, top: 330, width: 38, height: 50 } },
    { id: 'player_tired', rect: { left: 680, top: 330, width: 38, height: 50 } },
    { id: 'player_sad', rect: { left: 850, top: 330, width: 38, height: 50 } },

    // Staff
    { id: 'staff_assistant_1', rect: { left: 32, top: 525, width: 62, height: 75 } },
    { id: 'staff_cook_1', rect: { left: 152, top: 525, width: 62, height: 75 } },
    { id: 'staff_manager_1', rect: { left: 268, top: 525, width: 62, height: 75 } },
    { id: 'staff_supplier', rect: { left: 380, top: 525, width: 95, height: 75 } },

    // 12 Customers
    { id: 'cust_student_school', rect: { left: 522, top: 525, width: 55, height: 68 } },
    { id: 'cust_student_uni', rect: { left: 608, top: 525, width: 55, height: 68 } },
    { id: 'cust_office_worker', rect: { left: 698, top: 525, width: 55, height: 68 } },
    { id: 'cust_factory_worker', rect: { left: 785, top: 525, width: 55, height: 68 } },
    { id: 'cust_elderly_citizen', rect: { left: 855, top: 525, width: 55, height: 68 } },
    { id: 'cust_neighborhood_auntie', rect: { left: 932, top: 525, width: 55, height: 68 } },
    { id: 'cust_foreign_tourist', rect: { left: 522, top: 615, width: 55, height: 65 } },
    { id: 'cust_food_critic', rect: { left: 608, top: 615, width: 55, height: 65 } },
    { id: 'cust_loyal_office_lady', rect: { left: 698, top: 615, width: 55, height: 65 } },
    { id: 'cust_family_with_kids', rect: { left: 775, top: 615, width: 65, height: 65 } },
    { id: 'cust_delivery_driver', rect: { left: 852, top: 615, width: 62, height: 65 } },
    { id: 'cust_celebrity_vip', rect: { left: 935, top: 615, width: 52, height: 65 } },
  ];

  for (const char of characters) {
    await cropAndTransparent(CHAR_SHEET, `public/assets/characters/${char.id}.png`, char.rect, 38);
  }

  // 4. EXTRACT PROPS (Plastic Stool, Folding Table, Planter)
  console.log('4. Extracting Props...');
  // Red plastic stool from location 1
  await cropAndTransparent(LOC_SHEET, 'public/assets/props/plastic_stool_red.png', { left: 148, top: 326, width: 22, height: 26 }, 30);
  await cropAndTransparent(LOC_SHEET, 'public/assets/props/plastic_stool_blue.png', { left: 168, top: 326, width: 22, height: 26 }, 30);
  await cropAndTransparent(LOC_SHEET, 'public/assets/props/dining_table.png', { left: 155, top: 308, width: 44, height: 38 }, 30);

  console.log('All individual assets successfully extracted to public/assets/!');
}

run().catch((err) => {
  console.error('Error extracting assets:', err);
  process.exit(1);
});

