import { CustomerType } from '../types/game';

export const CUSTOMER_TYPES: CustomerType[] = [
  {
    id: 'student_school',
    name: 'Bé Học Sinh Khăn Quàng Đỏ',
    title: 'Học sinh',
    description: 'Thích đồ ăn vặt rẻ, mê bánh tráng trộn, ăn vội trước giờ trống trường.',
    spriteColor: 0xffcc80, // skin
    shirtColor: 0xffffff, // white uniform shirt
    hairColor: 0x212121,
    accessory: 'backpack',
    budgetMultiplier: 0.8,
    patienceSeconds: 22,
    speed: 70,
    favoriteFoods: ['banh_trang_tron', 'tra_tac_chia', 'banh_mi_thit', 'khoai_tay_loc_xoay'],
    tipChance: 0.05,
  },
  {
    id: 'student_uni',
    name: 'Bạn Sinh Viên Đại Học',
    title: 'Sinh viên',
    description: 'Săn món ngon bổ rẻ, uống trà đá chém gió cùng bạn bè sau giờ giảng đường.',
    spriteColor: 0xffcc80,
    shirtColor: 0x3b82f6, // blue hoodie
    hairColor: 0x3e2723,
    accessory: 'glasses',
    budgetMultiplier: 1.0,
    patienceSeconds: 26,
    speed: 65,
    favoriteFoods: ['banh_mi_thit', 'tra_da', 'ca_vien_chien', 'nem_chua_ran'],
    tipChance: 0.1,
  },
  {
    id: 'office_worker',
    name: 'Anh Nhân Viên Văn Phòng',
    title: 'Dân công sở',
    description: 'Bận rộn dự án, cần bữa sáng nhanh gọn và ly cà phê sữa đá đậm đà tỉnh táo.',
    spriteColor: 0xffcc80,
    shirtColor: 0x93c5fd, // light blue office shirt
    hairColor: 0x1f2937,
    accessory: 'tie',
    budgetMultiplier: 1.5,
    patienceSeconds: 18, // inpatient
    speed: 80,
    favoriteFoods: ['banh_mi_thit', 'ca_phe_sua', 'pho_bo', 'bun_thit_nuong'],
    tipChance: 0.25,
  },
  {
    id: 'factory_worker',
    name: 'Bác Công Nhân Khu Chế Xuất',
    title: 'Công nhân',
    description: 'Cần suất ăn no nê chắc bụng như xôi xéo mỡ hành hoặc bánh bao nhiều thịt.',
    spriteColor: 0xd7ccc8,
    shirtColor: 0x0284c7, // worker uniform
    hairColor: 0x424242,
    accessory: 'helmet',
    budgetMultiplier: 1.1,
    patienceSeconds: 28,
    speed: 60,
    favoriteFoods: ['xoi_xeo', 'banh_bao', 'nuoc_mia', 'tra_da'],
    tipChance: 0.1,
  },
  {
    id: 'elderly_citizen',
    name: 'Cụ Ông Tập Dưỡng Sinh',
    title: 'Người cao tuổi',
    description: 'Đi bộ buổi sớm, thích ngồi thong thả nhâm nhi trà nóng và ăn bánh cuốn mềm thanh.',
    spriteColor: 0xffe0b2,
    shirtColor: 0xfef08a, // soft beige
    hairColor: 0xe0e0e0, // grey/white hair
    accessory: 'hat',
    budgetMultiplier: 1.0,
    patienceSeconds: 35, // very patient
    speed: 45,
    favoriteFoods: ['tra_da', 'banh_cuon', 'sua_dau_nanh', 'xoi_xeo'],
    tipChance: 0.15,
  },
  {
    id: 'neighborhood_auntie',
    name: 'Cô Hàng Xóm Thân Thiện',
    title: 'Người địa phương',
    description: 'Khách quen đầu ngõ, thích hỏi han trò chuyện và mua đồ ăn cho cả nhà.',
    spriteColor: 0xffcc80,
    shirtColor: 0xf472b6, // floral pink
    hairColor: 0x263238,
    accessory: 'hat',
    budgetMultiplier: 1.2,
    patienceSeconds: 30,
    speed: 55,
    favoriteFoods: ['banh_cuon', 'che_dau_do', 'nuoc_mia', 'banh_mi_thit'],
    tipChance: 0.2,
  },
  {
    id: 'foreign_tourist',
    name: 'Khách Du Lịch Ba Lô (Tây Balo)',
    title: 'Khách Tây',
    description: 'Mê mẩn ẩm thực đường phố Việt Nam, thích chụp ảnh check-in và hào phóng tip.',
    spriteColor: 0xffebee,
    shirtColor: 0x10b981, // tourist green
    hairColor: 0xf59e0b, // blond hair
    accessory: 'backpack',
    budgetMultiplier: 2.2,
    patienceSeconds: 24,
    speed: 65,
    favoriteFoods: ['pho_bo', 'banh_mi_thit', 'nuoc_dua_tuoi', 'ca_phe_sua'],
    tipChance: 0.6,
  },
  {
    id: 'food_critic',
    name: 'Nhà Phê Bình Ẩm Thực Khó Tính',
    title: 'Chuyên gia ẩm thực',
    description: 'Săm soi từng cọng rau gia vị, chấm điểm khắt khe nhưng giúp tăng danh tiếng vùn vụt!',
    spriteColor: 0xffcc80,
    shirtColor: 0x475569, // charcoal jacket
    hairColor: 0x111827,
    accessory: 'glasses',
    budgetMultiplier: 2.0,
    patienceSeconds: 16, // impatient!
    speed: 70,
    favoriteFoods: ['pho_bo', 'bun_thit_nuong', 'banh_cuon', 'che_thap_cam'],
    tipChance: 0.4,
  },
  {
    id: 'loyal_office_lady',
    name: 'Chị Khách Quen Văn Phòng',
    title: 'Khách ruột',
    description: 'Ngày nào cũng ghé ủng hộ quán quen, gọi kèm cho đồng nghiệp và luôn đánh giá 5 sao.',
    spriteColor: 0xffcc80,
    shirtColor: 0xa855f7, // purple blouse
    hairColor: 0x374151,
    accessory: 'phone',
    budgetMultiplier: 1.6,
    patienceSeconds: 25,
    speed: 70,
    favoriteFoods: ['banh_mi_thit', 'tra_tac_chia', 'che_dau_do', 'bun_thit_nuong'],
    tipChance: 0.35,
  },
  {
    id: 'family_with_kids',
    name: 'Mẹ Dắt Bé Con Đi Chơi',
    title: 'Gia đình nhỏ',
    description: 'Bé con mê đồ chiên và nước mía ngọt ngào, mẹ cẩn thận nhắc nhở an toàn vệ sinh.',
    spriteColor: 0xffcc80,
    shirtColor: 0xfb7185, // rose red
    hairColor: 0x1e293b,
    accessory: 'hat',
    budgetMultiplier: 1.8,
    patienceSeconds: 25,
    speed: 50,
    favoriteFoods: ['ca_vien_chien', 'khoai_tay_loc_xoay', 'nuoc_mia', 'che_thap_cam'],
    tipChance: 0.25,
  },
  {
    id: 'delivery_driver',
    name: 'Anh Shipper Áo Xanh Công Nghệ',
    title: 'Tài xế công nghệ',
    description: 'Chạy xe cả ngày dưới nắng nóng, tấp vào lề làm vội ly trà đá và ổ bánh mì tiếp sức.',
    spriteColor: 0xffb74d,
    shirtColor: 0x059669, // Grab green shirt
    hairColor: 0x1f2937,
    accessory: 'helmet',
    budgetMultiplier: 1.0,
    patienceSeconds: 17, // very in a rush
    speed: 85,
    favoriteFoods: ['tra_da', 'banh_mi_thit', 'nuoc_mia', 'banh_bao'],
    tipChance: 0.1,
  },
  {
    id: 'celebrity_vip',
    name: 'Food Reviewer Triệu View (VIP)',
    title: 'Hot Tiktoker VIP',
    description: 'Vừa ăn vừa livestream khen nức nở, kéo theo cả đoàn fan tới ủng hộ nườm nượp!',
    spriteColor: 0xffcc80,
    shirtColor: 0xf59e0b, // trendy gold
    hairColor: 0xec4899, // dyed pink hair
    accessory: 'phone',
    budgetMultiplier: 3.5,
    patienceSeconds: 20,
    speed: 75,
    favoriteFoods: ['pho_bo', 'xien_que', 'banh_trang_tron', 'che_thap_cam'],
    tipChance: 0.8,
    isVip: true,
  }
];

export const CUSTOMER_MAP: Record<string, CustomerType> = CUSTOMER_TYPES.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {} as Record<string, CustomerType>);

