import React, { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { STREET_SHOPS } from '../data/shops';
import { INITIAL_STAFF } from '../data/staff';
import { RECIPE_MAP } from '../data/recipes';
import { sounds } from '../audio/soundSystem';
import {
  formatVND,
  getTimeOfDayLabel,
  getWeatherLabel,
  calculateLevelFromXP,
} from '../utils/formatters';
import {
  Store,
  Users,
  Smartphone,
  ChefHat,
  Bell,
  Bot,
  FastForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Star,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  UserPlus,
} from 'lucide-react';

export const ExecutiveSidebar: React.FC = () => {
  const store = useGameStore();

  // Desktop vs Mobile layout detection
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active sub-tab in sidebar (SHOPS or ORDERS)
  const [activeTab, setActiveTab] = useState<'SHOPS' | 'ORDERS'>('SHOPS');

  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsDrawerOpen(true);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const timeInfo = getTimeOfDayLabel(store.timeOfDay);
  const weatherInfo = getWeatherLabel(store.weather);
  const { currentXP, xpForNext, progress } = calculateLevelFromXP(store.xp);

  // Unlocked shops
  const unlockedShops = STREET_SHOPS.filter(
    (shop) => (store.shopLevels[shop.id] || (shop.id === 'banh_mi' ? 1 : 0)) > 0,
  );

  // Hired staff
  const hiredStaff = INITIAL_STAFF.filter((s) => store.staff[s.id]);
  const idleStaffCount = hiredStaff.filter((s) => !store.staffAssignments?.[s.id]).length;

  // Waiting customer requests across all branch shops
  const waitingShopIds = Object.keys(store.shopCustomerRequests || {});
  const totalWaitingCustomers = waitingShopIds.length;

  // Active food orders
  const activeOrders = store.orders || [];
  const hasReadyOrder = activeOrders.some((o) => o.status === 'READY');
  const hasClaimableQuest = store.quests.some((q) => q.completed && !q.claimed);

  const toggleSound = () => {
    const nextState = !store.settings.soundEnabled;
    store.updateSettings({ soundEnabled: nextState, musicEnabled: nextState });
    sounds.playClick();
  };

  const cycleSpeed = (spd: number) => {
    store.updateSettings({ gameSpeed: spd });
    sounds.playClick();
  };

  const toggleFullscreen = async () => {
    sounds.playClick();
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          (document.documentElement as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.log('Fullscreen toggle error:', err);
    }
  };

  const handleOpenShop = (shopId: string) => {
    sounds.playClick();
    const req = store.shopCustomerRequests[shopId];
    store.openShopWorkstation(shopId, req?.serviceId);
    if (isMobile) setIsDrawerOpen(false);
  };

  const handleOpenStaffManagement = () => {
    sounds.playClick();
    store.openModal('SMARTPHONE', 'STAFF');
    if (isMobile) setIsDrawerOpen(false);
  };

  // Mobile trigger button when sidebar is closed
  const renderMobileTrigger = () => (
    <div className="fixed top-2 left-2 z-30 flex items-center gap-1.5 pointer-events-auto select-none lg:hidden">
      <button
        onClick={() => {
          sounds.playClick();
          setIsDrawerOpen(true);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white border border-amber-500/60 shadow-xl backdrop-blur-md active:scale-95 transition"
      >
        <Menu className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-black text-amber-300">
          {formatVND(store.money)}
        </span>
        {(totalWaitingCustomers > 0 || hasReadyOrder || hasClaimableQuest) && (
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Quick fullscreen toggle on mobile */}
      <button
        onClick={toggleFullscreen}
        className="p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow backdrop-blur-md active:scale-95 transition"
        title="Toàn màn hình"
      >
        {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Trigger Pill */}
      {isMobile && !isDrawerOpen && renderMobileTrigger()}

      {/* Backdrop for Mobile Drawer */}
      {isMobile && isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* The Unified Executive Sidebar Dashboard */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 sm:w-72 bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/90 flex flex-col justify-between select-none shadow-2xl transition-transform duration-300 ${
          isMobile
            ? isDrawerOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : 'translate-x-0'
        }`}
      >
        {/* ================= 1. HEADER: BRAND & FINANCIAL DASHBOARD ================= */}
        <div className="p-3 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
          {/* Top row with Close (mobile) and Fullscreen toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🥖</span>
              <span className="font-black text-xs uppercase tracking-wider text-amber-400">
                Sài Gòn Hàng Rong
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleFullscreen}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              </button>

              {isMobile && (
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Money Balance Card */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-600/90 via-yellow-600/90 to-amber-500/90 border border-yellow-300/40 shadow-lg shadow-amber-950/50 text-white flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-amber-100 font-extrabold uppercase tracking-wider">
                Vốn Kinh Doanh
              </span>
              <span className="text-base sm:text-lg font-black tracking-wide text-white drop-shadow">
                {formatVND(store.money)}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-lg shadow-inner">
              💵
            </div>
          </div>

          {/* Level, XP & Reputation Stars */}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {/* Level Card */}
            <div className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">Cấp Độ</span>
                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-1 rounded">
                  Lv.{store.level}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Reputation Card */}
            <div className="p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400">Uy Tín</span>
                <span className="text-xs font-black text-white">
                  {store.reputationRating.toFixed(1)} / 5.0
                </span>
              </div>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
            </div>
          </div>

          {/* Business Timeline (Day & Weather) */}
          <div className="mt-2 p-2 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-orange-400 text-xs">📅 N.{store.day}</span>
              <span className="text-slate-500">•</span>
              <div className="flex items-center gap-1 text-slate-200">
                <span>{timeInfo.icon}</span>
                <span className="font-semibold text-[11px]">{timeInfo.label.split(' ')[0]}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sky-300 text-[11px]">
              <span>{weatherInfo.icon}</span>
              <span className="truncate max-w-[70px]">{weatherInfo.label}</span>
            </div>
          </div>
        </div>

        {/* ================= 2. BODY TABS: STORES & ORDERS ================= */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Navigation Sub-Tabs */}
          <div className="px-3 pt-2 pb-1.5 flex gap-1 border-b border-slate-800/60 bg-slate-900/40">
            <button
              onClick={() => setActiveTab('SHOPS')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'SHOPS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Chuỗi Quán ({unlockedShops.length})</span>
              {totalWaitingCustomers > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'ORDERS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Đơn Chờ ({activeOrders.length})</span>
              {hasReadyOrder && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          </div>

          {/* TAB 1: SHOPS OVERVIEW */}
          {activeTab === 'SHOPS' && (
            <div className="flex-1 p-2 overflow-y-auto space-y-1.5 custom-scrollbar min-h-0">
              {/* Idle Staff Notice */}
              {idleStaffCount > 0 && (
                <div
                  onClick={handleOpenStaffManagement}
                  className="px-2.5 py-1.5 bg-purple-950/60 border border-purple-500/30 rounded-xl flex items-center justify-between cursor-pointer hover:bg-purple-900/70 transition text-[11px]"
                >
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <UserPlus className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{idleStaffCount} NV đang rảnh</span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-bold underline flex items-center gap-0.5">
                    Phân công <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              )}

              {/* Shop Items */}
              {unlockedShops.map((shop) => {
                const level = store.shopLevels[shop.id] || (shop.id === 'banh_mi' ? 1 : 0);
                const waitingRequest = store.shopCustomerRequests?.[shop.id];
                const assignedMember = hiredStaff.find(
                  (s) => store.staffAssignments?.[s.id] === shop.id,
                );

                return (
                  <div
                    key={shop.id}
                    onClick={() => handleOpenShop(shop.id)}
                    className={`group p-2 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      waitingRequest
                        ? 'bg-rose-950/40 border-rose-500/60 hover:border-rose-400 hover:bg-rose-900/50 shadow-md shadow-rose-950/40 animate-pulse'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base shrink-0">{shop.icon}</span>
                        <span className="font-extrabold text-xs text-white truncate block">
                          {shop.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 border border-amber-500/20 shrink-0">
                        Cấp {level}
                      </span>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                      {waitingRequest ? (
                        <div className="flex items-center gap-1 text-rose-300 font-bold min-w-0">
                          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0 animate-bounce" />
                          <span className="truncate">{waitingRequest.serviceName}</span>
                        </div>
                      ) : assignedMember ? (
                        <div className="flex items-center gap-1 text-emerald-300 min-w-0">
                          <span className="shrink-0">{assignedMember.avatar}</span>
                          <span className="truncate font-semibold text-[10px]">
                            {assignedMember.name} (Tự phục vụ)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Đang chờ khách ghé</span>
                        </div>
                      )}

                      {waitingRequest ? (
                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-1 rounded shrink-0">
                          +{formatVND(waitingRequest.payout)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 group-hover:text-amber-400 font-semibold flex items-center gap-0.5 shrink-0">
                          Mở trạm <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ACTIVE ORDERS QUEUE */}
          {activeTab === 'ORDERS' && (
            <div className="flex-1 p-2 overflow-y-auto space-y-1.5 custom-scrollbar min-h-0">
              {activeOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-4 text-center text-slate-500 text-xs">
                  <span className="text-2xl mb-1">🥖</span>
                  <span className="font-bold">Chưa có khách chờ tại xe</span>
                  <span className="text-[11px] text-slate-600 mt-0.5">
                    Rung chuông hoặc đợi khách ghé vỉa hè
                  </span>
                  <button
                    onClick={() => {
                      sounds.playBell();
                      store.spawnCustomerOrder();
                    }}
                    className="mt-3 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-xl font-bold text-xs transition"
                  >
                    🔔 Mời khách ngay
                  </button>
                </div>
              ) : (
                activeOrders.map((order) => {
                  const item = order.items[0];
                  const recipe = item ? RECIPE_MAP[item.recipeId] : null;
                  const isReady = order.status === 'READY';
                  const maxWait = order.maxWaitSeconds || 45;
                  const remainWait = order.remainingSeconds ?? maxWait;
                  const patiencePercent = Math.max(
                    0,
                    Math.min(100, (remainWait / maxWait) * 100),
                  );

                  return (
                    <div
                      key={order.id}
                      onClick={() => {
                        sounds.playClick();
                        if (isReady) {
                          store.serveOrder(order.id);
                        } else {
                          store.openCookingStation(item?.recipeId);
                        }
                        if (isMobile) setIsDrawerOpen(false);
                      }}
                      className={`p-2 rounded-xl border transition cursor-pointer ${
                        isReady
                          ? 'bg-emerald-950/60 border-emerald-500/80 shadow-md shadow-emerald-950/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-base shrink-0">{recipe?.icon || '🥖'}</span>
                          <div className="min-w-0">
                            <span className="font-extrabold text-xs text-white truncate block">
                              {recipe?.name || 'Món ăn vặt'}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              Khách: {order.customerName}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            isReady
                              ? 'bg-emerald-500 text-slate-950 animate-bounce'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {isReady ? 'GIAO NGAY' : formatVND(order.totalPrice)}
                        </span>
                      </div>

                      {/* Patience Timer Bar */}
                      {!isReady && (
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              patiencePercent > 50
                                ? 'bg-emerald-400'
                                : patiencePercent > 20
                                ? 'bg-amber-400'
                                : 'bg-rose-500 animate-pulse'
                            }`}
                            style={{ width: `${patiencePercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ================= 3. FOOTER: EXECUTIVE ACTION DOCK ================= */}
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/95 flex flex-col gap-1.5">
          {/* Main Action Buttons: Smartphone & Cooking */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                sounds.playClick();
                store.openModal('SMARTPHONE');
                if (isMobile) setIsDrawerOpen(false);
              }}
              className="relative flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 text-white font-extrabold text-xs shadow-md shadow-orange-950/50 border border-orange-300/30 active:scale-95 transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Điện Thoại</span>
              {hasClaimableQuest && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                store.openCookingStation();
                if (isMobile) setIsDrawerOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-extrabold text-xs shadow-md shadow-amber-950/50 border border-amber-300/30 active:scale-95 transition"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Nấu Ăn</span>
            </button>
          </div>

          {/* Quick Utility Strip: Bell, Auto, Speed, Sound */}
          <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-800/60">
            {/* Call Customer Bell */}
            <button
              onClick={() => {
                sounds.playBell();
                store.spawnCustomerOrder();
              }}
              className="py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold transition active:scale-95"
              title="Mời khách"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Mời</span>
            </button>

            {/* Auto Mode Toggle */}
            <button
              onClick={() => {
                sounds.playClick();
                store.toggleAutoMode();
              }}
              className={`py-1.5 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold transition active:scale-95 ${
                store.autoMode
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
              title="Tự động"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{store.autoMode ? 'Auto BẬT' : 'Thủ công'}</span>
            </button>

            {/* Speed Cycle */}
            <button
              onClick={() => {
                const next = store.settings.gameSpeed === 1 ? 1.5 : store.settings.gameSpeed === 1.5 ? 2 : 1;
                cycleSpeed(next);
              }}
              className="py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold transition active:scale-95"
              title="Tốc độ game"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              <span>{store.settings.gameSpeed}x</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold transition active:scale-95"
              title="Âm thanh"
            >
              {store.settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>{store.settings.soundEnabled ? 'Bật' : 'Tắt'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
