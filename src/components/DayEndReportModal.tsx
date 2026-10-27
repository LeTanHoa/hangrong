import React, { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { RECIPE_MAP } from '../data/recipes';
import { formatVND } from '../utils/formatters';
import { Calendar, TrendingUp, Star, Users, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/soundSystem';

export const DayEndReportModal: React.FC = () => {
  const store = useGameStore();
  const latestRecord = store.financialHistory[0];

  useEffect(() => {
    sounds.playLevelUp();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  if (!latestRecord) return null;

  const bestSeller = RECIPE_MAP[latestRecord.bestSellerRecipeId] || RECIPE_MAP['banh_mi_thit'];
  const isProfitable = latestRecord.netProfit >= 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-md max-h-[96dvh] sm:max-h-[90vh] bg-slate-900 border-2 border-orange-500/50 rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 sm:px-5 sm:py-4 text-white text-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-200">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>KẾT THÚC NGÀY KINH DOANH</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black mt-0.5">BÁO CÁO TÀI CHÍNH NGÀY {latestRecord.day}</h2>
        </div>

        {/* Financial P&L Breakdown */}
        <div className="p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm overflow-y-auto">
          <div className="flex flex-col gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-slate-300">
              <span>Doanh thu bán hàng</span>
              <span className="font-bold text-white">{formatVND(latestRecord.revenue)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Giá vốn nguyên liệu chế biến</span>
              <span className="font-medium text-rose-400">-{formatVND(latestRecord.cogs)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Tiền thuê mặt bằng</span>
              <span className="font-medium text-rose-400">-{formatVND(latestRecord.rent)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Tiền lương trả nhân viên</span>
              <span className="font-medium text-rose-400">-{formatVND(latestRecord.wages)}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-extrabold text-sm sm:text-base">
              <span className="text-white">Lợi Nhuận Thuần</span>
              <span className={isProfitable ? 'text-emerald-400 text-lg' : 'text-rose-400 text-lg'}>
                {isProfitable ? '+' : ''}
                {formatVND(latestRecord.netProfit)}
              </span>
            </div>
          </div>

          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-col items-center">
              <Users className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="text-[10px] text-slate-400">Đã phục vụ</span>
              <span className="font-black text-sm text-white">{latestRecord.customersServed} khách</span>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-col items-center">
              <Star className="w-4 h-4 text-amber-400 mb-1 fill-amber-400" />
              <span className="text-[10px] text-slate-400">Đánh giá</span>
              <span className="font-black text-sm text-white">{latestRecord.averageRating} ★</span>
            </div>

            <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex flex-col items-center">
              <Award className="w-4 h-4 text-orange-400 mb-1" />
              <span className="text-[10px] text-slate-400">Bán chạy nhất</span>
              <span className="font-black text-xs text-white truncate max-w-[80px]">
                {bestSeller?.icon} {bestSeller?.name.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Next Day Button */}
          <button
            onClick={() => store.startNextDay()}
            className="w-full py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-lg shadow-orange-950/60 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <span>BẮT ĐẦU NGÀY TIẾP THEO</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

