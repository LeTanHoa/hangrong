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
  Zap,
  Package,
  Flame,
} from 'lucide-react';
import { sounds } from '../audio/soundSystem';

export const ShopWorkstationModal: React.FC = () => {
  const store = useGameStore();
  const shopId = store.selectedShopId || 'banh_mi';
  const shopSpec = getShopSpecialization(shopId);
  const shopInfo = SHOP_MAP[shopId] || STREET_SHOPS.find((s) => s.id === shopId);

  const shopLevel = store.shopLevels[shopId] || 0;
  const isOwned = shopLevel > 0;

  // Daily shop performance & revenue statistics
  const shopDailyStat = store.currentDayStats.shopDailyStats?.[shopId] || { itemsSold: 0, revenue: 0 };
  const dailyItemsSold = shopDailyStat.itemsSold;
  const dailyBonusIncome = isOwned && shopInfo ? shopInfo.dailyBonusIncome * shopLevel : 0;
  const totalDailyRevenue = shopDailyStat.revenue + dailyBonusIncome;

  const trafficTier = shopInfo?.trafficTier || 'MEDIUM';
  const trafficLabel = shopInfo?.trafficLabel || 'Vừa phải';

  const trafficBadge = (() => {
    switch (trafficTier) {
      case 'VERY_HIGH':
        return {
          icon: '🔥',
          text: 'Rất đông khách',
          bg: 'bg-rose-500/25 text-rose-300 border-rose-500/50',
        };
      case 'HIGH':
        return {
          icon: '⚡',
          text: 'Đông đúc',
          bg: 'bg-amber-500/25 text-amber-300 border-amber-500/50',
        };
      case 'LOW':
        return {
          icon: '🍃',
          text: 'Ít khách',
          bg: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
        };
      default:
        return {
          icon: '☕',
          text: 'Vừa phải',
          bg: 'bg-sky-500/25 text-sky-300 border-sky-500/50',
        };
    }
  })();

  const assignedStaffId = Object.keys(store.staffAssignments || {}).find(
    (sId) => store.staffAssignments[sId] === shopId && store.staff[sId],
  );
  const assignedStaff = assignedStaffId
    ? INITIAL_STAFF.find((s) => s.id === assignedStaffId)
    : null;
  const hiredStaffList = INITIAL_STAFF.filter((s) => store.staff[s.id]);

  // Selected service in Master-Detail layout (defaults to requested service or first available)
  const defaultService =
    shopSpec.services.find(
      (s) => s.id === store.shopCustomerRequests[shopId]?.serviceId,
    ) ||
    shopSpec.services[0] ||
    null;

  const [selectedService, setSelectedService] = useState<ShopServiceItem | null>(defaultService);
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
  const targetSweetSpot = { min: 78, max: 88 };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleStartService = (service: ShopServiceItem) => {
    if (isServing) return;
    if (service.cost > 0 && store.money < service.cost) {
      store.addToast(
        'Không đủ tiền chi phí!',
        `Cần ${formatVND(service.cost)} để chuẩn bị phụ tùng/nguyên liệu.`,
        'error',
      );
      return;
    }

    if (service.cost > 0) {
      useGameStore.setState((prev) => ({ money: prev.money - service.cost }));
    }

    setActiveService(service);
    setSelectedService(service);
    setProgress(0);
    setCurrentStepIndex(0);
    setIsServing(true);
    setCompletedResult(null);

    if (service.soundType === 'wrench') sounds.playClick();
    else if (service.soundType === 'sizzle') sounds.playSizzle();
    else if (service.soundType === 'chop') sounds.playChop();
    else sounds.playClick();

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
      store.addToast(
        'Thao tác quá vội vàng!',
        'Tay nghề chưa chuẩn, khách trừ 30% thù lao.',
        'error',
      );
    }
    finishService(multiplier);
  };

  const finishService = (multiplier: number) => {
    if (!activeService) return;
    setIsServing(false);
    sounds.playCash();

    const staffBonus = assignedStaff ? assignedStaff.efficiencyBonus : 0;
    const shopUpgradeBonus = (shopLevel - 1) * 0.15;
    const totalMultiplier = multiplier * (1 + staffBonus + shopUpgradeBonus);

    const finalPayout = Math.round(activeService.payout * totalMultiplier);
    const finalXP = Math.round(activeService.xpReward * (multiplier >= 1.3 ? 1.5 : 1.0));
    const isPerfect = multiplier >= 1.3;

    useGameStore.setState((prev) => {
      const prevShopStat = prev.currentDayStats.shopDailyStats?.[shopId] || { itemsSold: 0, revenue: 0 };
      return {
        money: prev.money + finalPayout,
        xp: prev.xp + finalXP,
        reputationRating: Math.min(5.0, Number((prev.reputationRating + (isPerfect ? 0.08 : 0.03)).toFixed(2))),
        currentDayStats: {
          ...prev.currentDayStats,
          revenue: prev.currentDayStats.revenue + finalPayout,
          customersServed: prev.currentDayStats.customersServed + 1,
          shopDailyStats: {
            ...(prev.currentDayStats.shopDailyStats || {}),
            [shopId]: {
              itemsSold: prevShopStat.itemsSold + 1,
              revenue: prevShopStat.revenue + finalPayout,
            },
          },
        },
      };
    });

    if (store.shopCustomerRequests[shopId]?.serviceId === activeService.id) {
      store.fulfillShopCustomerRequest(shopId);
    }

    setCompletedResult({
      service: activeService,
      payout: finalPayout,
      xp: finalXP,
      isPerfect,
    });
    setActiveService(null);
  };

  const handleBuyShop = () => {
    if (!shopInfo) return;
    const success = store.buyShop(shopId);
    if (success) {
      sounds.playLevelUp();
    }
  };

  const handleOpenStaffManagement = () => {
    sounds.playClick();
    store.openModal('SMARTPHONE', 'STAFF');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-3 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={() => store.closeModal()}
    >
      <div
        className="relative w-full max-w-4xl h-[94vh] sm:h-[88vh] flex flex-col bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER BAR (SLIM & CRISP) ================= */}
        <div
          className={`px-3 sm:px-4 py-2 bg-gradient-to-r ${shopSpec.bgGradient} border-b border-slate-700/80 flex items-center justify-between shrink-0`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {shopId.startsWith('coop_') ? (
              <img src="/assets/logos/coopmart_badge.png" alt="Co.opmart" className="w-8 h-8 object-contain rounded bg-white p-0.5 shrink-0 shadow" />
            ) : (
              <span className="text-xl shrink-0">{shopSpec.icon}</span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xs sm:text-sm font-black text-white tracking-wide truncate">
                  {shopInfo?.name || shopSpec.title}
                </h2>
                {isOwned ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    CẤP {shopLevel} • ĐÃ MỞ
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> CHƯA MỞ
                  </span>
                )}
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-black border flex items-center gap-0.5 ${trafficBadge.bg}`}
                  title={trafficLabel}
                >
                  <span>{trafficBadge.icon}</span>
                  <span>{trafficBadge.text}</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium truncate">
                Chủ: <strong className="text-amber-300">{shopInfo?.ownerName || shopSpec.ownerTitle}</strong> • <span className="text-slate-400">{trafficLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] text-slate-400 font-bold block uppercase">Số dư</span>
              <span className="text-xs font-black text-amber-300">{formatVND(store.money)}</span>
            </div>
            <button
              onClick={() => store.closeModal()}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= 2-COLUMN LANDSCAPE SPLIT BODY ================= */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* ----------------- CỘT TRÁI (40%): DANH SÁCH NGHIỆP VỤ & NÂNG CẤP ----------------- */}
          <div className="col-span-5 border-r border-slate-800 bg-slate-900/40 p-2 sm:p-2.5 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
            {/* KPI Thống Kê Kinh Doanh Trong Ngày */}
            <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-1.5 shadow-sm shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  Kinh Doanh Hôm Nay
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-black border flex items-center gap-1 ${trafficBadge.bg}`}
                >
                  <span>{trafficBadge.icon}</span>
                  <span>{trafficBadge.text}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[9px] font-semibold text-slate-400 flex items-center gap-1 truncate">
                    <Package className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Hàng hóa bán ra</span>
                  </div>
                  <div className="text-xs font-black text-white mt-0.5">
                    {dailyItemsSold} <span className="text-[9px] text-slate-400 font-normal">món/đơn</span>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <div className="text-[9px] font-semibold text-slate-400 flex items-center gap-1 truncate">
                    <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Tiền bán hôm nay</span>
                  </div>
                  <div className="text-xs font-black text-amber-300 mt-0.5">
                    {formatVND(totalDailyRevenue)}
                  </div>
                </div>
              </div>

              {dailyBonusIncome > 0 && (
                <div className="text-[9px] text-emerald-400 font-medium flex items-center justify-between px-0.5">
                  <span className="text-slate-400">Hoa hồng thụ động:</span>
                  <span className="font-bold">+{formatVND(dailyBonusIncome)}/ngày</span>
                </div>
              )}
            </div>
            {/* If shop is unowned: Unlock Callout */}
            {!isOwned && shopInfo && (
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center">
                <div className="text-xs font-black text-amber-300 mb-1">Mặt Bằng Chưa Mở Khóa</div>
                <button
                  onClick={handleBuyShop}
                  className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow active:scale-95 transition"
                >
                  Mở Khóa ({formatVND(shopInfo.unlockCost)})
                </button>
              </div>
            )}

            {/* Bánh Mì Quick Link */}
            {shopId === 'banh_mi' && (
              <button
                onClick={() => store.openCookingStation()}
                className="w-full p-2 rounded-xl bg-orange-950/40 hover:bg-orange-900/50 border border-orange-500/40 flex items-center justify-between text-left transition active:scale-95"
              >
                <div className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-xs font-black text-white">Vào Bếp Nấu Bánh Mì</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
              </button>
            )}

            {/* Shop Upgrade Bar */}
            {isOwned && shopInfo && shopLevel < MAX_SHOP_LEVEL && (() => {
              const nextLevel = shopLevel + 1;
              const upgradeCost = getShopUpgradeCost(shopInfo, shopLevel);
              const reqLevel = getShopUpgradeRequiredLevel(shopInfo, shopLevel);
              const canUpgrade = store.level >= reqLevel && store.money >= upgradeCost;

              return (
                <div className="p-1.5 rounded-xl bg-sky-950/30 border border-sky-500/30 flex items-center justify-between gap-1 text-[10px]">
                  <div className="min-w-0">
                    <span className="font-bold text-sky-300 block truncate">
                      Nâng Cấp Cấp {nextLevel}/{MAX_SHOP_LEVEL}
                    </span>
                    <span className="text-slate-400">+{formatVND(upgradeCost)}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (store.upgradeShop(shopId)) sounds.playLevelUp();
                    }}
                    disabled={!canUpgrade}
                    className={`px-2 py-1 rounded-lg font-black text-[10px] transition shrink-0 ${
                      canUpgrade
                        ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Nâng Cấp
                  </button>
                </div>
              );
            })()}

            {/* Staff Assignment Bar */}
            {isOwned && (
              <div className="p-1.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-1 text-[10px]">
                <div className="flex items-center gap-1 min-w-0">
                  <Users className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="font-bold text-purple-300 truncate">
                    {assignedStaff ? assignedStaff.name : 'Chưa có NV'}
                  </span>
                </div>
                <button
                  onClick={handleOpenStaffManagement}
                  className="px-2 py-0.5 rounded-lg bg-purple-600/60 hover:bg-purple-600 text-white font-bold text-[9px] shrink-0"
                >
                  Đổi NV
                </button>
              </div>
            )}

            {/* Services List Header */}
            <div className="text-[10px] font-black uppercase text-slate-400 px-1 pt-1">
              Chọn Nghiệp Vụ ({shopSpec.services.length})
            </div>

            {/* Services List (Master view) */}
            <div className="space-y-1">
              {shopSpec.services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                const isRequested = store.shopCustomerRequests[shopId]?.serviceId === service.id;

                return (
                  <button
                    key={service.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedService(service);
                    }}
                    className={`w-full p-2 rounded-xl border text-left transition flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                        : isRequested
                          ? 'bg-rose-950/40 border-rose-500/60 text-slate-200 animate-pulse'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base shrink-0">{service.icon}</span>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs block truncate text-white">
                          {service.name}
                        </span>
                        <span className="text-[9px] text-slate-400 block truncate">
                          {service.category} • {service.durationSeconds}s
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-black text-emerald-400 block">
                        +{formatVND(service.payout)}
                      </span>
                      {isRequested && (
                        <span className="text-[8px] font-black bg-rose-500 text-white px-1 rounded">
                          Khách chờ
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ----------------- CỘT PHẢI (60%): ĐẤU TRƯỜNG THAO TÁC SỰ KIỆN ----------------- */}
          <div className="col-span-7 p-2 sm:p-2.5 flex flex-col min-h-0 bg-slate-950 overflow-hidden">
            {/* Case 1: Result Screen */}
            {completedResult ? (
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 text-center animate-fadeIn">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl mb-1.5 animate-bounce">
                  {completedResult.isPerfect ? '⭐' : '🎉'}
                </div>
                <h3 className="text-sm font-black text-amber-300 mb-0.5">
                  {completedResult.isPerfect ? 'THAO TÁC HOÀN HẢO! (+40%)' : 'HOÀN THÀNH TỐT!'}
                </h3>
                <p className="text-[11px] text-slate-300 mb-2">
                  Khách hàng vô cùng hài lòng với tay nghề của tiệm.
                </p>

                <div className="flex gap-3 mb-3">
                  <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[9px] text-slate-400 block font-bold">Thù lao nhận</span>
                    <span className="text-xs font-black text-emerald-400">
                      +{formatVND(completedResult.payout)}
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[9px] text-slate-400 block font-bold">Kinh nghiệm</span>
                    <span className="text-xs font-black text-amber-400">
                      +{completedResult.xp} XP
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setCompletedResult(null)}
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow active:scale-95 transition"
                >
                  Tiếp Tục Phục Vụ
                </button>
              </div>
            ) : isServing && activeService ? (
              /* Case 2: Active Minigame In Progress */
              <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 animate-fadeIn">
                <div className="text-center shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[9px] font-black uppercase mb-0.5">
                    <Zap className="w-2.5 h-2.5 animate-spin" /> Đang thao tác tay nghề...
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center justify-center gap-1.5">
                    <span>{activeService.icon}</span>
                    <span>{activeService.name}</span>
                  </h3>
                </div>

                {/* 3 Steps Indicator */}
                <div className="grid grid-cols-3 gap-1 shrink-0">
                  {activeService.stepNames.map((step, idx) => {
                    const isCur = currentStepIndex === idx;
                    const isDone = currentStepIndex > idx;
                    return (
                      <div
                        key={idx}
                        className={`p-1 rounded-lg border text-center transition ${
                          isCur
                            ? 'border-orange-500 bg-orange-500/20 text-orange-200 font-bold shadow'
                            : isDone
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                              : 'border-slate-800 bg-slate-900/60 text-slate-500'
                        }`}
                      >
                        <div className="text-[8px] uppercase">Bước {idx + 1}</div>
                        <div className="text-[9px] truncate">{step}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Golden Sweet Spot Bar */}
                <div className="my-0.5 shrink-0">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 mb-0.5">
                    <span>Tiến trình hoàn thiện</span>
                    <span className="text-amber-400 font-mono">{Math.round(progress)}%</span>
                  </div>

                  <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                    {/* Golden Zone */}
                    <div
                      className="absolute top-0 bottom-0 bg-amber-400/40 border-x-2 border-amber-300 animate-pulse flex items-center justify-center"
                      style={{
                        left: `${targetSweetSpot.min}%`,
                        width: `${targetSweetSpot.max - targetSweetSpot.min}%`,
                      }}
                    >
                      <span className="text-[8px] font-black text-amber-200 uppercase tracking-tighter">
                        VÙNG VÀNG (+40%)
                      </span>
                    </div>

                    {/* Progress Fill */}
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Big Action Button under Right Thumb */}
                <button
                  onClick={handlePerfectClick}
                  className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide shadow-lg shadow-orange-950/50 active:scale-95 transition shrink-0"
                >
                  🎯 HOÀN TẤT THAO TÁC (CHẠM VÙNG VÀNG)
                </button>
              </div>
            ) : selectedService ? (
              /* Case 3: Master Service Detail & Start Action */
              <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5">
                <div className="overflow-y-auto custom-scrollbar pr-0.5 flex flex-col gap-1 min-h-0">
                  {/* Customer Banner if this service is requested */}
                  {store.shopCustomerRequests[shopId]?.serviceId === selectedService.id && (
                    <div className="p-1.5 rounded-lg bg-amber-950/50 border border-amber-500/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-lg animate-bounce shrink-0">
                          {store.shopCustomerRequests[shopId].serviceIcon}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[9px] font-black text-amber-400 uppercase">
                            Khách Hàng Đang Đợi
                          </div>
                          <div className="text-[11px] font-bold text-white truncate">
                            &ldquo;{store.shopCustomerRequests[shopId].customerQuote}&rdquo;
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                        +{formatVND(store.shopCustomerRequests[shopId].payout)}
                      </span>
                    </div>
                  )}

                  {/* Service Presentation */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {selectedService.icon}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-black text-white truncate">
                        {selectedService.name}
                      </h3>
                      <p className="text-[10px] text-slate-400">{selectedService.category}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    {selectedService.description}
                  </p>

                  {/* 3 Steps Overview */}
                  <div>
                    <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">
                      Quy trình thực hiện:
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {selectedService.stepNames.map((st, i) => (
                        <div
                          key={i}
                          className="p-1 rounded-md bg-slate-900/80 border border-slate-800 text-[9px] text-slate-300 text-center"
                        >
                          <span className="text-amber-400 font-bold block text-[8px]">Bước {i + 1}</span>
                          <span className="truncate block">{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rewards summary */}
                  <div className="flex gap-1.5">
                    <div className="flex-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[8px] font-bold">Thù lao</span>
                      <span className="font-black text-emerald-400 text-[10px]">
                        +{formatVND(selectedService.payout)}
                      </span>
                    </div>
                    <div className="flex-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[8px] font-bold">Thời gian</span>
                      <span className="font-black text-white text-[10px]">
                        {selectedService.durationSeconds}s
                      </span>
                    </div>
                    <div className="flex-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-center">
                      <span className="text-slate-400 block text-[8px] font-bold">Kinh nghiệm</span>
                      <span className="font-black text-amber-400 text-[10px]">
                        +{selectedService.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compact Start Button pinned to bottom - Never Overflows */}
                <button
                  onClick={() => handleStartService(selectedService)}
                  disabled={!isOwned}
                  className={`w-full py-2 sm:py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wide shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 shrink-0 ${
                    !isOwned
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 shadow-orange-950/40 hover:from-orange-400 hover:to-yellow-400'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="truncate">BẮT ĐẦU THAO TÁC NGHỀ NGHIỆP</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
