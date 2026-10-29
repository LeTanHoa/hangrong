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
  Menu,
  X,
  ChevronRight,
  UserPlus,
  Music,
  SkipForward,
} from 'lucide-react';

export const ExecutiveSidebar: React.FC = () => {
  const store = useGameStore();

  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [activeTab, setActiveTab] = useState<'SHOPS' | 'ORDERS'>('SHOPS');
  const [currentTrackName, setCurrentTrackName] = useState(() => sounds.currentTrack.name);

  const handleNextTrack = () => {
    sounds.playClick();
    const next = sounds.nextTrack();
    setCurrentTrackName(next.name);
    store.addToast('Đổi bài nhạc', `🎵 ${next.name}: ${next.desc}`, 'info');
  };

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
  const { progress } = calculateLevelFromXP(store.xp);

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
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white border border-amber-500/60 shadow-xl backdrop-blur-md active:scale-95 transition"
      >
        <Menu className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-black text-amber-300">
          {formatVND(store.money)}
        </span>
        {(totalWaitingCustomers > 0 || hasReadyOrder || hasClaimableQuest) && (
          <span className="w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white animate-pulse" />
        )}
      </button>

      <button
        onClick={toggleFullscreen}
        className="p-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow backdrop-blur-md active:scale-95 transition"
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
        {/* ================= 1. ULTRA-COMPACT HEADER ================= */}
        <div className="p-2 sm:p-2.5 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shrink-0">
          {/* Brand Row + Close Button */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🥖</span>
              <span className="font-black text-xs uppercase tracking-wider text-amber-400">
                Sài Gòn Hàng Rong
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleFullscreen}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
              >
                {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
              </button>

              {isMobile && (
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Compact Money Balance Bar */}
          <div className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/90 via-yellow-600/90 to-amber-500/90 border border-yellow-300/40 shadow text-white flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">💵</span>
              <span className="text-xs sm:text-sm font-black tracking-wide text-white drop-shadow">
                {formatVND(store.money)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-200 font-bold">
              <span>Cấp {store.level}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-white">
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                {store.reputationRating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Slim Timeline Row (Day & Weather) */}
          <div className="mt-1 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-[10px] text-slate-300">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-orange-400">📅 N.{store.day}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-0.5">
                {timeInfo.icon} {timeInfo.label.split(' ')[0]}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sky-300">
              <span>{weatherInfo.icon}</span>
              <span className="truncate max-w-[80px]">{weatherInfo.label}</span>
            </div>
          </div>
        </div>

        {/* ================= 2. BODY TABS: STORES & ORDERS ================= */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Navigation Sub-Tabs */}
          <div className="px-2 pt-1.5 pb-1 flex gap-1 border-b border-slate-800/60 bg-slate-900/40 shrink-0">
            <button
              onClick={() => setActiveTab('SHOPS')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-black transition ${
                activeTab === 'SHOPS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Chuỗi Quán ({unlockedShops.length})</span>
              {totalWaitingCustomers > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-black transition ${
                activeTab === 'ORDERS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ChefHat className="w-3 h-3" />
              <span>Đơn Chờ ({activeOrders.length})</span>
              {hasReadyOrder && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          </div>

          {/* TAB 1: SHOPS OVERVIEW */}
          {activeTab === 'SHOPS' && (
            <div className="flex-1 p-1.5 overflow-y-auto space-y-1 custom-scrollbar min-h-0">
              {idleStaffCount > 0 && (
                <div
                  onClick={handleOpenStaffManagement}
                  className="px-2 py-1 bg-purple-950/60 border border-purple-500/30 rounded-lg flex items-center justify-between cursor-pointer hover:bg-purple-900/70 transition text-[10px]"
                >
                  <div className="flex items-center gap-1 text-purple-300 font-bold">
                    <UserPlus className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>{idleStaffCount} NV đang rảnh</span>
                  </div>
                  <span className="text-purple-400 font-bold underline flex items-center gap-0.5">
                    Phân công <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              )}

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
                    className={`group p-1.5 rounded-xl border transition-all cursor-pointer relative ${
                      waitingRequest
                        ? 'bg-rose-950/40 border-rose-500/60 hover:border-rose-400 shadow-sm animate-pulse'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm shrink-0">{shop.icon}</span>
                        <span className="font-extrabold text-[11px] text-white truncate block">
                          {shop.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-black px-1 rounded bg-slate-800 text-amber-400 border border-amber-500/20 shrink-0">
                        Cấp {level}
                      </span>
                    </div>

                    <div className="mt-1 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      {waitingRequest ? (
                        <div className="flex items-center gap-1 text-rose-300 font-bold min-w-0">
                          <AlertCircle className="w-3 h-3 text-rose-400 shrink-0 animate-bounce" />
                          <span className="truncate">{waitingRequest.serviceName}</span>
                        </div>
                      ) : assignedMember ? (
                        <div className="flex items-center gap-1 text-emerald-300 min-w-0">
                          <span className="shrink-0">{assignedMember.avatar}</span>
                          <span className="truncate font-semibold text-[9px]">
                            {assignedMember.name} (Tự phục vụ)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400 text-[9px]">
                          <Clock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                          <span>Đang chờ khách</span>
                        </div>
                      )}

                      {waitingRequest ? (
                        <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-1 rounded shrink-0">
                          +{formatVND(waitingRequest.payout)}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500 group-hover:text-amber-400 font-semibold flex items-center gap-0.5 shrink-0">
                          Mở <ExternalLink className="w-2 h-2" />
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
            <div className="flex-1 p-1.5 overflow-y-auto space-y-1 custom-scrollbar min-h-0">
              {activeOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-3 text-center text-slate-500 text-[11px]">
                  <span className="text-xl mb-1">🥖</span>
                  <span className="font-bold">Chưa có khách chờ tại xe</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      store.spawnCustomerOrder();
                    }}
                    className="mt-2 px-2.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-lg font-bold text-[10px] transition"
                  >
                    Mời khách ngay
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
                      className={`p-1.5 rounded-xl border transition cursor-pointer ${
                        isReady
                          ? 'bg-emerald-950/60 border-emerald-500/80 shadow-sm'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0">{recipe?.icon || '🥖'}</span>
                          <div className="min-w-0">
                            <span className="font-extrabold text-[11px] text-white truncate block">
                              {recipe?.name || 'Món ăn vặt'}
                            </span>
                            <span className="text-[9px] text-slate-400 truncate block">
                              {order.customerName}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded shrink-0 ${
                            isReady
                              ? 'bg-emerald-500 text-slate-950 animate-bounce'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {isReady ? 'GIAO' : formatVND(order.totalPrice)}
                        </span>
                      </div>

                      {!isReady && (
                        <div className="w-full bg-slate-800 h-0.5 rounded-full overflow-hidden mt-1">
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

        {/* ================= 3. ULTRA-SLIM FOOTER ACTION DOCK ================= */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-900/95 flex flex-col gap-1 shrink-0">
          {/* Main Action Buttons */}
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => {
                sounds.playClick();
                store.openModal('SMARTPHONE');
                if (isMobile) setIsDrawerOpen(false);
              }}
              className="relative flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-orange-600 to-rose-600 text-white font-extrabold text-xs shadow active:scale-95 transition"
            >
              <Smartphone className="w-3 h-3" />
              <span>Điện Thoại</span>
              {hasClaimableQuest && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white animate-pulse" />
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                store.openCookingStation();
                if (isMobile) setIsDrawerOpen(false);
              }}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-extrabold text-xs shadow active:scale-95 transition"
            >
              <ChefHat className="w-3 h-3" />
              <span>Nấu Ăn</span>
            </button>
          </div>

          {/* Mini BGM Music Bar */}
          <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[9px] text-slate-300">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-amber-400">🎵</span>
              <span className="truncate font-semibold text-white">{currentTrackName}</span>
            </div>
            <button
              onClick={handleNextTrack}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 ml-1 shrink-0 px-1 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 transition active:scale-95"
              title="Chuyển sang bài nhạc khác"
            >
              <span>Đổi bài</span>
              <SkipForward className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Utility Buttons: Bell, Auto, Speed, Sound */}
          <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-800/50">
            <button
              onClick={() => {
                sounds.playClick();
                store.spawnCustomerOrder();
              }}
              className="py-1 rounded-md bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white flex flex-col items-center justify-center text-[8px] font-bold transition active:scale-95"
              title="Mời khách"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>Mời</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                store.toggleAutoMode();
              }}
              className={`py-1 rounded-md flex flex-col items-center justify-center text-[8px] font-bold transition active:scale-95 ${
                store.autoMode
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
              title="Tự động"
            >
              <Bot className="w-3 h-3" />
              <span>{store.autoMode ? 'Auto' : 'Thủ công'}</span>
            </button>

            <button
              onClick={() => {
                const next = store.settings.gameSpeed === 1 ? 1.5 : store.settings.gameSpeed === 1.5 ? 2 : 1;
                cycleSpeed(next);
              }}
              className="py-1 rounded-md bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white flex flex-col items-center justify-center text-[8px] font-bold transition active:scale-95"
              title="Tốc độ"
            >
              <FastForward className="w-3 h-3 text-amber-400" />
              <span>{store.settings.gameSpeed}x</span>
            </button>

            <button
              onClick={toggleSound}
              className="py-1 rounded-md bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white flex flex-col items-center justify-center text-[8px] font-bold transition active:scale-95"
              title="Âm thanh"
            >
              {store.settings.soundEnabled ? (
                <Volume2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <VolumeX className="w-3 h-3 text-rose-400" />
              )}
              <span>{store.settings.soundEnabled ? 'Bật' : 'Tắt'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
