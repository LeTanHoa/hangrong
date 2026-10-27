import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { RECIPE_MAP } from '../data/recipes';
import { CUSTOMER_MAP } from '../data/customers';
import { formatVND } from '../utils/formatters';
import { ChefHat, CheckCircle2, X, ChevronDown, ChevronUp, Bell } from 'lucide-react';

export const OrderQueueHUD: React.FC = () => {
  const store = useGameStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (store.activeModal) return null;

  if (store.orders.length === 0) {
    return (
      <div className="absolute bottom-24 left-2 sm:bottom-3 sm:left-3 z-30 pointer-events-none select-none">
        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow text-slate-400 text-[11px] sm:text-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Đang đợi khách ghé quầy...</span>
        </div>
      </div>
    );
  }

  const hasReadyOrder = store.orders.some((o) => o.status === 'READY');

  // Mobile collapsed floating badge
  if (isCollapsed) {
    return (
      <div className="absolute bottom-24 left-2 sm:bottom-3 sm:left-3 z-30 pointer-events-auto">
        <button
          onClick={() => setIsCollapsed(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-md border shadow-xl text-white transition active:scale-95 ${
            hasReadyOrder
              ? 'bg-emerald-950/95 border-emerald-500/80 shadow-emerald-950/60 animate-pulse'
              : 'bg-slate-900/95 border-amber-500/60 shadow-black'
          }`}
        >
          <span className="text-base">🧾</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-white leading-tight">
              {store.orders.length} Đơn Chờ
            </span>
            <span className={`text-[10px] font-bold ${hasReadyOrder ? 'text-emerald-300' : 'text-amber-300'}`}>
              {hasReadyOrder ? '⭐ Có món sẵn sàng!' : 'Chạm để mở xem'}
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-400 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute bottom-24 left-2 sm:bottom-3 sm:left-3 z-30 max-w-[290px] sm:max-w-md w-full flex flex-col gap-1.5 pointer-events-none select-none">
      <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-300 px-1 pointer-events-auto">
        <span className="flex items-center gap-1">
          <span>ĐƠN CHỜ PHỤC VỤ ({store.orders.length}/{store.maxOrdersQueue})</span>
          {hasReadyOrder && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition flex items-center gap-0.5 text-[10px]"
          title="Thu gọn danh sách"
        >
          <span>Thu gọn</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-40 sm:max-h-52 pr-1 pointer-events-auto">
        {store.orders.map((order) => {
          const recipe = RECIPE_MAP[order.items[0]?.recipeId || 'banh_mi_thit'];
          const cust = CUSTOMER_MAP[order.customerTypeId];
          const progressRatio = Math.max(0, Math.min(1, order.remainingSeconds / order.maxWaitSeconds));
          const isReady = order.status === 'READY';

          // Color coded progress bar
          let barColor = 'bg-emerald-500';
          if (progressRatio < 0.3) barColor = 'bg-rose-500';
          else if (progressRatio < 0.6) barColor = 'bg-amber-500';

          return (
            <div
              key={order.id}
              className={`flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-xl backdrop-blur-md border shadow-lg transition-all ${
                isReady
                  ? 'bg-emerald-950/90 border-emerald-500/60 shadow-emerald-950/50'
                  : 'bg-slate-900/95 border-slate-700/80 shadow-slate-950/50'
              }`}
            >
              {/* Dish Icon & Info */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-800/90 border border-slate-600/50 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-inner">
                  {recipe?.icon || '🍲'}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-white truncate max-w-[100px] sm:max-w-none">
                      {order.items[0]?.quantity}x {recipe?.name || 'Món ăn'}
                    </span>
                    {cust?.isVip && (
                      <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded uppercase">
                        VIP
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
                    <span className="text-amber-300 font-semibold">{formatVND(order.totalPrice)}</span>
                    <span className="truncate max-w-[60px] sm:max-w-none">• {cust?.title || 'Khách'}</span>
                  </div>

                  {/* Patience timer bar */}
                  {!isReady && (
                    <div className="w-20 sm:w-36 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${progressRatio * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-1 shrink-0">
                {isReady ? (
                  <button
                    onClick={() => store.serveOrder(order.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-white font-bold text-xs rounded-lg shadow-md active:scale-95 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Giao</span>
                  </button>
                ) : (
                  <button
                    onClick={() => store.openCookingStation(recipe?.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 text-white font-bold text-xs rounded-lg shadow-md active:scale-95 transition"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Nấu</span>
                  </button>
                )}

                {/* Cancel button */}
                <button
                  onClick={() => store.cancelOrder(order.id)}
                  className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded transition"
                  title="Hủy đơn"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

