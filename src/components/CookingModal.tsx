import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { RECIPE_MAP } from '../data/recipes';
import { INGREDIENT_MAP } from '../data/ingredients';
import { CART_UPGRADES, EQUIPMENT_UPGRADES } from '../data/cartUpgrades';
import { formatVND } from '../utils/formatters';
import { X, Flame, ChefHat, Sparkles, ShoppingCart, Check } from 'lucide-react';
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
    // Prep time modified by stove upgrade & staff
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
        (1 - equipmentBonus - chefBonus)
    );

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setCookingProgress(progress);

      if (progress < 100) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // Auto complete if not clicked
        finishCookingAction(1.0);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const handleFinishClick = () => {
    if (!isCooking) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Calculate perfection multiplier based on timing
    let multiplier = 1.0;
    if (cookingProgress >= targetSuccessZone.min && cookingProgress <= targetSuccessZone.max) {
      multiplier = 1.35; // Perfectionist master chef bonus!
      sounds.playCheer();
    } else if (cookingProgress < 58) {
      multiplier = 0.75;
      store.addToast('Món chưa đủ lửa!', 'Bánh/món bị non lửa do vội vàng, giảm 25% giá trị.', 'error');
    }
    finishCookingAction(multiplier);
  };

  const finishCookingAction = (multiplier: number) => {
    setIsCooking(false);
    setCookingProgress(0);
    const success = store.finishCooking(recipe.id, multiplier);
    if (success) {
      // Check tutorial progress
      if (store.tutorialStep === 4) {
        store.advanceTutorial();
      }
      store.closeModal();
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-3 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => store.closeModal()}
    >
      <div
        className="relative w-full max-w-md sm:max-w-lg max-h-[86vh] sm:max-h-[82vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3.5 bg-gradient-to-r from-orange-950/80 to-slate-900 border-b border-orange-500/20 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl sm:text-2xl shrink-0">{recipe.icon}</span>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-lg text-white leading-tight truncate">
                Bếp Nấu: {recipe.name}
              </h2>
              <p className="text-[11px] sm:text-xs text-orange-300 truncate">
                Giá vốn: {formatVND(recipe.baseCost)} • Giá bán: {formatVND(recipe.sellPrice)}
              </p>
            </div>
          </div>

          <button
            onClick={() => store.closeModal()}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition active:scale-95 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-y-auto">
          {/* Dish Description */}
          <p className="text-xs sm:text-sm text-slate-300 italic bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            "{recipe.description}"
          </p>

          {/* Recipe Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {store.unlockedRecipes.map((rId) => {
              const r = RECIPE_MAP[rId];
              if (!r) return null;
              const isSelected = r.id === recipe.id;
              return (
                <button
                  key={r.id}
                  onClick={() => store.openCookingStation(r.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap border ${
                    isSelected
                      ? 'bg-orange-600 border-orange-400 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  <span>{r.icon}</span>
                  <span>{r.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Required Ingredients Table */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nguyên Liệu Yêu Cầu
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ingredientStatuses.map((req) => (
                <div
                  key={req.ingredientId}
                  className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                    req.hasEnough
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{req.item?.icon || '📦'}</span>
                    <span className="font-semibold">{req.item?.name}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold">
                    <span>
                      {req.currentStock}/{req.quantity} {req.item?.unit}
                    </span>
                    {req.hasEnough ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-rose-400 uppercase">Thiếu!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minigame Cooking Progress */}
          {isCooking && (
            <div className="flex flex-col gap-2 p-3 bg-slate-950 rounded-xl border border-orange-500/30">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1 text-orange-400 font-bold">
                  <Flame className="w-4 h-4 animate-bounce" />
                  Đang đun nấu xèo xèo...
                </span>
                <span className="text-slate-400 font-mono">{Math.round(cookingProgress)}%</span>
              </div>

              {/* Progress Bar with Perfect Timing Zone */}
              <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                {/* Perfect zone indicator */}
                <div
                  className="absolute top-0 bottom-0 bg-yellow-400/40 border-x border-yellow-300 z-10"
                  style={{
                    left: `${targetSuccessZone.min}%`,
                    width: `${targetSuccessZone.max - targetSuccessZone.min}%`,
                  }}
                  title="Vùng vàng: Bấm lúc này để nhận thưởng Đôi Tay Vàng (+35% XP)!"
                />
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-75"
                  style={{ width: `${cookingProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-amber-300 text-center animate-pulse">
                💡 Bấm "RA MÓN NGAY" khi thanh chạy vào ô màu vàng để đạt điểm tuyệt đối!
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-t border-slate-800 gap-3">
          {!canCook ? (
            <button
              onClick={() => store.openModal('SMARTPHONE', 'MARKET')}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Chợ Nguyên Liệu (Nhập Hàng)</span>
            </button>
          ) : isCooking ? (
            <button
              onClick={handleFinishClick}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-950/50 transition active:scale-95 animate-pulse"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>RA MÓN NGAY (HOÀN THÀNH)</span>
            </button>
          ) : (
            <button
              onClick={startCookingProcess}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-950/50 transition active:scale-95"
            >
              <ChefHat className="w-4 h-4" />
              <span>Bắt Đầu Nấu Món</span>
            </button>
          )}

          <button
            onClick={() => store.closeModal()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

