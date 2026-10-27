import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { Sparkles, ChevronRight, X } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    step: 0,
    title: 'Bước 1: Chào Mừng Đến Với Hàng Rong!',
    desc: 'Bạn là Bé Hàng Rong, khởi nghiệp với đôi quang gánh tre nhỏ trên vỉa hè phố thị. Hãy cùng xây dựng đế chế ẩm thực đường phố!',
    actionText: 'Tiếp Tục',
  },
  {
    step: 1,
    title: 'Bước 2: Mua Nguyên Liệu Tại Chợ',
    desc: 'Hãy bấm nút "Điện Thoại" góc trên hoặc nút "Chợ Đầu Mối" để mua bánh mì, thịt xá xíu và rau dưa từ tiểu thương.',
    actionText: 'Đã Hiểu',
  },
  {
    step: 2,
    title: 'Bước 3: Chọn Món Ăn Đầu Tiên',
    desc: 'Quán của bạn đã có sẵn công thức Bánh Mì Thịt và Xôi Xéo! Khi khách gọi, hãy kiểm tra danh sách đơn hàng góc dưới màn hình.',
    actionText: 'Tiếp Tục',
  },
  {
    step: 3,
    title: 'Bước 4: Chế Biến Món Ăn',
    desc: 'Bấm nút "Nấu Ngay" trên đơn hàng hoặc click trực tiếp vào xe hàng / bấm phím E để mở Bếp Nấu!',
    actionText: 'Thử Nấu',
  },
  {
    step: 4,
    title: 'Bước 5: Thao Tác Chế Biến',
    desc: 'Chờ thanh nấu chạy vào vùng vàng và bấm "RA MÓN NGAY" để nhận điểm Đôi Tay Vàng (+35% XP)!',
    actionText: 'Tiếp Theo',
  },
  {
    step: 5,
    title: 'Bước 6: Giao Món Cho Khách',
    desc: 'Khi món ăn đã sẵn sàng (⭐ SẴN SÀNG), bấm "Giao Món" để thu tiền và nhận tiền Tip từ thực khách!',
    actionText: 'Rất Dễ',
  },
  {
    step: 6,
    title: 'Bước 7: Theo Dõi Sổ Thu Chi',
    desc: 'Mở Điện Thoại > Sổ Thu Chi để xem doanh thu, giá vốn và lợi nhuận thực tế theo thời gian thực.',
    actionText: 'Xem Tiếp',
  },
  {
    step: 7,
    title: 'Bước 8: Nâng Cấp Xe Hàng',
    desc: 'Tích lũy tiền để lên đời Xe Đẩy Gỗ Bánh Mì (T2), Xe Inox Mái Bạt (T3) và Food Truck để tăng gấp đôi sức chứa!',
    actionText: 'Tuyệt Vời',
  },
  {
    step: 8,
    title: 'Bước 9: Mở Khóa Món Mới',
    desc: 'Học thêm 20 món ăn truyền thống: Phở Bò, Bánh Tráng Trộn, Trà Tắc, Nem Chua Rán... để thu hút khách VIP!',
    actionText: 'Sẵn Sàng',
  },
  {
    step: 9,
    title: 'Bước 10: Hoàn Thành Ngày Kinh Doanh',
    desc: 'Mỗi ngày có chu kỳ Sáng -> Trưa -> Chiều -> Tối. Khi hết ngày, báo cáo tài chính sẽ tổng kết lãi lỗ cho bạn. Chúc bạn buôn may bán đắt!',
    actionText: 'Bắt Đầu Ngay!',
  },
];

export const TutorialOverlay: React.FC = () => {
  const store = useGameStore();

  if (store.tutorialCompleted || store.tutorialStep >= TUTORIAL_STEPS.length) {
    return null;
  }

  const currentInfo = TUTORIAL_STEPS[store.tutorialStep] || TUTORIAL_STEPS[0];

  return (
    <div className="fixed bottom-24 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-sm z-40 animate-fadeIn select-none pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-orange-500/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-black text-white flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-orange-400 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>HƯỚNG DẪN KHỞI NGHIỆP ({store.tutorialStep + 1}/10)</span>
          </div>

          <button
            onClick={() => store.skipTutorial()}
            className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-0.5 rounded hover:bg-slate-800 transition"
          >
            Bỏ qua
          </button>
        </div>

        <div>
          <h4 className="font-extrabold text-sm sm:text-base text-yellow-300">
            {currentInfo.title}
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentInfo.desc}</p>
        </div>

        <button
          onClick={() => store.advanceTutorial()}
          className="self-end flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95"
        >
          <span>{currentInfo.actionText}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

