import { Ingredient } from '../types/game';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  // MEAT
  {
    id: 'pork',
    name: 'Thịt heo xá xíu / chả',
    unit: 'phần',
    costPerUnit: 5000,
    category: 'MEAT',
    shelfLifeDays: 2,
    icon: '🥩',
    supplierName: 'Chị Ba Thịt Tươi'
  },
  {
    id: 'beef',
    name: 'Thịt bò tươi phi lê',
    unit: 'phần',
    costPerUnit: 12000,
    category: 'MEAT',
    shelfLifeDays: 2,
    icon: '🥓',
    supplierName: 'Lò Mổ Anh Bảy'
  },
  {
    id: 'chicken_skewer',
    name: 'Thịt xiên ướp sả',
    unit: 'xiên',
    costPerUnit: 4000,
    category: 'MEAT',
    shelfLifeDays: 2,
    icon: '🍢',
    supplierName: 'Chị Ba Thịt Tươi'
  },
  {
    id: 'fish_ball',
    name: 'Cá viên / bò viên',
    unit: 'xâu',
    costPerUnit: 3500,
    category: 'MEAT',
    shelfLifeDays: 3,
    icon: '🍡',
    supplierName: 'Đại Lý Viên Chiên Chợ Lớn'
  },
  {
    id: 'fermented_pork',
    name: 'Nem chua tẩm bột',
    unit: 'chiếc',
    costPerUnit: 4500,
    category: 'MEAT',
    shelfLifeDays: 3,
    icon: '🍖',
    supplierName: 'Nem Phố Cổ'
  },
  {
    id: 'egg_quail',
    name: 'Trứng cút / trứng gà',
    unit: 'quả',
    costPerUnit: 1500,
    category: 'MEAT',
    shelfLifeDays: 5,
    icon: '🥚',
    supplierName: 'Trại Trứng Cô Tư'
  },

  // DRY & CARB
  {
    id: 'bread',
    name: 'Bánh mì giòn rụm',
    unit: 'ổ',
    costPerUnit: 2500,
    category: 'DRY',
    shelfLifeDays: 1,
    icon: '🥖',
    supplierName: 'Lò Bánh Mì Chú Tám'
  },
  {
    id: 'sticky_rice',
    name: 'Gạo nếp cái hoa vàng',
    unit: 'phần',
    costPerUnit: 3000,
    category: 'DRY',
    shelfLifeDays: 7,
    icon: '🍚',
    supplierName: 'Vựa Gạo Miền Tây'
  },
  {
    id: 'pho_noodles',
    name: 'Bánh phở tươi tráng tay',
    unit: 'bát',
    costPerUnit: 5000,
    category: 'DRY',
    shelfLifeDays: 2,
    icon: '🍜',
    supplierName: 'Lò Bánh Phở Cổ Truyền'
  },
  {
    id: 'bun_noodles',
    name: 'Bún tươi sợi nhỏ',
    unit: 'đĩa',
    costPerUnit: 3500,
    category: 'DRY',
    shelfLifeDays: 2,
    icon: '🍝',
    supplierName: 'Lò Bún Phú Đô'
  },
  {
    id: 'rice_paper',
    name: 'Bánh tráng phơi sương',
    unit: 'gói',
    costPerUnit: 2000,
    category: 'DRY',
    shelfLifeDays: 15,
    icon: '🫓',
    supplierName: 'Bánh Tráng Tây Ninh'
  },
  {
    id: 'bao_bun',
    name: 'Vỏ bánh bao bột mì',
    unit: 'cái',
    costPerUnit: 3000,
    category: 'DRY',
    shelfLifeDays: 3,
    icon: '🥟',
    supplierName: 'Lò Bánh Chú Hào'
  },
  {
    id: 'potatoes',
    name: 'Khoai tây củ to',
    unit: 'củ',
    costPerUnit: 2500,
    category: 'DRY',
    shelfLifeDays: 7,
    icon: '🥔',
    supplierName: 'Vựa Rau Củ Đà Lạt'
  },
  {
    id: 'sweet_corn',
    name: 'Bắp nếp ngọt',
    unit: 'bắp',
    costPerUnit: 3000,
    category: 'DRY',
    shelfLifeDays: 4,
    icon: '🌽',
    supplierName: 'Vựa Nông Sản Đồng Tháp'
  },

  // VEGGIES & HERBS
  {
    id: 'herbs_cucumber',
    name: 'Rau dưa, ngò gai & ớt',
    unit: 'bó',
    costPerUnit: 1500,
    category: 'VEGGIE',
    shelfLifeDays: 2,
    icon: '🥒',
    supplierName: 'Sạp Rau Mối Cô Mai'
  },
  {
    id: 'scallion_oil',
    name: 'Mỡ hành & hành phi giòn',
    unit: 'hũ',
    costPerUnit: 1500,
    category: 'SEASONING',
    shelfLifeDays: 5,
    icon: '🧅',
    supplierName: 'Sạp Gia Vị Chợ Quê'
  },

  // DRINKS & DESSERT BASE
  {
    id: 'sugarcane',
    name: 'Mía tươi gọt sạch',
    unit: 'cây',
    costPerUnit: 2000,
    category: 'DRINK_BASE',
    shelfLifeDays: 3,
    icon: '🎍',
    supplierName: 'Vựa Mía Miền Tây'
  },
  {
    id: 'tea_leaves',
    name: 'Trà Thái Nguyên ướp hoa',
    unit: 'ấm',
    costPerUnit: 1000,
    category: 'DRINK_BASE',
    shelfLifeDays: 30,
    icon: '🍃',
    supplierName: 'Trà Sạch Tân Cương'
  },
  {
    id: 'coffee_beans',
    name: 'Cà phê Robusta Đắk Lắk',
    unit: 'phin',
    costPerUnit: 3000,
    category: 'DRINK_BASE',
    shelfLifeDays: 30,
    icon: '☕',
    supplierName: 'Kho Cà Phê Ban Mê'
  },
  {
    id: 'condensed_milk',
    name: 'Sữa đặc Ông Thọ',
    unit: 'lon',
    costPerUnit: 2000,
    category: 'DRINK_BASE',
    shelfLifeDays: 20,
    icon: '🥛',
    supplierName: 'Cửa Hàng Tạp Hóa Bà Bảy'
  },
  {
    id: 'kumquat_chia',
    name: 'Tắc tươi & hạt chia',
    unit: 'phần',
    costPerUnit: 1500,
    category: 'DRINK_BASE',
    shelfLifeDays: 4,
    icon: '🍊',
    supplierName: 'Sạp Trái Cây Miệt Vườn'
  },
  {
    id: 'red_beans_lotus',
    name: 'Đậu đỏ & hạt sen bùi',
    unit: 'hộp',
    costPerUnit: 3000,
    category: 'DRINK_BASE',
    shelfLifeDays: 10,
    icon: '🫘',
    supplierName: 'Đại Lý Đậu Nông Sản'
  },
  {
    id: 'soy_milk_base',
    name: 'Đậu nành & lá dứa thơm',
    unit: 'chai',
    costPerUnit: 2000,
    category: 'DRINK_BASE',
    shelfLifeDays: 3,
    icon: '🫗',
    supplierName: 'Lò Nấu Sữa Đậu Chú Năm'
  },
  {
    id: 'fresh_coconut',
    name: 'Dừa xiêm Bến Tre',
    unit: 'trái',
    costPerUnit: 7000,
    category: 'DRINK_BASE',
    shelfLifeDays: 5,
    icon: '🥥',
    supplierName: 'Đại Lý Dừa Bến Tre'
  },
  {
    id: 'jelly_topping',
    name: 'Thạch sương sáo & nước cốt dừa',
    unit: 'phần',
    costPerUnit: 2500,
    category: 'DRINK_BASE',
    shelfLifeDays: 3,
    icon: '🍧',
    supplierName: 'Sạp Chè Cô Út'
  }
];

export const INGREDIENT_MAP: Record<string, Ingredient> = INITIAL_INGREDIENTS.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {} as Record<string, Ingredient>);

