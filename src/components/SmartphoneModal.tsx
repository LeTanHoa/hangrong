import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { INITIAL_INGREDIENTS, INGREDIENT_MAP } from '../data/ingredients';
import { INITIAL_RECIPES, RECIPE_MAP } from '../data/recipes';
import { CART_UPGRADES, EQUIPMENT_UPGRADES } from '../data/cartUpgrades';
import { INITIAL_STAFF } from '../data/staff';
import { STREET_SHOPS, MAX_SHOP_LEVEL, getShopPrerequisite, getShopUpgradeCost, getShopUpgradeRequiredLevel, getRequiredReputationForShop, getRequiredCartTierForShop } from '../data/shops';
import { LOCATIONS, LOCATION_MAP } from '../data/locations';
import { formatVND } from '../utils/formatters';
import { SaveSystem } from '../saves/saveSystem';
import {
  X,
  ShoppingCart,
  BookOpen,
  Truck,
  Users,
  MapPin,
  TrendingUp,
  Award,
  Settings as SettingsIcon,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Lock,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Store,
  Search,
} from 'lucide-react';
import { sounds } from '../audio/soundSystem';

export const SmartphoneModal: React.FC = () => {
  const store = useGameStore();
  const currentApp = store.smartphoneApp || 'MARKET';

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [marketSearchQuery, setMarketSearchQuery] = useState<string>('');
  const [purchaseQtys, setPurchaseQtys] = useState<Record<string, number>>({});
  const [staffFilter, setStaffFilter] = useState<'ALL' | 'HIRED' | 'AVAILABLE'>('ALL');

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  const setQty = (id: string, delta: number) => {
    setPurchaseQtys((prev) => {
      const cur = prev[id] || 1;
      const next = Math.max(1, Math.min(999, cur + delta));
      return { ...prev, [id]: next };
    });
  };

  const setDirectQty = (id: string, val: string) => {
    if (val === '') {
      setPurchaseQtys((prev) => ({ ...prev, [id]: 1 }));
      return;
    }
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      const next = Math.max(1, Math.min(999, parsed));
      setPurchaseQtys((prev) => ({ ...prev, [id]: next }));
    }
  };

  const getQty = (id: string) => purchaseQtys[id] || 1;

  // Export Save File
  const handleExportSave = () => {
    const jsonStr = SaveSystem.exportSaveJSON({
      version: 1,
      timestamp: Date.now(),
      player: {
        name: store.playerName,
        level: store.level,
        xp: store.xp,
        xpForNextLevel: 100,
        money: store.money,
        lifetimeEarnings: store.lifetimeEarnings,
        reputationRating: store.reputationRating,
        gender: store.gender,
        outfitColor: '#ea580c',
      },
      time: {
        day: store.day,
        timeOfDay: store.timeOfDay,
        weather: store.weather,
        dayProgressPercent: store.dayProgress,
      },
      currentLocationId: store.currentLocationId,
      unlockedLocations: store.unlockedLocations,
      cartTier: store.cartTier,
      maxCartTier: store.maxCartTier,
      shopLevels: store.shopLevels,
      inventory: store.inventory,
      unlockedRecipes: store.unlockedRecipes,
      equipment: store.equipment,
      staff: store.staff,
      quests: store.quests,
      achievements: store.achievements,
      financialHistory: store.financialHistory,
      currentDayStats: store.currentDayStats,
      settings: store.settings,
      tutorialCompleted: store.tutorialCompleted,
      tutorialStep: store.tutorialStep,
    });

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HangRong_Save_Day${store.day}_Level${store.level}.json`;
    a.click();
    URL.revokeObjectURL(url);
    store.addToast('Đã sao lưu game!', 'File dữ liệu đã được tải về máy của bạn.', 'success');
  };

  const handleImportSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const parsed = SaveSystem.parseSaveJSON(text);
      if (parsed) {
        await SaveSystem.saveGame(parsed);
        store.addToast('Nạp dữ liệu thành công!', 'Đang tải lại game...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        store.addToast('Lỗi file!', 'File save không đúng định dạng chuẩn.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const navApps = [
    { id: 'MARKET', label: 'Chợ Đầu Mối', icon: ShoppingCart, color: 'text-emerald-400' },
    { id: 'RECIPES', label: 'Sổ Món Ăn', icon: BookOpen, color: 'text-amber-400' },
    { id: 'UPGRADES', label: 'Nâng Cấp Xe', icon: Truck, color: 'text-cyan-400' },
    { id: 'SHOPS', label: 'Cửa Hàng', icon: Store, color: 'text-orange-400' },
    { id: 'STAFF', label: 'Tuyển Dụng', icon: Users, color: 'text-purple-400' },
    { id: 'MAP', label: 'Bản Đồ Phố', icon: MapPin, color: 'text-rose-400' },
    { id: 'FINANCE', label: 'Sổ Thu Chi', icon: TrendingUp, color: 'text-blue-400' },
    { id: 'QUESTS', label: 'Nhiệm Vụ', icon: Award, color: 'text-yellow-400' },
    { id: 'SETTINGS', label: 'Cài Đặt', icon: SettingsIcon, color: 'text-slate-400' },
  ];

  const totalItems = store.getTotalStoredItemsCount();
  const maxStorage = store.getMaxStorageCapacity();
  const currentCart = CART_UPGRADES.find((cart) => cart.tier === store.cartTier) || CART_UPGRADES[0];
  const nextCart = CART_UPGRADES.find((cart) => cart.tier === store.maxCartTier + 1);
  const canBuyNextCart = !!nextCart && store.level >= nextCart.requiredLevel && store.money >= nextCart.cost;
  const ownedShopCount = STREET_SHOPS.filter((shop) => (store.shopLevels[shop.id] || 0) > 0).length;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-1 sm:p-3 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => store.closeModal()}
    >
      {/* Smartphone Outer Shell - Master-Detail 2-Column Split */}
      <div
        className="relative w-full max-w-4xl h-[94vh] sm:h-[88vh] bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Phone Slim Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base sm:text-lg">📱</span>
            <span className="font-black text-xs sm:text-sm text-orange-400 tracking-wider uppercase truncate">
              Điện Thoại Hàng Rong
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-400 font-medium truncate">| {store.playerName}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-xs text-amber-300 font-black bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              {formatVND(store.money)}
            </span>
            <button
              onClick={() => store.closeModal()}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition active:scale-95"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Landscape Split Body */}
        <div className="flex-1 grid grid-cols-12 min-h-0 overflow-hidden">
          {/* CỘT TRÁI (26% - 30%): DOCK ỨNG DỤNG DỌC (Dễ chạm bằng ngón cái trái) */}
          <div className="col-span-4 sm:col-span-3 border-r border-slate-800 bg-slate-900/60 p-1.5 sm:p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar shrink-0">
            <div className="text-[9px] font-black uppercase text-slate-400 px-1 py-0.5 tracking-wider">
              Ứng Dụng ({navApps.length})
            </div>
            {navApps.map((app) => {
              const Icon = app.icon;
              const isActive = currentApp === app.id;
              const hasNotification =
                app.id === 'QUESTS' && store.quests.some((q) => q.completed && !q.claimed);

              return (
                <button
                  key={app.id}
                  onClick={() => {
                    sounds.playClick();
                    store.setSmartphoneApp(app.id);
                  }}
                  className={`relative flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-bold transition text-xs border ${
                    isActive
                      ? 'bg-orange-600/90 border-orange-400 text-white shadow'
                      : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : app.color}`} />
                  <span className="truncate flex-1 text-[11px] sm:text-xs">{app.label}</span>
                  {hasNotification && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* CỘT PHẢI (70% - 74%): BÀN LÀM VIỆC ỨNG DỤNG CHI TIẾT */}
          <div className="col-span-8 sm:col-span-9 p-2.5 sm:p-3 overflow-y-auto custom-scrollbar bg-slate-950 text-slate-200">
          {/* ================= 1. MARKET (CHỢ ĐẦU MỐI) ================= */}
          {currentApp === 'MARKET' && (() => {
            const filteredIngredients = INITIAL_INGREDIENTS.filter((item) => {
              if (!marketSearchQuery.trim()) return true;
              const q = removeVietnameseTones(marketSearchQuery.trim());
              const nameNorm = removeVietnameseTones(item.name);
              const supplierNorm = removeVietnameseTones(item.supplierName || '');
              const catNorm = removeVietnameseTones(item.category || '');
              return nameNorm.includes(q) || supplierNorm.includes(q) || catNorm.includes(q);
            });

            return (
              <div className="flex flex-col gap-3 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-emerald-400" />
                      Chợ Đầu Mối Nguyên Liệu Tươi Sạch
                    </h3>
                    <p className="text-xs text-slate-400">
                      Nhập hàng tận gốc từ các cô chú tiểu thương chợ truyền thống.
                    </p>
                  </div>

                  {/* Storage Capacity Gauge */}
                  <div className="flex flex-col w-44 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span>Sức chứa kho:</span>
                      <span
                        className={
                          totalItems >= maxStorage ? 'text-rose-400' : 'text-emerald-400'
                        }
                      >
                        {totalItems}/{maxStorage}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all ${
                          totalItems >= maxStorage ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (totalItems / maxStorage) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Không Gian Mua Sắm Siêu Thị Co.opmart */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border border-sky-500/40 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src="/assets/logos/coopmart_badge.png"
                      alt="Coopmart"
                      className="w-8 h-8 object-contain rounded-lg p-0.5 bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-black text-sky-200 block truncate">
                        Không Gian Mua Sắm: Đại Siêu Thị Co.opmart
                      </span>
                      <span className="text-[10px] text-slate-300 block truncate">
                        Tự tay đẩy xe giỏ đi dạo các kệ hàng & ra quầy thu ngân tính tiền
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      store.openSupermarket();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-black text-xs shrink-0 shadow active:scale-95 transition flex items-center gap-1"
                  >
                    <span>Vào Siêu Thị</span>
                    <span>🛒</span>
                  </button>
                </div>

                {/* Instant Search Bar */}
                <div
                  className="flex items-center gap-2 min-w-0"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={marketSearchQuery}
                      onChange={(e) => setMarketSearchQuery(e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="Tìm nguyên liệu (thịt, bánh mì, trứng, rau, bơ...)..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition"
                    />
                    {marketSearchQuery && (
                      <button
                        onClick={() => setMarketSearchQuery('')}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white rounded-md transition"
                        title="Xóa tìm kiếm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-slate-400 px-2.5 py-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                    Tìm thấy <strong className="text-emerald-400">{filteredIngredients.length}</strong>/{INITIAL_INGREDIENTS.length} món
                  </div>
                </div>

                {/* Empty Search Result */}
                {filteredIngredients.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">🔍</span>
                    <div className="text-xs font-bold text-slate-300">
                      Không tìm thấy nguyên liệu nào khớp với &ldquo;{marketSearchQuery}&rdquo;
                    </div>
                    <button
                      onClick={() => setMarketSearchQuery('')}
                      className="mt-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 rounded-lg transition"
                    >
                      Xóa bộ lọc tìm kiếm
                    </button>
                  </div>
                ) : (
                  /* Items Grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 min-w-0">
                    {filteredIngredients.map((item) => {
                      const currentStock = store.inventory[item.id] || 0;
                      const qty = getQty(item.id);
                      const totalCost = item.costPerUnit * qty;
                      const canAfford = store.money >= totalCost;
                      const hasSpace = totalItems + qty <= maxStorage;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition min-w-0"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                            <span className="text-3xl shrink-0">{item.icon}</span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-bold text-xs sm:text-sm text-white truncate">
                                {item.name}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate">
                                {formatVND(item.costPerUnit)} / {item.unit} • {item.supplierName}
                              </span>
                              <span className="text-[11px] text-amber-400 font-semibold mt-0.5 truncate">
                                Đang có: {currentStock} {item.unit}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Controls & Buy */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <div className="flex items-center gap-1 bg-slate-950 px-1 py-0.5 rounded-lg border border-slate-800">
                              <button
                                type="button"
                                onClick={() => setQty(item.id, -1)}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded active:scale-95 transition"
                                title="Giảm 1"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={999}
                                value={qty}
                                onChange={(e) => setDirectQty(item.id, e.target.value)}
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                                onKeyUp={(e) => e.stopPropagation()}
                                className="w-12 text-center bg-slate-900 border border-slate-700 rounded text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => setQty(item.id, 1)}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded active:scale-95 transition"
                                title="Tăng 1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                const ok = store.buyIngredient(item.id, qty);
                                if (ok && store.tutorialStep === 1) {
                                  store.advanceTutorial();
                                }
                              }}
                              disabled={!canAfford || !hasSpace}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition active:scale-95 shadow ${
                                canAfford && hasSpace
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              Mua {formatVND(totalCost)}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ================= 2. RECIPES (SỔ MÓN ĂN) ================= */}
          {currentApp === 'RECIPES' && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Sổ Tay Bí Quyết Ẩm Thực Đường Phố (20 Món Ngon)
                </h3>
                <p className="text-xs text-slate-400">
                  Mở khóa công thức mới khi lên cấp để bán giá cao hơn và phục vụ khách sành ăn.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INITIAL_RECIPES.map((recipe) => {
                  const isUnlocked = store.unlockedRecipes.includes(recipe.id);
                  const canUnlockLevel = store.level >= recipe.unlockedAtLevel;
                  const canUnlockMoney = store.money >= recipe.unlockCost;

                  return (
                    <div
                      key={recipe.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition ${
                        isUnlocked
                          ? 'bg-slate-900/90 border-slate-800'
                          : 'bg-slate-950/60 border-slate-800/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl shrink-0 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
                          {recipe.icon}
                        </span>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs sm:text-sm text-white">
                              {recipe.name}
                            </span>
                            {isUnlocked && (
                              <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-800">
                                Đã học
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {recipe.description}
                          </p>

                          {/* Ingredient Badges */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {recipe.ingredients.map((ing) => {
                              const item = INGREDIENT_MAP[ing.ingredientId];
                              return (
                                <span
                                  key={ing.ingredientId}
                                  className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700"
                                >
                                  {item?.icon} {ing.quantity}x {item?.name.split(' ')[0]}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Financial Metrics & Unlock */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">
                            Vốn: {formatVND(recipe.baseCost)}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            Bán: {formatVND(recipe.sellPrice)}
                          </span>
                        </div>

                        {isUnlocked ? (
                          <button
                            onClick={() => {
                              store.closeModal();
                              store.openCookingStation(recipe.id);
                            }}
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg transition active:scale-95 shadow"
                          >
                            Nấu Món
                          </button>
                        ) : (
                          <button
                            onClick={() => store.unlockRecipe(recipe.id)}
                            disabled={!canUnlockLevel || !canUnlockMoney}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-xs transition active:scale-95 ${
                              canUnlockLevel && canUnlockMoney
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>
                              Cấp {recipe.unlockedAtLevel} ({formatVND(recipe.unlockCost)})
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 3. UPGRADES (NÂNG CẤP XE & BẾP) ================= */}
          {currentApp === 'UPGRADES' && (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/90 via-slate-900 to-slate-900 p-4 shadow-lg shadow-cyan-950/20">
                <div className="flex items-center gap-3">
                  <img src={`/assets/carts/${currentCart.spriteKey}.png`} alt={currentCart.name} className="h-20 w-24 shrink-0 rounded-xl border border-white/10 bg-slate-950/70 p-1 object-contain" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">Xe đang dùng • Cấp {store.cartTier}/5</span>
                    <h3 className="mt-1 text-base font-black text-white">{currentCart.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">Nâng cấp để thay xe ngay ngoài phố.</p>
                  </div>
                  {nextCart && <ChevronRight className="h-5 w-5 shrink-0 text-cyan-400" />}
                  {nextCart && <img src={`/assets/carts/${nextCart.spriteKey}.png`} alt={nextCart.name} className="h-20 w-24 shrink-0 rounded-xl border border-cyan-400/20 bg-slate-950/70 p-1 object-contain" />}
                </div>
                {nextCart ? (
                  <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Xe kế tiếp • Cấp {nextCart.tier}</div>
                      <div className="mt-0.5 text-sm font-extrabold text-white">{nextCart.name} <span className="text-cyan-300">• {formatVND(nextCart.cost)}</span></div>
                      {!canBuyNextCart && <p className="mt-1 text-[11px] font-semibold text-amber-300">{store.level < nextCart.requiredLevel ? `Cần đạt cấp ${nextCart.requiredLevel} (hiện tại cấp ${store.level})` : `Còn thiếu ${formatVND(nextCart.cost - store.money)}`}</p>}
                    </div>
                    <button onClick={() => store.upgradeCartTier(nextCart.tier)} aria-disabled={!canBuyNextCart} className={`flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${canBuyNextCart ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-950/40 hover:bg-cyan-400 active:scale-95' : 'cursor-pointer bg-slate-800 text-amber-300 hover:bg-slate-700'}`}>
                      <Truck className="h-4 w-4" /> {canBuyNextCart ? 'Nâng cấp xe ngay' : 'Xem điều kiện nâng cấp'}
                    </button>
                  </div>
                ) : <p className="mt-3 border-t border-white/10 pt-3 text-xs font-bold text-emerald-300">Bạn đã sở hữu mẫu xe cao cấp nhất.</p>}
              </div>

              {/* Cart Tiers Section */}
              <div className="flex flex-col gap-2.5">
                <h3 className="font-extrabold text-sm text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  Nâng Cấp Xe Hàng (Từ Gánh Tre Đến Kiosk Ẩm Thực)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CART_UPGRADES.map((cart) => {
                    const isOwned = store.maxCartTier >= cart.tier;
                    const isActiveCart = store.cartTier === cart.tier;
                    const isNext = store.maxCartTier + 1 === cart.tier;
                    const canAfford = store.money >= cart.cost && store.level >= cart.requiredLevel;

                    return (
                      <div
                        key={cart.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 ${
                          isOwned
                            ? 'bg-slate-900 border-emerald-500/50'
                            : isNext
                            ? 'bg-slate-900 border-cyan-500/50'
                            : 'bg-slate-950 border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <img
                            src={`/assets/carts/${cart.spriteKey}.png`}
                            alt={cart.name}
                            className="w-16 h-14 object-contain shrink-0 bg-slate-950/60 p-1 rounded-lg border border-slate-800"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{cart.name}</span>
                              {isOwned && (
                                <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  {isActiveCart ? 'Đang dùng' : 'Đã sở hữu'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{cart.description}</p>
                            <div className="flex items-center gap-2 text-[11px] text-cyan-300 mt-2 font-medium">
                              <span>+ {cart.maxCapacityBonus} chỗ kho</span>
                              <span>• x{cart.prepSpeedMultiplier} tốc độ</span>
                              <span>• +{cart.prestigeBonus} danh tiếng</span>
                            </div>
                          </div>
                        </div>

                        {isOwned && !isActiveCart && (
                          <button
                            onClick={() => store.selectCartTier(cart.tier)}
                            className="mt-2 w-full rounded-lg border border-emerald-500/40 bg-emerald-900/40 py-1.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-800/60 active:scale-95"
                          >
                            Chọn xe này (miễn phí)
                          </button>
                        )}
                        {isActiveCart && (
                          <span className="mt-2 w-full rounded-lg bg-slate-800 py-1.5 text-center text-xs font-bold text-emerald-300">
                            Xe đang sử dụng
                          </span>
                        )}
                        {!isOwned && isNext && (
                          <button
                            onClick={() => store.upgradeCartTier(cart.tier)}
                            className={`w-full py-1.5 rounded-lg font-bold text-xs mt-2 transition active:scale-95 ${
                              canAfford
                                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow'
                                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                            }`}
                          >
                            {canAfford ? `Nâng cấp • ${formatVND(cart.cost)}` : store.level < cart.requiredLevel ? `Cần cấp ${cart.requiredLevel}` : `Còn thiếu ${formatVND(cart.cost - store.money)}`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Equipment Upgrades Section */}
              <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800">
                <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wide">
                  Nâng Cấp Thiết Bị Chế Biến
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EQUIPMENT_UPGRADES.map((eq) => {
                    const currentLvl = store.equipment[eq.id] || 1;
                    const isMax = currentLvl >= eq.maxLevel;
                    const nextCost = Math.round(eq.cost * Math.pow(1.5, currentLvl - 1));
                    const canAfford = store.money >= nextCost && store.level >= eq.requiredLevel;

                    return (
                      <div
                        key={eq.id}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-xs sm:text-sm text-white">
                            {eq.name} (Cấp {currentLvl}/{eq.maxLevel})
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {eq.effectDescription}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1">
                            {eq.category === 'STOVE' || eq.category === 'COUNTER'
                              ? 'Rút ngắn thời gian chế biến'
                              : eq.category === 'FRIDGE'
                                ? `Tăng sức chứa kho thêm ${eq.capacityBonus} món mỗi cấp`
                                : 'Tăng lượng khách mỗi ngày'}
                          </span>
                        </div>

                        {!isMax ? (
                          <button
                            onClick={() => store.upgradeEquipmentItem(eq.id)}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition active:scale-95 ${
                              canAfford
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {store.level < eq.requiredLevel ? `Cần cấp ${eq.requiredLevel}` : `Lên Cấp ${currentLvl + 1} (${formatVND(nextCost)})`}
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-bold px-2 py-1 bg-emerald-950/60 rounded">
                            Tối Đa
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. SHOPS (MUA & NÂNG CẤP CỬA HÀNG) ================= */}
          {currentApp === 'SHOPS' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-orange-400/25 bg-gradient-to-br from-orange-950/80 via-slate-900 to-slate-950 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-orange-300">Mạng lưới kinh doanh</span>
                    <h3 className="mt-1 flex items-center gap-2 text-lg font-black text-white"><Store className="h-5 w-5 text-orange-400" /> Mua & nâng cấp cửa hàng</h3>
                    <p className="mt-1 text-xs text-slate-400">Mở theo thứ tự tuyến phố. Mỗi cấp tăng thu nhập cuối ngày và lượng khách.</p>
                  </div>
                  <div className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Đang sở hữu</div>
                    <div className="text-xl font-black text-white">{ownedShopCount}<span className="text-sm text-slate-500">/{STREET_SHOPS.length}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {STREET_SHOPS.map((shop, index) => {
                  const level = store.shopLevels[shop.id] || 0;
                  const prerequisite = getShopPrerequisite(shop.id);
                  const meetsPrerequisite = !prerequisite || (store.shopLevels[prerequisite.id] || 0) > 0;
                  const reqRep = getRequiredReputationForShop(shop);
                  const reqCart = getRequiredCartTierForShop(shop);
                  const meetsReputation = store.reputationRating >= reqRep;
                  const meetsCartTier = store.cartTier >= reqCart;
                  const canBuy =
                    level === 0 &&
                    meetsPrerequisite &&
                    store.level >= shop.requiredLevel &&
                    meetsReputation &&
                    meetsCartTier &&
                    store.money >= shop.unlockCost;
                  const upgradeCost = level > 0 ? getShopUpgradeCost(shop, level) : 0;
                  const upgradeRequiredLevel = level > 0 ? getShopUpgradeRequiredLevel(shop, level) : 0;
                  const canUpgrade = level > 0 && level < MAX_SHOP_LEVEL && store.level >= upgradeRequiredLevel && store.money >= upgradeCost;
                  const isMax = level >= MAX_SHOP_LEVEL;

                  return (
                    <article key={shop.id} className={`overflow-hidden rounded-2xl border ${level > 0 ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800 bg-slate-900'}`}>
                      <div className="flex items-start gap-3 p-3.5">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 text-2xl ${level > 0 ? 'bg-emerald-950/70' : 'bg-slate-950/70'}`}>
                          {shop.id === 'coop_hypermarket' ? (
                            <img src="/assets/logos/coopmart_badge.png" alt="Co.opmart" className="w-10 h-10 object-contain rounded-lg p-0.5 bg-white" />
                          ) : (
                            shop.icon
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="text-sm font-extrabold text-white truncate">{shop.name}</h4>
                              {shop.id.startsWith('coop_') && (
                                <span className="bg-blue-600/30 text-blue-300 border border-blue-400/40 text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">
                                  CO.OPMART
                                </span>
                              )}
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold uppercase ${level > 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                              {level > 0 ? `Cấp ${level}/${MAX_SHOP_LEVEL}` : `Phố ${shop.streetScreen}`}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] italic text-amber-300">{shop.tagline}</p>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{shop.description}</p>
                        </div>
                      </div>

                      <div className="mx-3.5 grid grid-cols-2 gap-1.5 border-t border-slate-800 pt-2.5">
                        <div className="rounded-lg bg-slate-950/70 px-2.5 py-2">
                          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Thu nhập cuối ngày</div>
                          <div className="mt-0.5 text-xs font-extrabold text-emerald-300">{formatVND(shop.dailyBonusIncome * level)}{level > 0 ? '/ngày' : ' / cấp'}</div>
                        </div>
                        <div className="rounded-lg bg-slate-950/70 px-2.5 py-2">
                          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Lượng khách cộng thêm</div>
                          <div className="mt-0.5 text-xs font-extrabold text-cyan-300">+{level * 4}%</div>
                        </div>
                      </div>

                      <div className="p-3.5 pt-3">
                        {level === 0 ? (
                          <>
                            <p className="mb-2 text-[10px] font-semibold text-slate-400">
                              {prerequisite && !meetsPrerequisite
                                ? `Điều kiện: mở ${prerequisite.name} trước`
                                : store.level < shop.requiredLevel
                                  ? `Điều kiện: người chơi cấp ${shop.requiredLevel} (hiện tại: ${store.level})`
                                  : !meetsReputation
                                    ? `Điều kiện: uy tín tối thiểu ${reqRep}⭐ (hiện có: ${store.reputationRating}⭐)`
                                    : !meetsCartTier
                                      ? `Điều kiện: sở hữu Xe Cấp ${reqCart} trở lên (hiện có: Cấp ${store.cartTier})`
                                      : store.money < shop.unlockCost
                                        ? `Còn thiếu ${formatVND(shop.unlockCost - store.money)}`
                                        : `Đủ điều kiện • Cần ${formatVND(shop.unlockCost)}`}
                            </p>
                            <button
                              onClick={() => store.buyShop(shop.id)}
                              disabled={!canBuy}
                              className={`w-full rounded-xl py-2.5 text-xs font-extrabold transition active:scale-[0.98] ${
                                canBuy
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-950/30 hover:brightness-110'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              Mua cửa hàng • {shop.unlockCost === 0 ? 'Miễn phí' : formatVND(shop.unlockCost)}
                            </button>
                          </>
                        ) : isMax ? (
                          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-950/50 py-2.5 text-xs font-extrabold text-emerald-300"><Check className="h-4 w-4" /> Đã nâng cấp tối đa</div>
                        ) : (
                          <>
                            <p className="mb-2 text-[10px] font-semibold text-slate-400">
                              {store.level < upgradeRequiredLevel
                                ? `Điều kiện: người chơi cấp ${upgradeRequiredLevel} (hiện tại ${store.level})`
                                : store.money < upgradeCost
                                  ? `Còn thiếu ${formatVND(upgradeCost - store.money)}`
                                  : `Đủ điều kiện nâng lên cấp ${level + 1}`}
                            </p>
                            <button onClick={() => store.upgradeShop(shop.id)} className={`w-full rounded-xl py-2.5 text-xs font-extrabold transition active:scale-[0.98] ${canUpgrade ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-blue-950/30 hover:brightness-110' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                              Nâng lên cấp {level + 1} • {formatVND(upgradeCost)}
                            </button>
                          </>
                        )}
                        <div className="mt-2 text-center text-[9px] text-slate-500">Yêu cầu mở cửa: cấp {shop.requiredLevel}{index > 0 ? ` • Mở sau cửa hàng trước` : ' • Cửa hàng khởi nghiệp'}</div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 5. STAFF (TUYỂN DỤNG & NHÂN SỰ) ================= */}
          {currentApp === 'STAFF' && (() => {
            const ownedShops = STREET_SHOPS.filter((shop) => (store.shopLevels[shop.id] || 0) > 0);
            const totalHired = INITIAL_STAFF.filter((s) => store.staff[s.id]).length;
            const assignedCount = INITIAL_STAFF.filter(
              (s) => store.staff[s.id] && store.staffAssignments?.[s.id]
            ).length;
            const standbyCount = totalHired - assignedCount;

            const filteredStaff = INITIAL_STAFF.filter((member) => {
              const isHired = store.staff[member.id];
              if (staffFilter === 'HIRED') return isHired;
              if (staffFilter === 'AVAILABLE') return !isHired;
              return true;
            });

            return (
              <div className="flex flex-col gap-4">
                {/* Header card with summary statistics */}
                <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/50 via-slate-900 to-indigo-950/50 p-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-300">
                        HỆ THỐNG NHÂN SỰ PHỐ
                      </span>
                      <h3 className="mt-1 flex items-center gap-2 text-lg font-black text-white">
                        <Users className="h-5 w-5 text-purple-400" /> Đội Ngũ Nhân Sự & Điều Phối
                      </h3>
                      <p className="mt-1 text-xs text-slate-300">
                        Tuyển dụng nhân viên tài năng và phân công họ trực tiếp tới từng cửa hàng để tự động hóa phục vụ.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-center">
                        <div className="text-[9px] font-bold uppercase text-slate-400">Đã tuyển</div>
                        <div className="text-base font-black text-purple-300">
                          {totalHired}<span className="text-xs text-slate-500">/{INITIAL_STAFF.length}</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-center">
                        <div className="text-[9px] font-bold uppercase text-slate-400">Trực tiệm</div>
                        <div className="text-base font-black text-emerald-400">{assignedCount}</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-center">
                        <div className="text-[9px] font-bold uppercase text-slate-400">Chờ việc</div>
                        <div className="text-base font-black text-amber-300">{standbyCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-purple-500/20">
                    <button
                      onClick={() => setStaffFilter('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        staffFilter === 'ALL'
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      Tất cả ({INITIAL_STAFF.length})
                    </button>
                    <button
                      onClick={() => setStaffFilter('HIRED')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        staffFilter === 'HIRED'
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      Đã tuyển ({totalHired})
                    </button>
                    <button
                      onClick={() => setStaffFilter('AVAILABLE')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        staffFilter === 'AVAILABLE'
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      Chưa tuyển ({INITIAL_STAFF.length - totalHired})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 min-w-0">
                  {filteredStaff.map((member) => {
                    const isHired = store.staff[member.id];
                    const canHire =
                      store.money >= member.hiringCost && store.level >= member.requiredLevel;
                    const assignedShopId = store.staffAssignments?.[member.id] || null;
                    const assignedShop = assignedShopId ? STREET_SHOPS.find((s) => s.id === assignedShopId) : null;

                    return (
                      <div
                        key={member.id}
                        className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between gap-3 min-w-0 overflow-hidden ${
                          isHired
                            ? 'bg-purple-950/40 border-purple-500/50'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="relative w-14 h-16 shrink-0 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                            <span className="absolute text-2xl select-none">
                              {member.avatar}
                            </span>
                            <img
                              src={`/assets/characters/${member.id}.png`}
                              alt={member.name}
                              className="relative z-10 w-full h-full object-contain p-1"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <span className="font-bold text-sm text-white">{member.name}</span>
                            <span className="text-[11px] text-amber-300 font-semibold mt-1">
                              Lương: {formatVND(member.dailyWage)} / ngày • Hiệu suất: +{Math.round(member.efficiencyBonus * 100)}%
                            </span>
                          </div>
                        </div>

                        {isHired ? (
                          <div className="space-y-2 pt-2 border-t border-purple-500/20 min-w-0">
                            <div className="flex items-center justify-between text-xs min-w-0">
                              <span className="text-purple-300 font-extrabold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                Điều phối nhân sự:
                              </span>
                              {assignedShop ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                                  Đang trực tiệm
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                  Chờ phân công
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 min-w-0">
                              <select
                                value={assignedShopId || ''}
                                onChange={(e) => store.assignStaffToShop(member.id, e.target.value || null)}
                                className="min-w-0 w-0 flex-1 bg-slate-950/90 border border-purple-500/40 rounded-xl px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-purple-400 truncate"
                              >
                                <option value="">💤 Chưa phân công (Chờ việc)</option>
                                {ownedShops.map((shop) => (
                                  <option key={shop.id} value={shop.id}>
                                    {shop.icon} {shop.name} (Phố {shop.streetScreen})
                                  </option>
                                ))}
                              </select>
                              {assignedShopId && (
                                <button
                                  onClick={() => store.unassignStaff(member.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shrink-0 whitespace-nowrap active:scale-95 border border-slate-700/60"
                                  title="Rút về chờ việc"
                                >
                                  Thu hồi
                                </button>
                              )}
                            </div>

                            {assignedShop ? (
                              <p className="text-[11px] text-emerald-300/90 font-medium flex items-center gap-1 bg-emerald-950/30 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 min-w-0">
                                <span className="shrink-0">⚡ Tự động phục vụ khách tại</span>
                                <strong className="text-white truncate">{assignedShop.name}</strong>
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">
                                💡 Chọn một cửa hàng bạn sở hữu ở trên để nhân viên tự động phục vụ khách.
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => store.hireStaffMember(member.id)}
                            disabled={!canHire}
                            className={`w-full py-2 rounded-lg font-bold text-xs transition active:scale-95 ${
                              canHire
                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Tuyển dụng ({formatVND(member.hiringCost)} • Cần Cấp{' '}
                            {member.requiredLevel})
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ================= 5. MAP (BẢN ĐỒ ĐỊA ĐIỂM) ================= */}
          {currentApp === 'MAP' && (
            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-950 via-slate-900 to-rose-950 p-5 shadow-xl">
                <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full bg-orange-500/10 blur-2xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-orange-300">ĐIỆN THOẠI • CẨM NANG HÀNH TRÌNH</span>
                    <h3 className="mt-2 flex items-center gap-2 text-xl font-black text-white">
                      <MapPin className="h-5 w-5 text-rose-400" /> Bản đồ phố
                    </h3>
                    <p className="mt-1 max-w-lg text-xs leading-relaxed text-slate-300">Chọn điểm bán tiếp theo, xem chi phí mở cửa và tiềm năng kinh doanh trước khi lên đường.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Địa điểm</div>
                    <div className="text-lg font-black text-white">{LOCATIONS.findIndex((loc) => loc.id === store.currentLocationId) + 1}<span className="text-sm text-slate-400"> / {LOCATIONS.length}</span></div>
                  </div>
                </div>
                <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-slate-950/70">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400 transition-all" style={{ width: `${((LOCATIONS.findIndex((loc) => loc.id === store.currentLocationId) + 1) / LOCATIONS.length) * 100}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {LOCATIONS.map((loc, index) => {
                  const isCurrent = store.currentLocationId === loc.id;
                  const isUnlocked = store.unlockedLocations.includes(loc.id) || loc.unlockCost === 0;
                  const meetsLevel = store.level >= loc.requiredLevel;
                  const canTravel = meetsLevel && (isUnlocked || store.money >= loc.unlockCost);

                  return (
                    <div
                      key={loc.id}
                      className={`group overflow-hidden rounded-2xl border transition duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                        isCurrent
                          ? 'border-rose-400/70 bg-rose-950/30 shadow-lg shadow-rose-950/20 ring-1 ring-rose-400/20'
                          : 'border-slate-700/80 bg-slate-900 hover:border-orange-400/40'
                      }`}
                    >
                        <img
                          src={`/assets/locations/${loc.bgAssetKey}.png`}
                          alt={loc.name}
                          className={`h-36 w-full object-cover transition duration-500 group-hover:scale-[1.02] ${!isUnlocked ? 'brightness-75' : ''}`}
                        />
                      <div className="p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${isCurrent ? 'bg-rose-500 text-white' : isUnlocked ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>{String(index + 1).padStart(2, '0')}</span>
                              <h4 className="truncate text-sm font-extrabold text-white">{loc.name.replace(/^\d+\.\s*/, '')}</h4>
                            </div>
                            <p className="mt-1 text-[11px] italic text-amber-300">{loc.tagline}</p>
                          </div>
                          <span className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${isCurrent ? 'border-rose-400/40 bg-rose-500/15 text-rose-200' : isUnlocked ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
                            {isCurrent ? 'Đang ở đây' : isUnlocked ? 'Đã mở' : 'Chưa mở'}
                          </span>
                        </div>
                        <p className="mt-2 min-h-9 text-[11px] leading-relaxed text-slate-400">{loc.description}</p>

                        {/* Đồ phố đặc trưng theo bản đồ */}
                        <div className="mt-2.5 rounded-xl border border-orange-500/20 bg-orange-950/20 p-2.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-orange-400">
                            <span>🏛️ Đồ phố đặc trưng</span>
                          </div>
                          <p className="mt-1 text-[11px] italic text-slate-300">{loc.specialPropDesc}</p>
                          {loc.mapProps && loc.mapProps.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {loc.mapProps.map((p) => (
                                <span
                                  key={p.id}
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-950/80 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                                >
                                  {p.name || p.id}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-1.5">
                          <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-2">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Mở điểm bán</div>
                            <div className="mt-0.5 text-[11px] font-extrabold text-amber-300">{loc.unlockCost ? formatVND(loc.unlockCost) : 'Miễn phí'}</div>
                          </div>
                          <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-2">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Cấp yêu cầu</div>
                            <div className={`mt-0.5 text-[11px] font-extrabold ${meetsLevel ? 'text-emerald-300' : 'text-rose-300'}`}>Cấp {loc.requiredLevel}</div>
                          </div>
                          <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-2">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Lượng khách</div>
                            <div className="mt-0.5 text-[11px] font-extrabold text-cyan-300">x{loc.customerFlowMultiplier}</div>
                          </div>
                          <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-2">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Thuê / chi tiêu</div>
                            <div className="mt-0.5 text-[11px] font-extrabold text-slate-200">{formatVND(loc.dailyRent)} • x{loc.spendingPowerMultiplier}</div>
                          </div>
                        </div>

                      {!isCurrent && (
                        <button
                          onClick={() => store.travelToLocation(loc.id)}
                          disabled={!canTravel}
                          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold transition active:scale-[0.98] ${
                            canTravel
                              ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-rose-950/30 hover:brightness-110'
                              : 'cursor-not-allowed bg-slate-800 text-slate-500'
                          }`}
                        >
                          {meetsLevel && isUnlocked ? <Truck className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                          {!meetsLevel ? `Cần đạt Cấp ${loc.requiredLevel}` : !isUnlocked && store.money < loc.unlockCost ? `Còn thiếu ${formatVND(loc.unlockCost - store.money)}` : isUnlocked ? 'Di chuyển tới đây' : `Mở khóa & di chuyển • ${formatVND(loc.unlockCost)}`}
                          {meetsLevel && (isUnlocked || store.money >= loc.unlockCost) && <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 6. FINANCE (SỔ THU CHI & LỢI NHUẬN) ================= */}
          {currentApp === 'FINANCE' && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Sổ Kế Toán & Báo Cáo Lợi Nhuận
                </h3>
                <p className="text-xs text-slate-400">
                  Lợi Nhuận = Doanh Thu Bán Hàng - Giá Vốn Nguyên Liệu - Mặt Bằng - Tiền Lương.
                </p>
              </div>

              {/* Current Day Live Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">Doanh Thu Hôm Nay</span>
                  <span className="text-base font-extrabold text-emerald-400 mt-0.5">
                    {formatVND(store.currentDayStats.revenue)}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">Giá Vốn Chế Biến</span>
                  <span className="text-base font-extrabold text-rose-400 mt-0.5">
                    {formatVND(store.currentDayStats.cogs)}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">Số Khách Đã Phục Vụ</span>
                  <span className="text-base font-extrabold text-cyan-400 mt-0.5">
                    {store.currentDayStats.customersServed} khách
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">Tổng Thu Cả Đời</span>
                  <span className="text-base font-extrabold text-amber-400 mt-0.5">
                    {formatVND(store.lifetimeEarnings)}
                  </span>
                </div>
              </div>

              {/* Past Days History */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Lịch Sử Các Ngày Kinh Doanh Trước
                </span>

                {store.financialHistory.length === 0 ? (
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                    Chưa kết thúc ngày kinh doanh nào. Hoàn thành ngày 1 để xem báo cáo tài chính!
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {store.financialHistory.map((rec) => (
                      <div
                        key={rec.day}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 gap-2 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-white">{rec.dateStr}</span>
                          <span className="text-slate-400">
                            Thu: {formatVND(rec.revenue)} | Vốn: {formatVND(rec.cogs)} | Lương: {formatVND(rec.wages)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-bold">
                          <span className="text-slate-300">{rec.customersServed} khách</span>
                          <span
                            className={
                              rec.netProfit >= 0 ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'
                            }
                          >
                            Lãi: {formatVND(rec.netProfit)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= 7. QUESTS (NHIỆM VỤ & THÀNH TỰU) ================= */}
          {currentApp === 'QUESTS' && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-yellow-400" />
                  Nhiệm Vụ Hàng Ngày & Thành Tựu
                </h3>
                <p className="text-xs text-slate-400">
                  Hoàn thành các mốc chỉ tiêu để nhận tiền thưởng lớn và danh hiệu vinh danh.
                </p>
              </div>

              {/* Quests List */}
              <div className="flex flex-col gap-2.5">
                {store.quests.map((q) => {
                  const progressPct = Math.min(100, (q.currentValue / q.targetValue) * 100);

                  return (
                    <div
                      key={q.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-white">{q.title}</span>
                          <span className="text-[10px] bg-slate-800 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-slate-700">
                            +{formatVND(q.rewardMoney)} & +{q.rewardXP} XP
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-1">{q.description}</p>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 mt-2 w-full max-w-xs">
                          <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-yellow-400 h-full rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {q.currentValue}/{q.targetValue}
                          </span>
                        </div>
                      </div>

                      {/* Claim Button */}
                      {q.claimed ? (
                        <span className="text-xs text-slate-500 font-bold px-3 py-1 bg-slate-800/60 rounded-lg">
                          Đã Nhận
                        </span>
                      ) : q.completed ? (
                        <button
                          onClick={() => store.claimQuest(q.id)}
                          className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg shadow-yellow-950/40 animate-bounce transition active:scale-95"
                        >
                          Nhận Thưởng
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium px-2 py-1">
                          Đang làm
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Achievements Badges */}
              <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Huy Hiệu Vinh Danh
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {store.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                        ach.achieved
                          ? 'bg-amber-950/30 border-amber-500/50'
                          : 'bg-slate-900 border-slate-800 opacity-60'
                      }`}
                    >
                      <span className="text-2xl">{ach.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-white">{ach.title}</span>
                        <span className="text-[11px] text-slate-400">{ach.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 8. SETTINGS (CÀI ĐẶT & LƯU GAME) ================= */}
          {currentApp === 'SETTINGS' && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  Cài Đặt Game & Quản Lý Dữ Liệu Lưu
                </h3>
                <p className="text-xs text-slate-400">
                  Dữ liệu được tự động lưu vào trình duyệt (IndexedDB + localStorage). Bạn cũng có
                  thể xuất/nhập file JSON để chuyển máy.
                </p>
              </div>

              {/* Audio & Speed Controls */}
              <div className="flex flex-col gap-2.5 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase">Âm Thanh & Hiển Thị</span>

                <div className="flex items-center justify-between py-1 text-xs">
                  <span>Hiệu ứng âm thanh</span>
                  <input
                    type="checkbox"
                    checked={store.settings.soundEnabled}
                    onChange={(e) => store.updateSettings({ soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-orange-500 rounded"
                  />
                </div>

                <div className="flex items-center justify-between py-1 text-xs">
                  <span>Nhạc nền du dương</span>
                  <input
                    type="checkbox"
                    checked={store.settings.musicEnabled}
                    onChange={(e) => store.updateSettings({ musicEnabled: e.target.checked })}
                    className="w-4 h-4 accent-orange-500 rounded"
                  />
                </div>
              </div>

              {/* Backup & Import */}
              <div className="flex flex-col gap-2.5 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase">Sao Lưu & Khôi Phục</span>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportSave}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Xuất File Lưu (.json)</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nạp File Lưu</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSave}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Reset Progress */}
              <div className="flex flex-col gap-2 bg-rose-950/30 p-3.5 rounded-xl border border-rose-900/60">
                <span className="text-xs font-bold text-rose-400 uppercase">Vùng Nguy Hiểm</span>
                <p className="text-xs text-rose-300/80">
                  Xóa toàn bộ tiến trình và chơi lại từ đầu với đôi quang gánh tre nhỏ.
                </p>

                <button
                  onClick={async () => {
                    if (
                      window.confirm('Bạn có chắc chắn muốn xóa toàn bộ tiến trình và chơi lại từ đầu? Tất cả các cửa hàng, nhân viên và tiền tệ sẽ được đặt lại nguyên bản!')
                    ) {
                      await store.resetAllProgress();
                    }
                  }}
                  className="self-start px-3.5 py-2 bg-rose-700 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Xóa Dữ Liệu & Chơi Lại Từ Đầu
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

