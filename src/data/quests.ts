import { Quest, Achievement } from '../types/game';

export const INITIAL_QUESTS: Quest[] = [
  // Chapter 1: Khởi nghiệp
  {
    id: 'ch1_first_customer',
    title: 'Vị khách đầu tiên',
    description: 'Phục vụ thành công 3 khách hàng đầu tiên trong ngày khai trương.',
    type: 'CHAPTER',
    targetType: 'SERVE_CUSTOMERS',
    targetValue: 3,
    currentValue: 0,
    rewardMoney: 20000,
    rewardXP: 30,
    rewardBadge: '🎖️ Khai Trương Hồng Phát',
    completed: false,
    claimed: false,
  },
  {
    id: 'ch1_earn_50k',
    title: 'Kiếm 50.000đ đầu tiên',
    description: 'Bán các món ăn nóng hổi và đạt doanh thu 50.000đ.',
    type: 'CHAPTER',
    targetType: 'EARN_MONEY',
    targetValue: 50000,
    currentValue: 0,
    rewardMoney: 30000,
    rewardXP: 50,
    completed: false,
    claimed: false,
  },
  {
    id: 'ch1_cook_banhmi',
    title: 'Bậc thầy Bánh Mì',
    description: 'Chế biến và phục vụ 5 ổ Bánh Mì Thịt.',
    type: 'CHAPTER',
    targetType: 'COOK_RECIPE',
    targetRecipeId: 'banh_mi_thit',
    targetValue: 5,
    currentValue: 0,
    rewardMoney: 25000,
    rewardXP: 45,
    completed: false,
    claimed: false,
  },
  // Daily Quests
  {
    id: 'daily_serve_10',
    title: 'Ngày làm việc chăm chỉ',
    description: 'Phục vụ thành công 10 thực khách trong ngày.',
    type: 'DAILY',
    targetType: 'SERVE_CUSTOMERS',
    targetValue: 10,
    currentValue: 0,
    rewardMoney: 35000,
    rewardXP: 40,
    completed: false,
    claimed: false,
  },
  {
    id: 'daily_earn_100k',
    title: 'Chỉ tiêu ngày: 100k',
    description: 'Đạt doanh thu 100.000đ trong ngày.',
    type: 'DAILY',
    targetType: 'EARN_MONEY',
    targetValue: 100000,
    currentValue: 0,
    rewardMoney: 40000,
    rewardXP: 60,
    completed: false,
    claimed: false,
  },
  // Milestones
  {
    id: 'milestone_upgrade_cart_2',
    title: 'Lên đời Xe Đẩy Gỗ',
    description: 'Nâng cấp từ Gánh Hàng Rong lên Xe Đẩy Gỗ Bánh Mì.',
    type: 'MILESTONE',
    targetType: 'UPGRADE_CART',
    targetValue: 2,
    currentValue: 1,
    rewardMoney: 50000,
    rewardXP: 100,
    rewardBadge: '🚚 Bác Tài Vỉa Hè',
    completed: false,
    claimed: false,
  },
  {
    id: 'milestone_rating_45',
    title: 'Thương hiệu 4.5 Sao',
    description: 'Đạt điểm uy tín danh tiếng từ 4.5 sao trở lên.',
    type: 'MILESTONE',
    targetType: 'REACH_RATING',
    targetValue: 4.5,
    currentValue: 3.5,
    rewardMoney: 80000,
    rewardXP: 150,
    rewardBadge: '⭐ Quán Ruột Của Phố',
    completed: false,
    claimed: false,
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_sale',
    title: 'Mở Hàng May Mắn',
    description: 'Hoàn thành đơn hàng đầu tiên trong đời.',
    icon: '🧧',
    achieved: false
  },
  {
    id: 'ach_master_chef',
    title: 'Đôi Tay Vàng Đầu Bếp',
    description: 'Nấu thành công 25 món ăn các loại.',
    icon: '🍳',
    achieved: false
  },
  {
    id: 'ach_millionaire',
    title: 'Triệu Phú Vỉa Hè',
    description: 'Tích lũy tổng tài sản đạt 1.000.000đ.',
    icon: '💰',
    achieved: false
  },
  {
    id: 'ach_vip_favorite',
    title: 'Lọt Mắt Xanh Tiktoker',
    description: 'Phục vụ thành công khách hàng VIP có review 5 sao.',
    icon: '🌟',
    achieved: false
  },
  {
    id: 'ach_all_recipes',
    title: 'Bách Khoa Toàn Thư Món Ngon',
    description: 'Mở khóa tất cả 20 món ăn truyền thống Việt Nam.',
    icon: '📖',
    achieved: false
  }
];

