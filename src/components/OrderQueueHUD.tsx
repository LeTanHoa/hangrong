import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { RECIPE_MAP } from '../data/recipes';
import { CUSTOMER_MAP } from '../data/customers';
import { formatVND } from '../utils/formatters';
import { ChefHat, CheckCircle2, ChevronDown, ChevronUp, Bell, X } from 'lucide-react';

export const OrderQueueHUD: React.FC = () => {
  const store = useGameStore();
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (store.activeModal) return null;

  if (store.orders.length === 0) {
    return (
      <div className="absolute bottom-2 left-2 z-30 pointer-events-none select-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 shadow text-slate-400 text-[10px] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Đang đợi khách...</span>
        </div>
      </div>
    );
  }

  const hasReadyOrder = store.orders.some((o) => o.status === 'READY');

  // Mobile collapsed floating badge - ultra compact
  if (isCollapsed) {
    return (
      <div className="absolute bottom-2 left-2 z-30 pointer-events-auto select-none animate-fadeIn">
        <button
          onClick={() => setIsCollapsed(false)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-lg text-white transition active:scale-95 ${
            hasReadyOrder
              ? 'bg-emerald-950/95 border-emerald-500/80 shadow-emerald-950/60 animate-pulse'
              : 'bg-slate-900/95 border-amber-500/50 shadow-black'
          }`}
        >
          <span className="text-xs">🧾</span>
          <span className="text-[11px] font-black text-white">
            {store.orders.length} Đơn
          </span>
          {hasReadyOrder ? (
            <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 rounded-full animate-bounce">
              Giao ngay!
            </span>
          ) : (
            <span className="text-[10px] text-amber-300 font-bold">Chạm mở</span>
          )}
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </button>
      </div>
    );
  }

  // Expanded HUD - Super sleek, compact, non-intrusive
  return (
    <aside className="absolute bottom-2 left-2 z-30 w-64 max-w-[calc(100vw-1rem)] flex flex-col gap-1 pointer-events-none select-none animate-fadeIn">
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 px-1 pointer-events-auto bg-slate-950/70 backdrop-blur-sm py-0.5 rounded-md">
        <span className="flex items-center gap-1">
          <span>ĐƠN CHỜ ({store.orders.length}/{store.maxOrdersQueue})</span>
          {hasReadyOrder && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          )}
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition flex items-center gap-0.5 text-[9px]"
          title="Thu gọn"
        >
          <span>Thu gọn</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto max-h-32 sm:max-h-40 pr-0.5 pointer-events-auto custom-scrollbar">
        {store.orders.map((order) => {
          const recipe = RECIPE_MAP[order.items[0]?.recipeId || 'banh_mi_thit'];
          const cust = CUSTOMER_MAP[order.customerTypeId];
          const progressRatio = Math.max(0, Math.min(1, order.remainingSeconds / order.maxWaitSeconds));
          const isReady = order.status === 'READY';

          let barColor = 'bg-emerald-500';
          if (progressRatio < 0.3) barColor = 'bg-rose-500';
          else if (progressRatio < 0.6) barColor = 'bg-amber-500';

          return (
            <div
              key={order.id}
              className={`flex items-center justify-between gap-1.5 p-1.5 rounded-xl backdrop-blur-md border shadow transition-all ${
                isReady
                  ? 'bg-emerald-950/90 border-emerald-500/60 shadow-emerald-950/40'
                  : 'bg-slate-900/95 border-slate-700/70'
              }`}
            >
              {/* Dish Icon & Info */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-sm shrink-0">
                  {recipe?.icon || '🍲'}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-[11px] text-white truncate max-w-[110px]">
                      {order.items[0]?.quantity}x {recipe?.name || 'Món ăn'}
                    </span>
                    {cust?.isVip && (
                      <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1 rounded uppercase shrink-0">
                        VIP
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <span className="text-amber-300 font-bold">{formatVND(order.totalPrice)}</span>
                    <span className="truncate max-w-[70px]">• {cust?.title || 'Khách'}</span>
                  </div>

                  {/* Patience timer bar */}
                  {!isReady && (
                    <div className="w-full max-w-[120px] h-0.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
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
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] shadow active:scale-95 transition"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Giao</span>
                  </button>
                ) : (
                  <button
                    onClick={() => store.openCookingStation(order.items[0]?.recipeId)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-[10px] shadow active:scale-95 transition"
                  >
                    <ChefHat className="w-3 h-3" />
                    <span>Nấu</span>
                  </button>
                )}

                <button
                  onClick={() => store.cancelOrder(order.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
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
