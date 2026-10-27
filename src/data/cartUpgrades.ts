import { CartUpgrade, EquipmentUpgrade } from '../types/game';

export const CART_UPGRADES: CartUpgrade[] = [
  {
    id: 'cart_tier_1',
    tier: 1,
    name: 'Gánh Hàng Rong Tre',
    description: 'Đôi quang gánh tre đan truyền thống mộc mạc, khởi đầu từ hai bàn tay trắng.',
    cost: 0,
    requiredLevel: 1,
    maxCapacityBonus: 0,
    prepSpeedMultiplier: 1.0,
    prestigeBonus: 0,
    spriteKey: 'cart_tier_1'
  },
  {
    id: 'cart_tier_2',
    tier: 2,
    name: 'Xe Đẩy Gỗ Bánh Mì',
    description: 'Chiếc xe đẩy khung gỗ có tủ kính che bụi và bánh xe di chuyển linh hoạt.',
    cost: 65000,
    requiredLevel: 2,
    maxCapacityBonus: 15,
    prepSpeedMultiplier: 1.15,
    prestigeBonus: 0.3,
    spriteKey: 'cart_tier_2'
  },
  {
    id: 'cart_tier_3',
    tier: 3,
    name: 'Xe Inox Mái Bạt Che Mưa',
    description: 'Khung inox sáng bóng, mái bạt che mưa nắng, có bếp gas mini và đèn led ấm áp.',
    cost: 180000,
    requiredLevel: 3,
    maxCapacityBonus: 35,
    prepSpeedMultiplier: 1.3,
    prestigeBonus: 0.6,
    spriteKey: 'cart_tier_3'
  },
  {
    id: 'cart_tier_4',
    tier: 4,
    name: 'Xe Bán Tải Street Food Hiện Đại',
    description: 'Food Truck phong cách retro cực chill, trang bị bếp chiên nướng đa năng và loa gọi khách.',
    cost: 580000,
    requiredLevel: 5,
    maxCapacityBonus: 70,
    prepSpeedMultiplier: 1.55,
    prestigeBonus: 1.2,
    spriteKey: 'cart_tier_4'
  },
  {
    id: 'cart_tier_5',
    tier: 5,
    name: 'Kiosk Ẩm Thực Đế Chế Phố',
    description: 'Gian hàng ẩm thực chuẩn thương hiệu chuỗi, bảng hiệu led nổi bật và quầy bar tự phục vụ.',
    cost: 1600000,
    requiredLevel: 7,
    maxCapacityBonus: 120,
    prepSpeedMultiplier: 1.9,
    prestigeBonus: 2.0,
    spriteKey: 'cart_tier_5'
  }
];

export const EQUIPMENT_UPGRADES: EquipmentUpgrade[] = [
  {
    id: 'stove_upgrade',
    name: 'Bếp Ga Đôi Lửa Xanh',
    category: 'STOVE',
    level: 1,
    maxLevel: 5,
    cost: 30000,
    requiredLevel: 1,
    effectDescription: 'Tăng nhiệt lượng lửa, giảm 15% thời gian nấu mỗi cấp.',
    prepTimeReduction: 0.15,
    shelfLifeBonus: 0,
    capacityBonus: 0,
    customerFlowBonus: 0
  },
  {
    id: 'fridge_upgrade',
    name: 'Thùng Xốp Ướp Đá Tươi Mát',
    category: 'FRIDGE',
    level: 1,
    maxLevel: 5,
    cost: 25000,
    requiredLevel: 1,
    effectDescription: 'Bảo quản nguyên liệu tươi lâu hơn, giảm hao hụt cuối ngày.',
    prepTimeReduction: 0,
    shelfLifeBonus: 2,
    capacityBonus: 5,
    customerFlowBonus: 0
  },
  {
    id: 'counter_upgrade',
    name: 'Bàn Inox Thao Tác Nhanh',
    category: 'COUNTER',
    level: 1,
    maxLevel: 5,
    cost: 40000,
    requiredLevel: 2,
    effectDescription: 'Bàn chế biến rộng rãi, tăng sức chứa kho thêm 15 đơn vị.',
    prepTimeReduction: 0.05,
    shelfLifeBonus: 0,
    capacityBonus: 15,
    customerFlowBonus: 0
  },
  {
    id: 'signboard_upgrade',
    name: 'Biển Hiệu Vẽ Tay Đèn Led',
    category: 'SIGNBOARD',
    level: 1,
    maxLevel: 5,
    cost: 35000,
    requiredLevel: 2,
    effectDescription: 'Bảng hiệu bắt mắt thu hút thêm 20% lượt khách vãng lai mỗi cấp.',
    prepTimeReduction: 0,
    shelfLifeBonus: 0,
    capacityBonus: 0,
    customerFlowBonus: 0.2
  }
];

