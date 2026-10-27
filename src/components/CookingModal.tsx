import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { RECIPE_MAP } from '../data/recipes';
import { INGREDIENT_MAP } from '../data/ingredients';
import { CART_UPGRADES, EQUIPMENT_UPGRADES } from '../data/cartUpgrades';
import { formatVND } from '../utils/formatters';
import { X, Flame, ChefHat, ShoppingCart, Check, Zap } from 'lucide-react';
import { sounds } from '../audio/soundSystem';

export const CookingModal: React.FC = () => {
  const store = useGameStore();
  const selectedRecipeId = store.cookingRecipeId || 'banh_mi_thit';
  const recipe = RECIPE_MAP[selectedRecipeId] || RECIPE_MAP['banh_mi_thit'];

  const [isCooking, setIsCooking] = useState(false);
  const [cookingProgress, setCookingProgress] = useState(0);
  const [targetSuccessZone] = useState({ min: 78, max: 88 });
  const animFrameRef = useRef<number | null>(null);

  // Check ingredient availability
  const ingredientStatuses = recipe.ingredients.map((req) => {
    const item = INGREDIENT_MAP[req.ingredientId];
    const currentStock = store.inventory[req.ingredientId] || 0;
    const hasEnough = currentStock >= req.quantity;
    return {
      ...req,
      item,
      currentStock,
      hasEnough,
    };
  });

  const canCook = ingredientStatuses.every((s) => s.hasEnough);

  const startCookingProcess = () => {
    if (!canCook || isCooking) return;
    setIsCooking(true);
    setCookingProgress(0);
    sounds.playSizzle();

    const startTime = Date.now();
    const stoveLevel = store.equipment['stove_upgrade'] || 1;
    const stoveUpgrade = EQUIPMENT_UPGRADES.find((item) => item.id === 'stove_upgrade');
    const counterUpgrade = EQUIPMENT_UPGRADES.find((item) => item.id === 'counter_upgrade');
    const counterLevel = store.equipment['counter_upgrade'] || 1;
    const cart = CART_UPGRADES.find((item) => item.tier === store.cartTier);
    const equipmentBonus =
      (stoveLevel - 1) * (stoveUpgrade?.prepTimeReduction || 0) +
      (counterLevel - 1) * (counterUpgrade?.prepTimeReduction || 0);
    const chefBonus = store.staff['staff_cook_1'] ? 0.25 : 0;
    const durationMs = Math.max(
      2200,
      ((recipe.prepTimeSeconds + 1.2) * 1000) /
        (cart?.prepSpeedMultiplier || 1) *
        (1 - equipmentBonus - chefBonus),
    );

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setCookingProgress(progress);

      if (progress < 100) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        finishCookingAction(1.0);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const handleFinishClick = () => {
    if (!isCooking) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    let multiplier = 1.0;
    if (cookingProgress >= targetSuccessZone.min && cookingProgress <= targetSuccessZone.max) {
      multiplier = 1.35;
      sounds.playCheer();
      store.addToast('Đôi tay vàng!', 'Món ăn đạt độ chín giòn hoàn hảo! (+35% tiền tip & XP)', 'success');
    } else if (cookingProgress < 50) {
      multiplier = 0.8;
      sounds.playAngry();
      store.addToast('Chưa chín tới!', 'Món ăn bị non lửa, khách không hài lòng.', 'error');
    } else {
      sounds.playCash();
    }

    finishCookingAction(multiplier);
  };

  const finishCookingAction = (multiplier: number) => {
    setIsCooking(false);

    const matchingOrder = store.orders.find(
      (o) => o.status === 'PENDING' && o.items.some((it) => it.recipeId === recipe.id),
    );

    const success = store.finishCooking(recipe.id, multiplier, matchingOrder?.id);
    if (success) {
      if (matchingOrder) {
        store.serveOrder(matchingOrder.id);
      } else {
        const payout = Math.round(recipe.sellPrice * multiplier);
        const xpReward = Math.round(recipe.xpReward * multiplier);
        useGameStore.setState((prev) => ({
          money: prev.money + payout,
          xp: prev.xp + xpReward,
          reputationRating: Math.min(5.0, Number((prev.reputationRating + (multiplier >= 1.3 ? 0.05 : 0.02)).toFixed(2))),
          currentDayStats: {
            ...prev.currentDayStats,
            revenue: prev.currentDayStats.revenue + payout,
            customersServed: prev.currentDayStats.customersServed + 1,
          },
        }));
        store.addToast(
          'Nấu món thành công!',
          `Hoàn thành 1x ${recipe.name} (+${formatVND(payout)}, +${xpReward} XP)`,
          'money',
        );
      }
    }

    store.closeModal();
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-1 sm:p-3 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => store.closeModal()}
    >
      <div
        className="relative w-full max-w-4xl h-[94vh] sm:h-[88vh] bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-950/90 via-slate-900 to-amber-950/80 border-b border-orange-500/30 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{recipe.icon}</span>
            <div className="min-w-0">
              <h2 className="font-black text-xs sm:text-sm text-white truncate">
                Bếp Nấu: {recipe.name}
              </h2>
              <p className="text-[10px] text-orange-300 truncate">
                Vốn: {formatVND(recipe.baseCost)} • Giá bán: <strong className="text-amber-300">{formatVND(recipe.sellPrice)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-300 hidden sm:block">
              {formatVND(store.money)}
            </span>
            <button
              onClick={() => store.closeModal()}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Split Body */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* CỘT TRÁI (42%): Chọn Món Ăn & Nguyên Liệu */}
          <div className="col-span-5 border-r border-slate-800 bg-slate-900/40 p-2 sm:p-2.5 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
            {/* Recipe Selector Grid */}
            <div className="text-[10px] font-black uppercase text-slate-400">
              Thực Đơn Đã Mở ({store.unlockedRecipes.length})
            </div>
            <div className="grid grid-cols-2 gap-1">
              {store.unlockedRecipes.map((rId) => {
                const r = RECIPE_MAP[rId];
                if (!r) return null;
                const isSelected = r.id === recipe.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      sounds.playClick();
                      store.openCookingStation(r.id);
                    }}
                    className={`flex items-center gap-1.5 p-1.5 rounded-xl text-left border transition ${
                      isSelected
                        ? 'bg-orange-600/90 border-orange-400 text-white font-black shadow'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base shrink-0">{r.icon}</span>
                    <span className="text-[11px] truncate block">{r.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Ingredients Status */}
            <div className="text-[10px] font-black uppercase text-slate-400 pt-1">
              Nguyên Liệu Nấu
            </div>
            <div className="space-y-1">
              {ingredientStatuses.map((req) => (
                <div
                  key={req.ingredientId}
                  className={`flex items-center justify-between p-1.5 rounded-xl border text-[11px] ${
                    req.hasEnough
                      ? 'bg-slate-900/80 border-slate-800 text-slate-200'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300 animate-pulse'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">{req.item?.icon || '📦'}</span>
                    <span className="font-semibold truncate">{req.item?.name}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold shrink-0">
                    <span>
                      {req.currentStock}/{req.quantity} {req.item?.unit}
                    </span>
                    {req.hasEnough ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <span className="text-[9px] text-rose-400 font-black uppercase">Thiếu!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!canCook && (
              <button
                onClick={() => {
                  sounds.playClick();
                  store.openModal('SMARTPHONE', 'MARKET');
                }}
                className="w-full mt-auto py-1.5 px-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition shadow active:scale-95"
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Mua Thêm Tại Chợ Sỉ</span>
              </button>
            )}
          </div>

          {/* CỘT PHẢI (58%): Đấu Trường Bếp Nấu Minigame */}
          <div className="col-span-7 p-3 sm:p-4 flex flex-col justify-between bg-slate-950 overflow-y-auto custom-scrollbar">
            {/* Dish Display */}
            <div>
              <div className="text-center mb-2">
                <span className="text-4xl inline-block animate-bounce">{recipe.icon}</span>
                <h3 className="text-sm sm:text-base font-black text-white mt-1">
                  {recipe.name}
                </h3>
                <p className="text-[11px] text-slate-300 italic max-w-sm mx-auto mt-0.5">
                  &ldquo;{recipe.description}&rdquo;
                </p>
              </div>

              {/* Reward stats */}
              <div className="flex justify-center gap-3 my-2 text-xs">
                <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[9px] text-slate-400 block font-bold">Giá bán</span>
                  <span className="font-black text-emerald-400">+{formatVND(recipe.sellPrice)}</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[9px] text-slate-400 block font-bold">Kinh nghiệm</span>
                  <span className="font-black text-amber-400">+{recipe.xpReward} XP</span>
                </div>
              </div>
            </div>

            {/* Cooking Progress Bar (when active) */}
            {isCooking ? (
              <div className="my-2 p-2.5 rounded-2xl bg-slate-900/90 border border-orange-500/40">
                <div className="flex justify-between items-center text-xs font-black text-orange-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 animate-bounce" /> Đang nấu xèo xèo...
                  </span>
                  <span className="text-amber-300 font-mono">{Math.round(cookingProgress)}%</span>
                </div>

                <div className="relative w-full h-7 bg-slate-950 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                  {/* Sweet spot */}
                  <div
                    className="absolute top-0 bottom-0 bg-amber-400/40 border-x-2 border-amber-300 animate-pulse flex items-center justify-center z-10"
                    style={{
                      left: `${targetSuccessZone.min}%`,
                      width: `${targetSuccessZone.max - targetSuccessZone.min}%`,
                    }}
                  >
                    <span className="text-[9px] font-black text-amber-200 uppercase">
                      VÙNG GIÒN RỤM (+35%)
                    </span>
                  </div>

                  <div
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 transition-all duration-75"
                    style={{ width: `${cookingProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {/* Big Action Button under Right Thumb */}
            {isCooking ? (
              <button
                onClick={handleFinishClick}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide shadow-xl active:scale-95 transition"
              >
                🎯 RA MÓN NGAY (CHẠM VÙNG VÀNG)
              </button>
            ) : (
              <button
                onClick={startCookingProcess}
                disabled={!canCook}
                className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wide shadow-xl active:scale-95 transition flex items-center justify-center gap-2 ${
                  canCook
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 shadow-orange-950/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>{canCook ? 'BẮT ĐẦU NẤU BẾP 🔥' : 'THIẾU NGUYÊN LIỆU!'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
