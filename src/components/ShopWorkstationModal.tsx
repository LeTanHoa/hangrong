import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getShopSpecialization, ShopServiceItem } from '../data/shopServices';
import {
  SHOP_MAP,
  STREET_SHOPS,
  getRequiredReputationForShop,
  getRequiredCartTierForShop,
  getShopUpgradeCost,
  getShopUpgradeRequiredLevel,
  MAX_SHOP_LEVEL,
} from '../data/shops';
import { INITIAL_STAFF } from '../data/staff';
import { formatVND } from '../utils/formatters';
import {
  X,
  Sparkles,
  Coins,
  Star,
  Lock,
  ArrowRight,
  Play,
  CheckCircle2,
  ChefHat,
  Timer,
  Award,
  Store,
  Users,
  Check,
  TrendingUp,
} from 'lucide-react';
import { sounds } from '../audio/soundSystem';

export const ShopWorkstationModal: React.FC = () => {
  const store = useGameStore();
  const shopId = store.selectedShopId || 'banh_mi';
  const shopSpec = getShopSpecialization(shopId);
  const shopInfo = SHOP_MAP[shopId] || STREET_SHOPS.find((s) => s.id === shopId);

  const shopLevel = store.shopLevels[shopId] || 0;
  const isOwned = shopLevel > 0;

  const assignedStaffId = Object.keys(store.staffAssignments || {}).find(
    (sId) => store.staffAssignments[sId] === shopId && store.staff[sId]
  );
  const assignedStaff = assignedStaffId ? INITIAL_STAFF.find((s) => s.id === assignedStaffId) : null;
  const hiredStaffList = INITIAL_STAFF.filter((s) => store.staff[s.id]);

  // Active performing service state
  const [activeService, setActiveService] = useState<ShopServiceItem | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isServing, setIsServing] = useState(false);
  const [completedResult, setCompletedResult] = useState<{
    service: ShopServiceItem;
    payout: number;
    xp: number;
    isPerfect: boolean;
  } | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const targetSweetSpot = { min: 78, max: 88 }; // Tightened 10% sweet spot for skilled precision

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleStartService = (service: ShopServiceItem) => {
    if (isServing) return;
    if (service.cost > 0 && store.money < service.cost) {
      store.addToast('Không đủ tiền chi phí!', `Cần ${formatVND(service.cost)} để chuẩn bị phụ tùng/nguyên liệu.`, 'error');
      return;
    }

    // Deduct material cost
    if (service.cost > 0) {
      useGameStore.setState((prev) => ({ money: prev.money - service.cost }));
    }

    setActiveService(service);
    setProgress(0);
    setCurrentStepIndex(0);
    setIsServing(true);
    setCompletedResult(null);

    // Audio cue
    if (service.soundType === 'wrench') sounds.playClick();
    else if (service.soundType === 'sizzle') sounds.playSizzle();
    else if (service.soundType === 'chop') sounds.playChop();
    else sounds.playClick();

    // Slower, clearer animation pacing so player has time to focus and time accurately
    const durationMs = Math.round((service.durationSeconds + 1.2) * 1000);
    const startTime = Date.now();

    const tickFrame = () => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(currentProgress);

      if (currentProgress < 35) setCurrentStepIndex(0);
      else if (currentProgress < 75) setCurrentStepIndex(1);
      else setCurrentStepIndex(2);

      if (currentProgress < 100) {
        animFrameRef.current = requestAnimationFrame(tickFrame);
      } else {
        // Natural completion
        finishService(1.0);
      }
    };

    animFrameRef.current = requestAnimationFrame(tickFrame);
  };

  const handlePerfectClick = () => {
    if (!isServing || !activeService) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const isPerfect = progress >= targetSweetSpot.min && progress <= targetSweetSpot.max;
    const isTooEarly = progress < 58;
    const multiplier = isPerfect ? 1.4 : isTooEarly ? 0.7 : 1.0;

    if (isPerfect) {
      sounds.playCheer();
    } else if (isTooEarly) {
      sounds.playAngry();
      store.addToast('Thao tác quá vội vàng!', 'Tay nghề chưa chín muồi, khách trừ 30% thù lao.', 'error');
    }
    finishService(multiplier);
  };

  const finishService = (multiplier: number) => {
    if (!activeService) return;
    setIsServing(false);
    sounds.playCash();

    const basePayout = activeService.payout;
    // Shop level bonus: +15% per level above 1
    const levelBonus = 1 + (shopLevel - 1) * 0.15;
    const finalPayout = Math.round(basePayout * multiplier * levelBonus);
    const finalXp = Math.round(activeService.xpReward * (multiplier > 1.0 ? 1.5 : 1.0));
    const isPerfect = multiplier > 1.0;

    // Apply reward to store
    useGameStore.setState((prev) => {
      const newMoney = prev.money + finalPayout;
      const newXp = prev.xp + finalXp;
      const newRevenue = prev.currentDayStats.revenue + finalPayout;
      return {
        money: newMoney,
        xp: newXp,
        currentDayStats: {
          ...prev.currentDayStats,
          revenue: newRevenue,
          customersServed: prev.currentDayStats.customersServed + 1,
        },
      };
    });

    setCompletedResult({
      service: activeService,
      payout: finalPayout,
      xp: finalXp,
      isPerfect,
    });

    // Fulfill active customer request if matched
    const waitingRequest = store.shopCustomerRequests[shopId];
    if (waitingRequest && activeService.id === waitingRequest.serviceId) {
      store.fulfillShopCustomerRequest(shopId);
    }

    store.addToast(
      isPerfect ? '⭐ Tay Nghề Bậc Thầy!' : 'Hoàn thành dịch vụ!',
      `Thu về +${formatVND(finalPayout)} và +${finalXp} XP từ ${activeService.name}`,
      'success',
    );
  };

  const handleBuyShop = () => {
    if (!shopInfo) return;
    const success = store.buyShop(shopId);
    if (success) {
      sounds.playLevelUp();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={() => store.closeModal()}
    >
      <div
        className="relative w-full max-w-lg sm:max-w-xl max-h-[86vh] sm:max-h-[82vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className={`px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r ${shopSpec.bgGradient} border-b border-slate-700/80 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0">
              {shopSpec.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white tracking-wide truncate">
                  {shopInfo?.name || shopSpec.title}
                </h2>
                {isOwned ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    CẤP {shopLevel} • ĐÃ MỞ
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> CHƯA MỞ
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate mt-0.5">
                {shopSpec.badge} • Chủ: <span className="text-amber-300 font-bold">{shopInfo?.ownerName || shopSpec.ownerTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Số dư</span>
              <span className="text-xs font-black text-amber-300">{formatVND(store.money)}</span>
            </div>
            <button
              onClick={() => store.closeModal()}
              className="p-1 sm:p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-2 sm:space-y-2.5 custom-scrollbar">
          {/* If shop is unowned: Show Unlock Banner */}
          {!isOwned && shopInfo && (() => {
            const reqRep = getRequiredReputationForShop(shopInfo);
            const reqCart = getRequiredCartTierForShop(shopInfo);
            const hasLevel = store.level >= shopInfo.requiredLevel;
            const hasRep = store.reputationRating >= reqRep;
            const hasCart = store.cartTier >= reqCart;
            const hasMoney = store.money >= shopInfo.unlockCost;
            const canBuy = hasLevel && hasRep && hasCart && hasMoney;

            return (
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-orange-950/40 p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold">
                      <Store className="w-3.5 h-3.5" /> Cơ hội đầu tư mặt bằng phố
                    </div>
                    <h3 className="text-lg font-bold text-white">Mở khóa cửa hàng để phục vụ khách & nhận hoa hồng thụ động!</h3>
                    <p className="text-xs text-slate-300 max-w-xl">
                      {shopInfo.description || 'Sở hữu cửa hàng giúp bạn mở toàn bộ dịch vụ phục vụ khách hàng, tự động nhận doanh thu mỗi ngày.'}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs">
                      <div className={hasLevel ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        Cấp yêu cầu: <span className="font-extrabold text-white">Cấp {shopInfo.requiredLevel}</span> {hasLevel ? '✓' : `(hiện có: ${store.level})`}
                      </div>
                      <div className={hasRep ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        Uy tín tối thiểu: <span className="font-extrabold text-white">{reqRep}⭐</span> {hasRep ? '✓' : `(hiện có: ${store.reputationRating}⭐)`}
                      </div>
                      <div className={hasCart ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        Xe tối thiểu: <span className="font-extrabold text-white">Cấp {reqCart}</span> {hasCart ? '✓' : `(hiện có: Cấp ${store.cartTier})`}
                      </div>
                      <div>
                        Hoa hồng: <span className="font-bold text-emerald-400">+{formatVND(shopInfo.dailyBonusIncome)}/ngày</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBuyShop}
                    disabled={!canBuy}
                    className={`shrink-0 px-6 py-3.5 rounded-2xl font-black text-sm transition shadow-xl active:scale-95 flex items-center gap-2 ${
                      canBuy
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 shadow-orange-950/40'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    Mở Khóa Ngay ({formatVND(shopInfo.unlockCost)})
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Active Performing Workstation Area */}
          {isServing && activeService && (
            <div className="relative overflow-hidden rounded-2xl border-2 border-orange-500/60 bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/40 p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl animate-bounce">{activeService.icon}</span>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-400">
                      Đang thực hiện thao tác nghề nghiệp...
                    </span>
                    <h3 className="text-lg font-black text-white">{activeService.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold block">Thu về</span>
                  <span className="text-base font-black text-emerald-400">+{formatVND(activeService.payout)}</span>
                </div>
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-3 gap-2 my-3">
                {activeService.stepNames.map((step, idx) => {
                  const isCurrent = currentStepIndex === idx;
                  const isDone = currentStepIndex > idx;
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-xl border text-center transition ${
                        isCurrent
                          ? 'border-orange-500 bg-orange-500/20 text-orange-200 shadow-md shadow-orange-950/30 font-bold'
                          : isDone
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider">Bước {idx + 1}</div>
                      <div className="text-xs truncate">{step}</div>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar with Golden Sweet Spot zone */}
              <div className="relative my-4">
                <div className="flex justify-between text-xs text-slate-400 font-bold mb-1.5">
                  <span>Tiến trình hoàn thiện</span>
                  <span className="text-white font-black">{Math.round(progress)}%</span>
                </div>

                <div className="relative h-6 bg-slate-950 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                  {/* Golden Sweet Spot Zone (72% - 94%) */}
                  <div
                    className="absolute top-0 bottom-0 bg-amber-400/30 border-x-2 border-amber-400 animate-pulse flex items-center justify-center"
                    style={{
                      left: `${targetSweetSpot.min}%`,
                      width: `${targetSweetSpot.max - targetSweetSpot.min}%`,
                    }}
                  >
                    <span className="text-[10px] font-black text-amber-300 uppercase tracking-tighter">
                      VÙNG HOÀN HẢO (+35%)
                    </span>
                  </div>

                  {/* Dynamic Progress Fill */}
                  <div
                    className={`h-full transition-all duration-75 ${
                      progress >= targetSweetSpot.min && progress <= targetSweetSpot.max
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-lg shadow-yellow-500/50'
                        : 'bg-gradient-to-r from-orange-600 to-rose-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Action Button: Hit in sweet spot */}
              <div className="flex items-center justify-between gap-4 mt-2">
                <p className="text-xs text-slate-400 italic">
                  💡 Bấm nút khi thanh tiến trình vào <strong className="text-amber-300">Vùng Hoàn Hảo</strong> để nhận thêm +35% tiền Tip và +50% XP!
                </p>

                <button
                  onClick={handlePerfectClick}
                  className={`px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg active:scale-95 flex items-center gap-1.5 shrink-0 ${
                    progress >= targetSweetSpot.min && progress <= targetSweetSpot.max
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-950 shadow-yellow-500/40 animate-pulse'
                      : 'bg-orange-600 hover:bg-orange-500 text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {progress >= targetSweetSpot.min && progress <= targetSweetSpot.max ? 'RA MÓN HOÀN HẢO!' : 'HOÀN THÀNH NGAY'}
                </button>
              </div>
            </div>
          )}

          {/* Completion Celebration Card */}
          {completedResult && (
            <div className="rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 p-4 flex items-center justify-between animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    {completedResult.isPerfect ? '⭐ HOÀN THÀNH XUẤT THẦN!' : 'ĐÃ HOÀN THÀNH DỊCH VỤ!'}
                    <span className="text-xs text-emerald-400 font-bold">+{formatVND(completedResult.payout)}</span>
                    <span className="text-xs text-amber-300 font-bold">+{completedResult.xp} XP</span>
                  </h4>
                  <p className="text-xs text-slate-300 italic mt-0.5">
                    Thực khách: &ldquo;{completedResult.service.customerQuote}&rdquo;
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCompletedResult(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Đóng
              </button>
            </div>
          )}

          {/* Quick link for Bánh Mì cooking station if applicable */}
          {shopId === 'banh_mi' && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-2.5 sm:p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">Bếp Bánh Mì Mini & Đơn Hàng</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Chuẩn bị món theo công thức phục vụ khách chờ.</p>
                </div>
              </div>
              <button
                onClick={() => store.openCookingStation()}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold text-xs flex items-center gap-1 shadow shrink-0 active:scale-95 transition"
              >
                <span>Vào Bếp</span> <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Shop Upgrade Card for Owned Shops */}
          {isOwned && shopInfo && shopLevel < MAX_SHOP_LEVEL && (() => {
            const nextLevel = shopLevel + 1;
            const upgradeCost = getShopUpgradeCost(shopInfo, shopLevel);
            const reqLevel = getShopUpgradeRequiredLevel(shopInfo, shopLevel);
            const canUpgrade = store.level >= reqLevel && store.money >= upgradeCost;

            return (
              <div className="relative overflow-hidden rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 p-2.5 sm:p-3 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-base shrink-0">
                      ⚡
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-sky-500 text-white">
                          NÂNG CẤP
                        </span>
                        <span className="text-xs font-bold text-sky-300">
                          Cấp {nextLevel}/{MAX_SHOP_LEVEL}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 truncate">
                        Tăng <strong className="text-emerald-400">+15% thù lao</strong> & hoa hồng thụ động mỗi ngày.
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className={store.level >= reqLevel ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                          Yêu cầu: Cấp {reqLevel} {store.level >= reqLevel ? '✓' : `(có: ${store.level})`}
                        </span>
                        <span>•</span>
                        <span>Chi phí: <strong className="text-amber-300">{formatVND(upgradeCost)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const success = store.upgradeShop(shopId);
                      if (success) {
                        sounds.playLevelUp();
                      }
                    }}
                    disabled={!canUpgrade}
                    className={`shrink-0 px-3 py-1.5 rounded-lg font-bold text-xs transition shadow active:scale-95 flex items-center gap-1 ${
                      canUpgrade
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white shadow-sky-950/50'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Nâng Cấp ({formatVND(upgradeCost)})</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Shop Assigned Staff Card */}
          {isOwned && (
            <div className="relative overflow-hidden rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 p-2.5 sm:p-3 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 overflow-hidden">
                    {assignedStaff ? (
                      <img
                        src={`/assets/characters/${assignedStaff.id}.png`}
                        alt={assignedStaff.name}
                        className="w-full h-full object-contain p-0.5"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-500 text-white">
                        NHÂN SỰ TRỰC
                      </span>
                      {assignedStaff && (
                        <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Tự phục vụ
                        </span>
                      )}
                    </div>
                    {assignedStaff ? (
                      <div>
                        <h4 className="text-xs font-black text-white mt-0.5 truncate">
                          {assignedStaff.name} <span className="text-[10px] font-normal text-slate-300">({assignedStaff.title})</span>
                        </h4>
                        <p className="text-[10px] text-purple-300/90 truncate">
                          ⚡ Hiệu suất: +{Math.round(assignedStaff.efficiencyBonus * 100)}%
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-xs font-bold text-white mt-0.5">
                          Chưa phân công ai trực
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          Điều phối nhân viên đã thuê để tự phục vụ khách.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {hiredStaffList.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={assignedStaff?.id || ''}
                        onChange={(e) => {
                          const newStaffId = e.target.value;
                          if (!newStaffId) {
                            if (assignedStaff) store.unassignStaff(assignedStaff.id);
                          } else {
                            store.assignStaffToShop(newStaffId, shopId);
                          }
                        }}
                        className="bg-slate-950 border border-purple-500/50 rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-purple-400"
                      >
                        <option value="">-- Chưa có ai --</option>
                        {hiredStaffList.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} {store.staffAssignments?.[st.id] === shopId ? '(Trực)' : ''}
                          </option>
                        ))}
                      </select>
                      {assignedStaff && (
                        <button
                          onClick={() => store.unassignStaff(assignedStaff.id)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => store.openModal('SMARTPHONE', 'STAFF')}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow transition"
                    >
                      <Users className="w-3 h-3" /> Tuyển NV
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Waiting Customer Banner if active */}
          {store.shopCustomerRequests[shopId] && (
            <div className="relative overflow-hidden rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/60 p-2.5 sm:p-3 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl shrink-0">
                    {store.shopCustomerRequests[shopId].serviceIcon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500 text-slate-950">
                        KHÁCH ĐANG CHỜ
                      </span>
                      <span className="text-xs font-bold text-amber-300 truncate">
                        {store.shopCustomerRequests[shopId].customerName}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-white mt-0.5 truncate">
                      Yêu cầu: &ldquo;{store.shopCustomerRequests[shopId].serviceName}&rdquo;
                    </h4>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-emerald-400">
                    +{formatVND(store.shopCustomerRequests[shopId].payout)}
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 ml-1.5">
                    +{store.shopCustomerRequests[shopId].xpReward} XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Specialization Services Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Nghiệp Vụ Của Tiệm ({shopSpec.services.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {shopSpec.services.map((service) => {
                const canAfford = service.cost === 0 || store.money >= service.cost;
                const isRequested = store.shopCustomerRequests[shopId]?.serviceId === service.id;
                return (
                  <div
                    key={service.id}
                    className={`rounded-xl border transition-all p-2.5 flex flex-col justify-between ${
                      isRequested
                        ? 'border-amber-400 bg-amber-950/20 shadow-md ring-1 ring-amber-400/50'
                        : isOwned
                          ? 'bg-slate-800/60 border-slate-700/80 hover:border-orange-500/50 hover:bg-slate-800'
                          : 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div>
                      {/* Service Top Info */}
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg p-1 rounded-lg bg-slate-900/80 border border-slate-700/60 shrink-0">
                            {service.icon}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-white truncate">{service.name}</h4>
                            <span className="text-[9px] text-slate-400">{service.category}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-emerald-400 block">+{formatVND(service.payout)}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-300 line-clamp-1 my-1">{service.description}</p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-1.5 border-t border-slate-700/50 flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Timer className="w-3 h-3 text-slate-500" />
                        <span>{service.durationSeconds}s</span>
                      </div>

                      <button
                        onClick={() => handleStartService(service)}
                        disabled={!isOwned || !canAfford || isServing}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition active:scale-95 flex items-center gap-1 shadow ${
                          !isOwned
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : !canAfford
                              ? 'bg-rose-950 text-rose-400 border border-rose-800 cursor-not-allowed'
                              : isServing
                                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                                : isRequested
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black animate-pulse'
                                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        <span>Thực hiện</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Tip */}
        <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Phục vụ khách hàng chuyên nghiệp để tích lũy tiền mặt & nâng hạng phố!</span>
          </div>

          <button
            onClick={() => store.closeModal()}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition shrink-0 ml-2"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
