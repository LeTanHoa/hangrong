import { INGREDIENT_MAP } from './ingredients';

export interface SupermarketProduct {
  id: string;
  name: string;
  categoryName: string;
  icon: string;
  unit: string;
  unitPrice: number;
  originalPrice: number;
  tag?: string;
  description: string;
}

export interface SupermarketShelfDef {
  id: string;
  name: string;
  vietnameseTitle: string;
  icon: string;
  bannerColor: string;
  accentColor: string;
  badgeBg: string;
  shelfTagline: string;
  // Spatial coordinates inside the 2D supermarket canvas (world space 1200 x 800)
  x: number;
  y: number;
  width: number;
  height: number;
  productIds: string[];
}

export const SUPERMARKET_SHELVES: SupermarketShelfDef[] = [
  {
    id: 'shelf_produce',
    name: 'Kệ Nông Sản & Rau Củ VietGAP',
    vietnameseTitle: 'NÔNG SẢN VIETGAP ĐÀ LẠT',
    icon: '🥬',
    bannerColor: '#16a34a',
    accentColor: '#4ade80',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    shelfTagline: 'Rau xanh, củ quả sạch đạt chuẩn an toàn vệ sinh thực phẩm',
    x: 210,
    y: 280,
    width: 200,
    height: 150,
    productIds: ['herbs_cucumber', 'potatoes', 'sweet_corn', 'scallion_oil'],
  },
  {
    id: 'shelf_meat',
    name: 'Kệ Thịt Tươi & Thực Phẩm Sạch',
    vietnameseTitle: 'THỊT TƯƠI SẠCH CO.OP FOOD',
    icon: '🥩',
    bannerColor: '#dc2626',
    accentColor: '#f87171',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    shelfTagline: 'Thịt tươi nhập mới mỗi sáng, bảo quản lạnh tiêu chuẩn HACCP',
    x: 480,
    y: 280,
    width: 200,
    height: 150,
    productIds: ['pork', 'beef', 'chicken_skewer', 'fish_ball', 'fermented_pork', 'egg_quail'],
  },
  {
    id: 'shelf_bakery',
    name: 'Kệ Bánh Mì & Ngũ Cốc Bột',
    vietnameseTitle: 'LÒ BÁNH MÌ CO.OP BAKERY',
    icon: '🥖',
    bannerColor: '#d97706',
    accentColor: '#fbbf24',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    shelfTagline: 'Bánh mì giòn rụm ra lò liên tục, các loại gạo nếp thơm phức',
    x: 750,
    y: 280,
    width: 200,
    height: 150,
    productIds: ['bread', 'sticky_rice', 'bao_bun', 'rice_paper', 'pho_noodles', 'bun_noodles'],
  },
  {
    id: 'shelf_drinks',
    name: 'Kệ Sữa, Cà Phê & Đồ Uống',
    vietnameseTitle: 'SỮA & NƯỚC GIẢI KHÁT',
    icon: '🧃',
    bannerColor: '#0284c7',
    accentColor: '#38bdf8',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    shelfTagline: 'Sữa đặc béo thơm, trà lài, cà phê nguyên chất đóng hộp tiện lợi',
    x: 1020,
    y: 280,
    width: 200,
    height: 150,
    productIds: [
      'condensed_milk',
      'tea_leaves',
      'coffee_beans',
      'soy_milk_base',
      'fresh_coconut',
      'sugarcane',
      'kumquat_chia',
      'red_beans_lotus',
      'jelly_topping',
    ],
  },
];

// Helper to get formatted product data with supermarket discounts
export const getSupermarketProductsForShelf = (shelf: SupermarketShelfDef): SupermarketProduct[] => {
  return shelf.productIds
    .map((id) => {
      const ing = INGREDIENT_MAP[id];
      if (!ing) return null;
      // Supermarket wholesale prices are ~5-8% discounted compared to street market
      const discountedPrice = Math.max(1000, Math.round((ing.costPerUnit * 0.94) / 100) * 100);
      return {
        id: ing.id,
        name: ing.name,
        categoryName: ing.category,
        icon: ing.icon,
        unit: ing.unit,
        unitPrice: discountedPrice,
        originalPrice: ing.costPerUnit,
        tag: 'Ưu Đãi Co.opmart',
        description: `Nguyên liệu chuẩn chất lượng cho xe hàng bánh mì`,
      };
    })
    .filter(Boolean) as SupermarketProduct[];
};

