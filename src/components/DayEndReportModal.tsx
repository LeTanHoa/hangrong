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
      className="fixed inset-0 z-[60] flex items-center justify-center p-1.5 sm:p-3 bg-black/85 backdrop-blur-md animate-fadeIn"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-2xl h-[92vh] sm:h-[84vh] bg-slate-950 border border-orange-500/50 rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header Banner - Slim & Festive */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 px-3 py-2 sm:px-4 text-white flex items-center justify-between shrink-0 shadow">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🎉</span>
            <div>
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-200">
                <Calendar className="w-3 h-3" />
                <span>KẾT THÚC NGÀY KINH DOANH</span>
              </div>
              <h2 className="text-xs sm:text-sm font-black text-white">BÁO CÁO TÀI CHÍNH NGÀY {latestRecord.day}</h2>
            </div>
          </div>

          <span className="text-xs font-black text-slate-950 bg-amber-300 px-2 py-0.5 rounded-full">
            N.{latestRecord.day} HOÀN THÀNH
          </span>
        </div>

        {/* 2-Column Landscape Split Body */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* CỘT TRÁI (52%): CHI TIẾT DOANH THU & LỢI NHUẬN (P&L) */}
          <div className="col-span-6 sm:col-span-7 p-2.5 sm:p-3 border-r border-slate-800 bg-slate-900/40 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800/90 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Doanh thu bán hàng</span>
                <span className="font-bold text-white">{formatVND(latestRecord.revenue)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Giá vốn nguyên liệu chế biến</span>
                <span className="font-medium text-rose-400">-{formatVND(latestRecord.cogs)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Tiền thuê mặt bằng</span>
                <span className="font-medium text-rose-400">-{formatVND(latestRecord.rent)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Tiền lương trả nhân viên</span>
                <span className="font-medium text-rose-400">-{formatVND(latestRecord.wages)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-extrabold text-xs sm:text-sm">
                <span className="text-white">Lợi Nhuận Thuần</span>
                <span className={isProfitable ? 'text-emerald-400 text-sm sm:text-base' : 'text-rose-400 text-sm sm:text-base'}>
                  {isProfitable ? '+' : ''}
                  {formatVND(latestRecord.netProfit)}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 mt-2">
              💡 <strong>Lời khuyên kinh doanh:</strong> Cân bằng giá vốn nguyên liệu và mở rộng mặt bằng để tăng tốc độ tích lũy vốn!
            </div>
          </div>

          {/* CỘT PHẢI (48%): CHỈ SỐ VẬN HÀNH & NÚT BẮT ĐẦU NGÀY MỚI */}
          <div className="col-span-6 sm:col-span-5 p-2.5 sm:p-3 flex flex-col justify-between bg-slate-950">
            {/* Operational Metrics Cards */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Chỉ Số Hoạt Động
              </div>

              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center">
                  <Users className="w-3.5 h-3.5 text-cyan-400 mb-0.5" />
                  <span className="text-[9px] text-slate-400">Phục vụ</span>
                  <span className="font-black text-xs text-white">{latestRecord.customersServed} khách</span>
                </div>

                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center">
                  <Star className="w-3.5 h-3.5 text-amber-400 mb-0.5 fill-amber-400" />
                  <span className="text-[9px] text-slate-400">Đánh giá</span>
                  <span className="font-black text-xs text-white">{latestRecord.averageRating} ★</span>
                </div>

                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center">
                  <Award className="w-3.5 h-3.5 text-orange-400 mb-0.5" />
                  <span className="text-[9px] text-slate-400">Món Hot</span>
                  <span className="font-black text-[11px] text-white truncate max-w-[60px]">
                    {bestSeller?.icon} {bestSeller?.name.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Day Big Thumb Button */}
            <button
              onClick={() => {
                sounds.playClick();
                store.startNextDay();
              }}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-950/60 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <span>BẮT ĐẦU NGÀY TIẾP THEO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

