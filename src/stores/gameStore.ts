import { create } from 'zustand';
import {
  Achievement,
  DailyFinancialRecord,
  GameSettings,
  Order,
  Quest,
  SaveSchema,
  TimeOfDay,
  WeatherType
} from '../types/game';
import { INITIAL_INGREDIENTS, INGREDIENT_MAP } from '../data/ingredients';
import { INITIAL_RECIPES, RECIPE_MAP } from '../data/recipes';
import { CUSTOMER_MAP, CUSTOMER_TYPES } from '../data/customers';
import { CART_UPGRADES, EQUIPMENT_UPGRADES } from '../data/cartUpgrades';
import { INITIAL_STAFF } from '../data/staff';
import { INITIAL_ACHIEVEMENTS, INITIAL_QUESTS } from '../data/quests';
import { LOCATIONS, LOCATION_MAP } from '../data/locations';
import { calculateLevelFromXP } from '../utils/formatters';
import { SaveSystem } from '../saves/saveSystem';
import { sounds } from '../audio/soundSystem';
import { STREET_SHOPS, getShopPrerequisite, getShopUpgradeCost, getShopUpgradeRequiredLevel, getRequiredReputationForShop, getRequiredCartTierForShop } from '../data/shops';
import { getShopSpecialization } from '../data/shopServices';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'money';
}

const DEFAULT_STAFF_MAP: Record<string, boolean> = INITIAL_STAFF.reduce((acc, s) => {
  acc[s.id] = false;
  return acc;
}, {} as Record<string, boolean>);

const DEFAULT_STAFF_ASSIGNMENTS: Record<string, string | null> = INITIAL_STAFF.reduce((acc, s) => {
  acc[s.id] = null;
  return acc;
}, {} as Record<string, string | null>);

export interface ShopCustomerRequest {
  id: string;
  shopId: string;
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  customerSpriteKey: string;
  customerName: string;
  customerQuote: string;
  payout: number;
  xpReward: number;
}

export type ModalType =
  | 'SMARTPHONE'
  | 'COOKING'
  | 'MARKET'
  | 'DAY_END'
  | 'RECIPES'
  | 'UPGRADES'
  | 'STAFF'
  | 'MAP'
  | 'FINANCE'
  | 'SETTINGS'
  | 'QUESTS'
  | 'SHOP_WORKSTATION'
  | null;

interface GameState {
  // Player
  playerName: string;
  gender: 'BOY' | 'GIRL';
  money: number;
  xp: number;
  level: number;
  reputationRating: number;
  lifetimeEarnings: number;

  // Time & Environment
  day: number;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  dayProgress: number; // 0 to 100
  isDayRunning: boolean;

  // World State
  currentLocationId: string;
  unlockedLocations: string[];
  cartTier: number;
  maxCartTier: number;
  shopLevels: Record<string, number>;
  inventory: Record<string, number>;
  unlockedRecipes: string[];
  equipment: Record<string, number>;
  staff: Record<string, boolean>;
  staffAssignments: Record<string, string | null>;
  staffAutoServeTimers: Record<string, number>;

  // Orders
  orders: Order[];
  maxOrdersQueue: number;

  // Quests & Achievements
  quests: Quest[];
  achievements: Achievement[];
  financialHistory: DailyFinancialRecord[];

  // Current Day Temporary Stats
  currentDayStats: {
    revenue: number;
    cogs: number;
    customersServed: number;
    customersLost: number;
    ratingsSum: number;
    ratingsCount: number;
    recipeSalesCount: Record<string, number>;
  };

  // UI & Modals
  activeModal: ModalType;
  smartphoneApp: string;
  cookingRecipeId: string | null;
  selectedShopId: string | null;
  targetServiceId: string | null;
  shopCustomerRequests: Record<string, ShopCustomerRequest>;
  autoMode: boolean;
  autoCookingOrderId: string | null;
  autoCookingRemainingSeconds: number;
  toasts: ToastMessage[];
  settings: GameSettings;

  // Tutorial
  tutorialCompleted: boolean;
  tutorialStep: number; // 0 to 10

  // Actions
  initGame: () => Promise<void>;
  tick: (deltaSeconds: number) => void;
  spawnCustomerOrder: (tableIdx?: number) => void;
  buyIngredient: (ingredientId: string, quantity: number) => boolean;
  unlockRecipe: (recipeId: string) => boolean;
  openCookingStation: (recipeId?: string) => void;
  openShopWorkstation: (shopId: string, serviceId?: string) => void;
  generateShopCustomerRequest: (shopId: string) => void;
  fulfillShopCustomerRequest: (shopId: string) => void;
  finishCooking: (recipeId: string, qualityMultiplier?: number, orderId?: string) => boolean;
  serveOrder: (orderId: string) => boolean;
  toggleAutoMode: () => void;
  cancelOrder: (orderId: string) => void;
  upgradeCartTier: (tier: number) => boolean;
  selectCartTier: (tier: number) => boolean;
  buyShop: (shopId: string) => boolean;
  upgradeShop: (shopId: string) => boolean;
  upgradeEquipmentItem: (id: string) => boolean;
  hireStaffMember: (id: string) => boolean;
  assignStaffToShop: (staffId: string, shopId: string | null) => boolean;
  unassignStaff: (staffId: string) => boolean;
  travelToLocation: (locationId: string) => boolean;
  claimQuest: (questId: string) => void;
  endCurrentDay: () => void;
  startNextDay: () => void;
  openModal: (modal: ModalType, meta?: string) => void;
  closeModal: () => void;
  setSmartphoneApp: (appName: string) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  saveCurrentGame: () => Promise<void>;
  resetAllProgress: () => Promise<void>;
  getMaxStorageCapacity: () => number;
  getTotalStoredItemsCount: () => number;
}

const DEFAULT_INVENTORY: Record<string, number> = {
  bread: 10,
  pork: 10,
  herbs_cucumber: 10,
  sticky_rice: 10,
  scallion_oil: 10,
  egg_quail: 15,
  tea_leaves: 20,
  sugarcane: 15,
  kumquat_chia: 15,
  rice_paper: 10,
};

let lastAutosaveAt = 0;
let isResettingGame = false;

export const useGameStore = create<GameState>((set, get) => ({
  playerName: 'Bé Hàng Rong',
  gender: 'BOY',
  money: 50000, // 50.000đ initial capital
  xp: 0,
  level: 1,
  reputationRating: 4.0,
  lifetimeEarnings: 0,

  day: 1,
  timeOfDay: 'DAWN',
  weather: 'SUNNY',
  dayProgress: 0,
  isDayRunning: true,

  currentLocationId: 'sidewalk_start',
  unlockedLocations: ['sidewalk_start'],
  cartTier: 1,
  maxCartTier: 1,
  shopLevels: { banh_mi: 1 },
  inventory: { ...DEFAULT_INVENTORY },
  unlockedRecipes: ['banh_mi_thit', 'xoi_xeo', 'tra_da', 'nuoc_mia', 'banh_trang_tron'],
  equipment: {
    stove_upgrade: 1,
    fridge_upgrade: 1,
    counter_upgrade: 1,
    signboard_upgrade: 1,
  },
  staff: { ...DEFAULT_STAFF_MAP },
  staffAssignments: { ...DEFAULT_STAFF_ASSIGNMENTS },
  staffAutoServeTimers: {},

  orders: [],
  maxOrdersQueue: 4,

  quests: [...INITIAL_QUESTS],
  achievements: [...INITIAL_ACHIEVEMENTS],
  financialHistory: [],

  currentDayStats: {
    revenue: 0,
    cogs: 0,
    customersServed: 0,
    customersLost: 0,
    ratingsSum: 0,
    ratingsCount: 0,
    recipeSalesCount: {},
  },

  activeModal: null,
  smartphoneApp: 'MARKET',
  cookingRecipeId: null,
  selectedShopId: null,
  targetServiceId: null,
  shopCustomerRequests: {},
  autoMode: false,
  autoCookingOrderId: null,
  autoCookingRemainingSeconds: 0,
  toasts: [],
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.3,
    gameSpeed: 1,
    joystickEnabled: true,
  },

  tutorialCompleted: false,
  tutorialStep: 0,

  initGame: async () => {
    const saved = await SaveSystem.loadGame();
    if (saved) {
      set({
        playerName: saved.player.name,
        gender: saved.player.gender,
        money: saved.player.money,
        xp: saved.player.xp,
        level: saved.player.level,
        reputationRating: saved.player.reputationRating,
        lifetimeEarnings: saved.player.lifetimeEarnings,
        day: saved.time.day,
        timeOfDay: saved.time.timeOfDay,
        weather: saved.time.weather,
        dayProgress: saved.time.dayProgressPercent,
        currentLocationId: (() => {
          const pLevel = saved.player?.level || 1;
          const loc = LOCATION_MAP[saved.currentLocationId];
          return loc && loc.requiredLevel <= pLevel ? saved.currentLocationId : 'sidewalk_start';
        })(),
        unlockedLocations: (() => {
          const pLevel = saved.player?.level || 1;
          const list = (saved.unlockedLocations || ['sidewalk_start']).filter((id) => {
            const loc = LOCATION_MAP[id];
            return loc && loc.requiredLevel <= pLevel;
          });
          return Array.from(new Set(['sidewalk_start', ...list]));
        })(),
        cartTier: Math.max(1, Math.min(CART_UPGRADES.length, Math.floor(saved.cartTier || 1))),
        maxCartTier: Math.max(
          Math.max(1, Math.min(CART_UPGRADES.length, Math.floor(saved.cartTier || 1))),
          Math.min(CART_UPGRADES.length, Math.floor(saved.maxCartTier || saved.cartTier || 1)),
        ),
        shopLevels: { banh_mi: 1, ...(saved.shopLevels || {}) },
        inventory: saved.inventory,
        unlockedRecipes: saved.unlockedRecipes,
        equipment: saved.equipment,
        staff: { ...DEFAULT_STAFF_MAP, ...(saved.staff || {}) },
        staffAssignments: { ...DEFAULT_STAFF_ASSIGNMENTS, ...(saved.staffAssignments || {}) },
        quests: saved.quests,
        achievements: saved.achievements,
        financialHistory: saved.financialHistory,
        currentDayStats: saved.currentDayStats,
        settings: saved.settings,
        tutorialCompleted: saved.tutorialCompleted,
        tutorialStep: saved.tutorialStep,
        isDayRunning: true,
      });
      sounds.setSettings(
        saved.settings.soundEnabled,
        saved.settings.musicEnabled,
        saved.settings.soundVolume,
        saved.settings.musicVolume
      );
    } else {
      sounds.setSettings(true, true);
    }

    // Immediately spawn 2 customers so the street is active and bustling right away!
    if (get().orders.length === 0) {
      get().spawnCustomerOrder(0);
      get().spawnCustomerOrder(1);
    }

    // Initialize waiting customer requests for all currently owned shops
    const activeShopLevels = get().shopLevels;
    Object.keys(activeShopLevels).forEach((sId) => {
      if (activeShopLevels[sId] > 0) {
        get().generateShopCustomerRequest(sId);
      }
    });
  },

  getMaxStorageCapacity: () => {
    const state = get();
    const cart = CART_UPGRADES.find((c) => c.tier === state.cartTier);
    const counterLevel = state.equipment['counter_upgrade'] || 1;
    const fridgeLevel = state.equipment['fridge_upgrade'] || 1;
    const base = 80;
    const cartBonus = cart?.maxCapacityBonus || 0;
    const counter = EQUIPMENT_UPGRADES.find((item) => item.id === 'counter_upgrade');
    const counterBonus = (counterLevel - 1) * (counter?.capacityBonus || 0);
    const fridge = EQUIPMENT_UPGRADES.find((item) => item.id === 'fridge_upgrade');
    const fridgeBonus = (fridgeLevel - 1) * (fridge?.capacityBonus || 0);
    return base + cartBonus + counterBonus + fridgeBonus;
  },

  getTotalStoredItemsCount: () => {
    const inv = get().inventory;
    return Object.values(inv).reduce((a, b) => a + b, 0);
  },

  tick: (deltaSeconds: number) => {
    const state = get();
    if (isResettingGame || !state.isDayRunning || state.activeModal) return;

    const speed = state.settings.gameSpeed || 1;
    const effectiveDelta = deltaSeconds * speed;

    // Advance Day Progress (1 game day = approx 180 real seconds at 1x speed - relaxed, immersive pace)
    const newProgress = state.dayProgress + (effectiveDelta / 180) * 100;

    // Calculate Time of Day based on progress
    let newTimeOfDay: TimeOfDay = 'DAWN';
    if (newProgress >= 80) newTimeOfDay = 'EVENING';
    else if (newProgress >= 55) newTimeOfDay = 'AFTERNOON';
    else if (newProgress >= 35) newTimeOfDay = 'NOON';
    else if (newProgress >= 15) newTimeOfDay = 'MORNING';

    // If day ends, trigger endCurrentDay
    if (newProgress >= 100) {
      set({ dayProgress: 100, isDayRunning: false });
      get().endCurrentDay();
      return;
    }

    // Process Orders waiting time
    let updatedOrders = [...state.orders];
    let lostCount = 0;

    updatedOrders = updatedOrders
      .map((order) => {
        const remaining = order.remainingSeconds - effectiveDelta;
        return {
          ...order,
          remainingSeconds: remaining,
        };
      })
      .filter((order) => {
        if (order.remainingSeconds <= 0 && order.status !== 'READY') {
          // Customer ran out of patience!
          lostCount++;
          sounds.playAngry();
          get().addToast('Khách bỏ đi!', `${order.customerName} đã hết kiên nhẫn và rời quán.`, 'error');
          return false;
        }
        return true;
      });

    // Auto-spawn customer if queue has space
    const location = LOCATION_MAP[state.currentLocationId] || LOCATION_MAP['sidewalk_start'];
    const cart = CART_UPGRADES.find((c) => c.tier === state.cartTier);
    const signboard = EQUIPMENT_UPGRADES.find((item) => item.id === 'signboard_upgrade');
    const signboardLevel = state.equipment['signboard_upgrade'] || 1;
    const signboardBonus = (signboardLevel - 1) * (signboard?.customerFlowBonus || 0);
    const shopFlowBonus = Object.values(state.shopLevels).reduce((sum, level) => sum + level * 0.04, 0);
    const flowMod = (location.customerFlowMultiplier || 1) * (1 + (cart?.prestigeBonus || 0) * 0.2) * (1 + signboardBonus + shopFlowBonus);

    // Dynamic spawn interval: reduced by 10% for a comfortable, balanced customer flow
    const spawnChance = 0.108 * flowMod * effectiveDelta;
    if (updatedOrders.length < state.maxOrdersQueue && (updatedOrders.length === 0 || Math.random() < spawnChance)) {
      get().spawnCustomerOrder();
    }

    // Update reputation slightly if customers lost
    let newReputation = state.reputationRating;
    if (lostCount > 0) {
      newReputation = Math.max(1.0, +(newReputation - 0.05 * lostCount).toFixed(2));
    }

    set((prev) => ({
      dayProgress: newProgress,
      timeOfDay: newTimeOfDay,
      orders: updatedOrders,
      reputationRating: newReputation,
      currentDayStats: {
        ...prev.currentDayStats,
        customersLost: prev.currentDayStats.customersLost + lostCount,
      },
    }));

    // Automation runs after timers and order state are committed, so manual controls
    // and customer patience continue to work normally when it is switched off.
    const fresh = get();
    const readyOrder = fresh.orders.find((order) => order.status === 'READY');
    if (fresh.staff['staff_assistant_1'] && readyOrder) {
      get().serveOrder(readyOrder.id);
    } else if (fresh.autoMode && readyOrder) {
      get().serveOrder(readyOrder.id);
    } else if (fresh.autoMode) {
      const pendingOrder = fresh.orders.find((order) => order.status === 'COOKING' || order.status === 'PENDING');
      if (!pendingOrder) {
        set({ autoCookingOrderId: null, autoCookingRemainingSeconds: 0 });
      } else {
        const recipeId = pendingOrder.items[0]?.recipeId;
        const recipe = recipeId ? RECIPE_MAP[recipeId] : undefined;
        if (recipe) {
          const hasIngredients = recipe.ingredients.every(
            (item) => (fresh.inventory[item.ingredientId] || 0) >= item.quantity,
          );
          if (!hasIngredients) {
            set({ autoMode: false, autoCookingOrderId: null, autoCookingRemainingSeconds: 0 });
            get().addToast('Đã tạm dừng tự động', `Thiếu nguyên liệu để nấu ${recipe.name}. Hãy nhập hàng rồi bật lại.`, 'error');
          } else {
            const sameOrder = fresh.autoCookingOrderId === pendingOrder.id;
            const cart = CART_UPGRADES.find((item) => item.tier === fresh.cartTier);
            const stove = EQUIPMENT_UPGRADES.find((item) => item.id === 'stove_upgrade');
            const counter = EQUIPMENT_UPGRADES.find((item) => item.id === 'counter_upgrade');
            const stoveBonus = ((fresh.equipment.stove_upgrade || 1) - 1) * (stove?.prepTimeReduction || 0);
            const counterBonus = ((fresh.equipment.counter_upgrade || 1) - 1) * (counter?.prepTimeReduction || 0);
            const chefBonus = fresh.staff.staff_cook_1 ? 0.25 : 0;
            const duration = Math.max(1.2, recipe.prepTimeSeconds / (cart?.prepSpeedMultiplier || 1) * (1 - stoveBonus - counterBonus - chefBonus));
            const remaining = sameOrder ? fresh.autoCookingRemainingSeconds - effectiveDelta : duration - effectiveDelta;
            if (remaining <= 0) {
              set({ autoCookingOrderId: null, autoCookingRemainingSeconds: 0 });
              get().finishCooking(recipe.id, 1, pendingOrder.id);
            } else {
              set({
                autoCookingOrderId: pendingOrder.id,
                autoCookingRemainingSeconds: remaining,
                orders: get().orders.map((order) => order.id === pendingOrder.id ? { ...order, status: 'COOKING' } : order),
              });
            }
          }
        }
      }
    }

    // Automated Shop Customer Service by Assigned Staff
    const freshForStaff = get();
    const updatedTimers = { ...freshForStaff.staffAutoServeTimers };
    let timersChanged = false;

    Object.entries(freshForStaff.staffAssignments).forEach(([sId, assignedShopId]) => {
      if (!assignedShopId || !freshForStaff.staff[sId]) return;
      if ((freshForStaff.shopLevels[assignedShopId] || 0) <= 0) return;

      // Do not auto-serve if the player is currently actively inside the workstation modal for this shop
      if (freshForStaff.activeModal === 'SHOP_WORKSTATION' && freshForStaff.selectedShopId === assignedShopId) {
        return;
      }

      const waitingReq = freshForStaff.shopCustomerRequests[assignedShopId];
      if (!waitingReq) return;

      const currentTimer = (updatedTimers[sId] ?? 8) - effectiveDelta;
      if (currentTimer <= 0) {
        const staffMember = INITIAL_STAFF.find((s) => s.id === sId);
        const shopDef = STREET_SHOPS.find((s) => s.id === assignedShopId);
        const bonusMultiplier = 1 + (staffMember?.efficiencyBonus || 0.2);
        const payout = Math.round(waitingReq.payout * bonusMultiplier);
        const xp = Math.round(waitingReq.xpReward * bonusMultiplier);

        sounds.playCash();
        set((prev) => ({
          money: prev.money + payout,
          xp: prev.xp + xp,
          currentDayStats: {
            ...prev.currentDayStats,
            revenue: prev.currentDayStats.revenue + payout,
            customersServed: prev.currentDayStats.customersServed + 1,
          },
        }));

        get().fulfillShopCustomerRequest(assignedShopId);
        get().addToast(
          'Nhân viên phục vụ khách!',
          `${staffMember?.name || 'Nhân viên'} vừa hoàn tất "${waitingReq.serviceName}" tại ${shopDef?.name || 'cửa hàng'} (+${payout.toLocaleString('vi-VN')}đ)!`,
          'money',
        );

        // Next auto-serve interval (calm pace approx 18 - 25s depending on efficiency)
        updatedTimers[sId] = Math.max(16, 24 - (staffMember?.efficiencyBonus || 0.2) * 10);
        timersChanged = true;
      } else {
        updatedTimers[sId] = currentTimer;
        timersChanged = true;
      }
    });

    if (timersChanged) {
      set({ staffAutoServeTimers: updatedTimers });
    }

    if (Date.now() - lastAutosaveAt >= 5000) {
      lastAutosaveAt = Date.now();
      void get().saveCurrentGame();
    }
  },

  spawnCustomerOrder: (tableIdx?: number) => {
    const state = get();
    if (state.orders.length >= state.maxOrdersQueue) return;

    // Pick a customer based on location & time
    const custTypes = CUSTOMER_TYPES;
    const customerType = custTypes[Math.floor(Math.random() * custTypes.length)];

    // Filter unlocked recipes that this customer likes or random unlocked recipe
    const availableRecipes = state.unlockedRecipes.map((id) => RECIPE_MAP[id]).filter(Boolean);
    if (availableRecipes.length === 0) return;

    const matchedFavorites = availableRecipes.filter((r) => customerType.favoriteFoods.includes(r.id));
    const chosenRecipe =
      matchedFavorites.length > 0 && Math.random() < 0.75
        ? matchedFavorites[Math.floor(Math.random() * matchedFavorites.length)]
        : availableRecipes[Math.floor(Math.random() * availableRecipes.length)];

    const quantity = Math.random() < 0.25 ? 2 : 1;
    const location = LOCATION_MAP[state.currentLocationId] || LOCATION_MAP['sidewalk_start'];
    const baseTotal = Math.round(chosenRecipe.sellPrice * quantity * location.spendingPowerMultiplier);

    // Patience influenced by equipment and customer
    const waitTime = customerType.patienceSeconds;

    const newOrder: Order = {
      id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      customerId: `cust_${Date.now()}`,
      customerName: customerType.name,
      customerTypeId: customerType.id,
      items: [{ recipeId: chosenRecipe.id, quantity }],
      totalPrice: baseTotal,
      createdAt: Date.now(),
      maxWaitSeconds: waitTime,
      remainingSeconds: waitTime,
      status: 'PENDING',
      tipAmount: 0,
      tableIndex: tableIdx ?? Math.floor(Math.random() * 3),
    };

    sounds.playBell();
    set((prev) => ({
      orders: [...prev.orders, newOrder],
    }));
  },

  buyIngredient: (ingredientId: string, quantity: number) => {
    const state = get();
    const item = INGREDIENT_MAP[ingredientId];
    if (!item) return false;

    const totalCost = item.costPerUnit * quantity;
    if (state.money < totalCost) {
      sounds.playAngry();
      get().addToast('Không đủ tiền!', `Bạn cần ${totalCost.toLocaleString('vi-VN')}đ để mua ${quantity} ${item.unit} ${item.name}.`, 'error');
      return false;
    }

    const currentTotal = state.getTotalStoredItemsCount();
    const maxCapacity = state.getMaxStorageCapacity();
    if (currentTotal + quantity > maxCapacity) {
      sounds.playAngry();
      get().addToast('Kho hàng đã đầy!', `Kho chỉ chứa tối đa ${maxCapacity} món. Hãy nâng cấp quầy hoặc xe hàng!`, 'error');
      return false;
    }

    sounds.playCash();
    set((prev) => {
      const currentQty = prev.inventory[ingredientId] || 0;
      return {
        money: prev.money - totalCost,
        inventory: {
          ...prev.inventory,
          [ingredientId]: currentQty + quantity,
        },
      };
    });

    get().addToast('Đã nhập hàng!', `Mua ${quantity} ${item.unit} ${item.name} (-${totalCost.toLocaleString('vi-VN')}đ)`, 'money');
    get().saveCurrentGame();
    return true;
  },

  unlockRecipe: (recipeId: string) => {
    const state = get();
    const recipe = RECIPE_MAP[recipeId];
    if (!recipe || state.unlockedRecipes.includes(recipeId)) return false;

    if (state.level < recipe.unlockedAtLevel) {
      get().addToast('Chưa đủ cấp!', `Món ăn này yêu cầu bạn đạt Cấp ${recipe.unlockedAtLevel}.`, 'error');
      return false;
    }

    if (state.money < recipe.unlockCost) {
      get().addToast('Không đủ tiền!', `Phí học bí quyết công thức là ${recipe.unlockCost.toLocaleString('vi-VN')}đ.`, 'error');
      return false;
    }

    sounds.playLevelUp();
    set((prev) => ({
      money: prev.money - recipe.unlockCost,
      unlockedRecipes: [...prev.unlockedRecipes, recipeId],
    }));

    get().addToast('Mở khóa món mới!', `Bạn đã thành thạo món ${recipe.name}!`, 'success');
    get().saveCurrentGame();
    return true;
  },

  openCookingStation: (recipeId?: string) => {
    sounds.playClick();
    set({
      activeModal: 'COOKING',
      cookingRecipeId: recipeId || get().orders[0]?.items[0]?.recipeId || 'banh_mi_thit',
    });
  },

  openShopWorkstation: (shopId: string, serviceId?: string) => {
    sounds.playClick();
    set({
      activeModal: 'SHOP_WORKSTATION',
      selectedShopId: shopId,
      targetServiceId: serviceId || null,
    });
  },

  generateShopCustomerRequest: (shopId: string) => {
    const spec = getShopSpecialization(shopId);
    if (!spec || spec.services.length === 0) return;

    // Pick random service
    const service = spec.services[Math.floor(Math.random() * spec.services.length)];
    const customers = [
      { key: 'cust_student_uni', name: 'Nam Sinh Viên' },
      { key: 'cust_office_worker', name: 'Anh Dân Công Sở' },
      { key: 'cust_neighborhood_auntie', name: 'Bác Hàng Xóm' },
      { key: 'cust_delivery_driver', name: 'Anh Shipper Giao Hàng' },
      { key: 'cust_elderly_citizen', name: 'Bác Cựu Chiến Binh' },
      { key: 'cust_student_school', name: 'Bé Học Sinh' },
      { key: 'cust_factory_worker', name: 'Bác Công Nhân' },
      { key: 'cust_loyal_office_lady', name: 'Chị Kế Toán Văn Phòng' },
    ];
    const cust = customers[Math.floor(Math.random() * customers.length)];

    const request: ShopCustomerRequest = {
      id: `req_${shopId}_${Date.now()}`,
      shopId,
      serviceId: service.id,
      serviceName: service.name,
      serviceIcon: service.icon,
      customerSpriteKey: cust.key,
      customerName: cust.name,
      customerQuote: service.customerQuote,
      payout: service.payout,
      xpReward: service.xpReward,
    };

    set((prev) => ({
      shopCustomerRequests: {
        ...prev.shopCustomerRequests,
        [shopId]: request,
      },
    }));
  },

  fulfillShopCustomerRequest: (shopId: string) => {
    set((prev) => {
      const nextRequests = { ...prev.shopCustomerRequests };
      delete nextRequests[shopId];
      return { shopCustomerRequests: nextRequests };
    });

    // Schedule next customer after 20 - 28 seconds (calmer, natural street pace)
    const delayMs = 20000 + Math.floor(Math.random() * 8000);
    setTimeout(() => {
      const state = get();
      if ((state.shopLevels[shopId] || 0) > 0) {
        state.generateShopCustomerRequest(shopId);
      }
    }, delayMs);
  },

  finishCooking: (recipeId: string, qualityMultiplier = 1.0, orderId?: string) => {
    const state = get();
    const recipe = RECIPE_MAP[recipeId];
    if (!recipe) return false;

    // Check ingredients
    const missing: string[] = [];
    recipe.ingredients.forEach((req) => {
      const stock = state.inventory[req.ingredientId] || 0;
      if (stock < req.quantity) {
        const ing = INGREDIENT_MAP[req.ingredientId];
        missing.push(ing ? ing.name : req.ingredientId);
      }
    });

    if (missing.length > 0) {
      sounds.playAngry();
      get().addToast('Thiếu nguyên liệu!', `Không thể chế biến. Thiếu: ${missing.join(', ')}`, 'error');
      return false;
    }

    // Deduct ingredients
    const newInventory = { ...state.inventory };
    recipe.ingredients.forEach((req) => {
      newInventory[req.ingredientId] = (newInventory[req.ingredientId] || 0) - req.quantity;
    });

    sounds.playSizzle();

    // Check if there is an active order waiting for this recipe
    let orderServed = false;
    const ordersCopy = [...state.orders];
    const targetOrderIndex = ordersCopy.findIndex((order) =>
      (!orderId || order.id === orderId) &&
      (order.status === 'PENDING' || order.status === 'COOKING') &&
      order.items.some((item) => item.recipeId === recipeId && (item.preparedQuantity || 0) < item.quantity),
    );

    if (targetOrderIndex >= 0) {
      const targetOrder = ordersCopy[targetOrderIndex];
      const targetItemIndex = targetOrder.items.findIndex(
        (item) => item.recipeId === recipeId && (item.preparedQuantity || 0) < item.quantity,
      );
      const updatedItems = [...targetOrder.items];
      const targetItem = updatedItems[targetItemIndex];
      const preparedQuantity = (targetItem.preparedQuantity || 0) + 1;
      updatedItems[targetItemIndex] = { ...targetItem, preparedQuantity };
      ordersCopy[targetOrderIndex] = {
        ...targetOrder,
        items: updatedItems,
        status: preparedQuantity >= targetItem.quantity ? 'READY' : 'COOKING',
      };
      orderServed = ordersCopy[targetOrderIndex].status === 'READY';
    }

    // Add XP
    const earnedXP = Math.round(recipe.xpReward * qualityMultiplier);
    const updatedTotalXP = state.xp + earnedXP;
    const { level: newLevel } = calculateLevelFromXP(updatedTotalXP);

    if (newLevel > state.level) {
      sounds.playLevelUp();
      get().addToast('CHÚC MỪNG LÊN CẤP!', `Bạn đã thăng hạng lên Cấp ${newLevel}! Nhiều món và địa điểm mới đã mở!`, 'success');
    }

    // Quests progress for cooking
    const updatedQuests = state.quests.map((q) => {
      if (!q.completed && q.targetType === 'COOK_RECIPE') {
        if (!q.targetRecipeId || q.targetRecipeId === recipeId) {
          const newVal = q.currentValue + 1;
          const completed = newVal >= q.targetValue;
          if (completed) {
            get().addToast('Hoàn thành nhiệm vụ!', `Nhiệm vụ "${q.title}" đã hoàn tất! Hãy mở điện thoại nhận thưởng.`, 'success');
          }
          return { ...q, currentValue: newVal, completed };
        }
      }
      return q;
    });

    set((prev) => ({
      inventory: newInventory,
      orders: ordersCopy,
      xp: updatedTotalXP,
      level: newLevel,
      quests: updatedQuests,
      currentDayStats: {
        ...prev.currentDayStats,
        cogs: prev.currentDayStats.cogs + recipe.baseCost,
      },
    }));

    if (orderServed) {
      const ord = ordersCopy[targetOrderIndex];
      get().addToast('Món đã sẵn sàng!', `${recipe.name} đã hoàn thành, sẵn sàng phục vụ ${ord.customerName}!`, 'info');
    } else if (targetOrderIndex >= 0) {
      const ord = ordersCopy[targetOrderIndex];
      const item = ord.items.find((entry) => entry.recipeId === recipeId);
      get().addToast('Đang chuẩn bị đơn', `${recipe.name}: ${item?.preparedQuantity || 0}/${item?.quantity || 1} phần đã nấu cho ${ord.customerName}.`, 'info');
    } else {
      get().addToast('Chế biến xong!', `Nấu thành công 1 phần ${recipe.name} (+${earnedXP} XP)`, 'success');
    }

    get().saveCurrentGame();
    return true;
  },

  serveOrder: (orderId: string) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return false;

    const cust = CUSTOMER_MAP[order.customerTypeId];

    // Determine tip based on customer type and remaining wait percentage
    const waitRatio = order.remainingSeconds / order.maxWaitSeconds;
    let tip = 0;
    if (cust && Math.random() < cust.tipChance) {
      tip = Math.round(order.totalPrice * (0.1 + waitRatio * 0.15) * cust.budgetMultiplier);
    }

    const totalIncome = order.totalPrice + tip;
    sounds.playCash();
    sounds.playCheer();

    // Rating (3.5 to 5.0 based on speed)
    const orderRating = Math.min(5.0, Math.max(3.5, 3.5 + waitRatio * 1.5));

    // Update Quests
    const updatedQuests = state.quests.map((q) => {
      if (!q.completed) {
        if (q.targetType === 'SERVE_CUSTOMERS') {
          const newVal = q.currentValue + 1;
          const comp = newVal >= q.targetValue;
          if (comp) get().addToast('Nhiệm vụ hoàn thành!', q.title, 'success');
          return { ...q, currentValue: newVal, completed: comp };
        }
        if (q.targetType === 'EARN_MONEY') {
          const newVal = q.currentValue + totalIncome;
          const comp = newVal >= q.targetValue;
          if (comp) get().addToast('Nhiệm vụ hoàn thành!', q.title, 'success');
          return { ...q, currentValue: newVal, completed: comp };
        }
      }
      return q;
    });

    // Check achievement
    const updatedAchievements = state.achievements.map((ach) => {
      if (!ach.achieved) {
        if (ach.id === 'ach_first_sale') return { ...ach, achieved: true, unlockedAt: new Date().toLocaleDateString('vi-VN') };
        if (ach.id === 'ach_vip_favorite' && cust?.isVip && orderRating >= 4.5) return { ...ach, achieved: true, unlockedAt: new Date().toLocaleDateString('vi-VN') };
      }
      return ach;
    });

    // Update recipe sales count
    const recipeId = order.items[0]?.recipeId || 'unknown';
    const currentSales = state.currentDayStats.recipeSalesCount[recipeId] || 0;

    // Reputation update
    const newReputation = Math.min(5.0, +(state.reputationRating * 0.98 + orderRating * 0.02).toFixed(2));

    set((prev) => ({
      money: prev.money + totalIncome,
      lifetimeEarnings: prev.lifetimeEarnings + totalIncome,
      reputationRating: newReputation,
      orders: prev.orders.filter((o) => o.id !== orderId),
      quests: updatedQuests,
      achievements: updatedAchievements,
      currentDayStats: {
        ...prev.currentDayStats,
        revenue: prev.currentDayStats.revenue + totalIncome,
        customersServed: prev.currentDayStats.customersServed + 1,
        ratingsSum: prev.currentDayStats.ratingsSum + orderRating,
        ratingsCount: prev.currentDayStats.ratingsCount + 1,
        recipeSalesCount: {
          ...prev.currentDayStats.recipeSalesCount,
          [recipeId]: currentSales + (order.items[0]?.quantity || 1),
        },
      },
    }));

    get().addToast(
      'Thanh toán thành công!',
      `Thu +${totalIncome.toLocaleString('vi-VN')}đ ${tip > 0 ? `(Đã gồm ${tip.toLocaleString('vi-VN')}đ tiền tip!)` : ''}`,
      'money'
    );

    get().saveCurrentGame();
    return true;
  },

  toggleAutoMode: () => {
    const enabled = !get().autoMode;
    set({ autoMode: enabled, autoCookingOrderId: null, autoCookingRemainingSeconds: 0 });
    get().addToast(
      enabled ? 'Đã bật chế độ tự động' : 'Đã tắt chế độ tự động',
      enabled ? 'Xe sẽ tự nấu đủ số phần khách gọi rồi tự giao món.' : 'Bạn có thể tự nấu và giao món như bình thường.',
      enabled ? 'success' : 'info',
    );
  },

  cancelOrder: (orderId: string) => {
    sounds.playAngry();
    set((prev) => ({
      orders: prev.orders.filter((o) => o.id !== orderId),
      currentDayStats: {
        ...prev.currentDayStats,
        customersLost: prev.currentDayStats.customersLost + 1,
      },
    }));
    get().addToast('Hủy đơn hàng', 'Đã hủy đơn hàng của khách.', 'info');
    get().saveCurrentGame();
  },

  upgradeCartTier: (tier: number) => {
    const state = get();
    const upgrade = CART_UPGRADES.find((c) => c.tier === tier);
    if (!upgrade) return false;

    if (tier !== state.maxCartTier + 1) {
      get().addToast('Không thể nâng cấp xe này!', `Hãy mua lần lượt xe cấp ${state.maxCartTier + 1} tiếp theo.`, 'info');
      return false;
    }
    if (state.level < upgrade.requiredLevel) {
      get().addToast('Chưa đủ cấp!', `Yêu cầu đạt Cấp ${upgrade.requiredLevel} để nâng cấp xe này.`, 'error');
      return false;
    }
    if (state.money < upgrade.cost) {
      get().addToast('Không đủ tiền!', `Chi phí nâng cấp là ${upgrade.cost.toLocaleString('vi-VN')}đ.`, 'error');
      return false;
    }

    sounds.playLevelUp();
    set((prev) => ({
      money: prev.money - upgrade.cost,
      cartTier: tier,
      maxCartTier: tier,
      maxOrdersQueue: Math.min(8, 4 + tier - 1),
    }));

    get().addToast('Nâng cấp xe thành công!', `Bạn đã sở hữu ${upgrade.name}! Sức chứa và danh tiếng tăng vọt!`, 'success');
    get().saveCurrentGame();
    return true;
  },

  selectCartTier: (tier: number) => {
    const state = get();
    const cart = CART_UPGRADES.find((item) => item.tier === tier);
    if (!cart || tier > state.maxCartTier) return false;
    if (tier === state.cartTier) return true;

    set({ cartTier: tier, maxOrdersQueue: Math.min(8, 4 + tier - 1) });
    get().addToast('Đã đổi xe bán hàng!', `Bạn đang sử dụng ${cart.name}.`, 'success');
    get().saveCurrentGame();
    return true;
  },

  buyShop: (shopId: string) => {
    const state = get();
    const shop = STREET_SHOPS.find((item) => item.id === shopId);
    if (!shop) return false;
    if ((state.shopLevels[shopId] || 0) > 0) return false;

    const prerequisite = getShopPrerequisite(shopId);
    if (prerequisite && !(state.shopLevels[prerequisite.id] > 0)) {
      get().addToast('Chưa đủ điều kiện!', `Hãy mua ${prerequisite.name} trước.`, 'error');
      return false;
    }
    if (state.level < shop.requiredLevel) {
      get().addToast('Chưa đủ cấp!', `${shop.name} yêu cầu cấp ${shop.requiredLevel}.`, 'error');
      return false;
    }

    const reqReputation = getRequiredReputationForShop(shop);
    if (state.reputationRating < reqReputation) {
      get().addToast('Chưa đủ uy tín!', `${shop.name} yêu cầu danh tiếng tối thiểu ${reqReputation}⭐ (Hiện có: ${state.reputationRating}⭐).`, 'error');
      return false;
    }

    const reqCartTier = getRequiredCartTierForShop(shop);
    if (state.cartTier < reqCartTier) {
      get().addToast('Chưa đủ cấp xe!', `${shop.name} yêu cầu sở hữu Xe bán hàng Cấp ${reqCartTier} trở lên.`, 'error');
      return false;
    }

    if (state.money < shop.unlockCost) {
      get().addToast('Chưa đủ tiền!', `Cần ${shop.unlockCost.toLocaleString('vi-VN')}đ để mua ${shop.name}.`, 'error');
      return false;
    }

    sounds.playLevelUp();
    set((prev) => ({
      money: prev.money - shop.unlockCost,
      shopLevels: { ...prev.shopLevels, [shopId]: 1 },
    }));
    get().generateShopCustomerRequest(shopId);
    get().addToast('Mua cửa hàng thành công!', `${shop.name} bắt đầu mang lại ${shop.dailyBonusIncome.toLocaleString('vi-VN')}đ/ngày.`, 'success');
    get().saveCurrentGame();
    return true;
  },

  upgradeShop: (shopId: string) => {
    const state = get();
    const shop = STREET_SHOPS.find((item) => item.id === shopId);
    const currentLevel = state.shopLevels[shopId] || 0;
    if (!shop || currentLevel < 1) return false;
    if (currentLevel >= 3) {
      get().addToast('Đã đạt tối đa!', `${shop.name} đã nâng cấp cấp 3.`, 'info');
      return false;
    }

    const requiredLevel = getShopUpgradeRequiredLevel(shop, currentLevel);
    const cost = getShopUpgradeCost(shop, currentLevel);
    if (state.level < requiredLevel) {
      get().addToast('Chưa đủ cấp!', `Nâng lên cấp ${currentLevel + 1} cần người chơi cấp ${requiredLevel}.`, 'error');
      return false;
    }
    if (state.money < cost) {
      get().addToast('Chưa đủ tiền!', `Cần ${cost.toLocaleString('vi-VN')}đ để nâng cấp ${shop.name}.`, 'error');
      return false;
    }

    sounds.playLevelUp();
    set((prev) => ({
      money: prev.money - cost,
      shopLevels: { ...prev.shopLevels, [shopId]: currentLevel + 1 },
    }));
    get().addToast('Nâng cấp cửa hàng thành công!', `${shop.name} hiện ở cấp ${currentLevel + 1}, tăng thu nhập và lượng khách.`, 'success');
    get().saveCurrentGame();
    return true;
  },

  upgradeEquipmentItem: (id: string) => {
    const state = get();
    const item = EQUIPMENT_UPGRADES.find((e) => e.id === id);
    if (!item) return false;

    const currentLevel = state.equipment[id] || 1;
    if (state.level < item.requiredLevel) {
      get().addToast('Chưa đủ cấp!', `Cần đạt Cấp ${item.requiredLevel} để nâng cấp ${item.name}.`, 'error');
      return false;
    }
    if (currentLevel >= item.maxLevel) {
      get().addToast('Đã đạt tối đa!', 'Thiết bị này đã nâng cấp tối đa cấp độ.', 'info');
      return false;
    }

    const upgradeCost = Math.round(item.cost * Math.pow(1.5, currentLevel - 1));
    if (state.money < upgradeCost) {
      get().addToast('Không đủ tiền!', `Cần ${upgradeCost.toLocaleString('vi-VN')}đ để nâng cấp ${item.name}.`, 'error');
      return false;
    }

    sounds.playCash();
    set((prev) => ({
      money: prev.money - upgradeCost,
      equipment: {
        ...prev.equipment,
        [id]: currentLevel + 1,
      },
    }));

    get().addToast('Nâng cấp thiết bị!', `${item.name} đã lên Cấp ${currentLevel + 1}!`, 'success');
    get().saveCurrentGame();
    return true;
  },

  hireStaffMember: (id: string) => {
    const state = get();
    const staffMember = INITIAL_STAFF.find((s) => s.id === id);
    if (!staffMember) return false;

    if (state.staff[id]) return false;

    if (state.level < staffMember.requiredLevel) {
      get().addToast('Chưa đủ cấp!', `Cần đạt Cấp ${staffMember.requiredLevel} để tuyển ${staffMember.name}.`, 'error');
      return false;
    }

    if (state.money < staffMember.hiringCost) {
      get().addToast('Không đủ tiền!', `Phí tuyển dụng ban đầu là ${staffMember.hiringCost.toLocaleString('vi-VN')}đ.`, 'error');
      return false;
    }

    sounds.playLevelUp();
    set((prev) => ({
      money: prev.money - staffMember.hiringCost,
      staff: {
        ...prev.staff,
        [id]: true,
      },
    }));

    get().addToast('Đã tuyển nhân viên!', `${staffMember.name} (${staffMember.title}) đã gia nhập gánh hàng rong của bạn!`, 'success');
    get().saveCurrentGame();
    return true;
  },

  assignStaffToShop: (staffId: string, shopId: string | null) => {
    const state = get();
    if (!state.staff[staffId]) {
      get().addToast('Chưa thuê nhân viên!', 'Bạn cần tuyển dụng nhân viên này trước khi điều phối.', 'error');
      return false;
    }

    const staffMember = INITIAL_STAFF.find((s) => s.id === staffId);
    if (!staffMember) return false;

    if (shopId === null || shopId === '' || shopId === 'none') {
      set((prev) => ({
        staffAssignments: {
          ...prev.staffAssignments,
          [staffId]: null,
        },
      }));
      get().addToast('Hủy phân công', `Đã chuyển ${staffMember.name} về trạng thái chờ việc.`, 'info');
      get().saveCurrentGame();
      return true;
    }

    if ((state.shopLevels[shopId] || 0) <= 0) {
      get().addToast('Chưa mở cửa hàng!', 'Cần mua cửa hàng này trước khi phân công nhân viên tới.', 'error');
      return false;
    }

    const shopDef = STREET_SHOPS.find((s) => s.id === shopId);
    const shopName = shopDef?.name || 'cửa hàng';

    // If another staff was already assigned to this shop, unassign them
    const updatedAssignments = { ...state.staffAssignments };
    Object.keys(updatedAssignments).forEach((sId) => {
      if (updatedAssignments[sId] === shopId && sId !== staffId) {
        updatedAssignments[sId] = null;
      }
    });
    updatedAssignments[staffId] = shopId;

    sounds.playLevelUp();
    set({
      staffAssignments: updatedAssignments,
      staffAutoServeTimers: {
        ...state.staffAutoServeTimers,
        [staffId]: 14, // Starts first auto-serve in 14s (relaxed pace)
      },
    });

    get().addToast(
      'Điều phối nhân sự thành công!',
      `Đã phân công ${staffMember.name} tới phụ trách & phục vụ khách tại ${shopName}!`,
      'success',
    );
    get().saveCurrentGame();
    return true;
  },

  unassignStaff: (staffId: string) => {
    return get().assignStaffToShop(staffId, null);
  },

  travelToLocation: (locationId: string) => {
    const state = get();
    const loc = LOCATION_MAP[locationId];
    if (!loc) return false;

    if (state.level < loc.requiredLevel) {
      get().addToast('Chưa đủ cấp!', `Khu vực "${loc.name}" yêu cầu Cấp ${loc.requiredLevel}.`, 'error');
      return false;
    }

    const isUnlocked = state.unlockedLocations.includes(locationId) || loc.unlockCost === 0;
    if (!isUnlocked && state.money < loc.unlockCost) {
      get().addToast('Không đủ tiền!', `Cần ${loc.unlockCost.toLocaleString('vi-VN')}đ để mở ${loc.name}.`, 'error');
      return false;
    }

    sounds.playClick();
    set((prev) => ({
      money: isUnlocked ? prev.money : prev.money - loc.unlockCost,
      unlockedLocations: isUnlocked ? prev.unlockedLocations : [...prev.unlockedLocations, locationId],
      currentLocationId: locationId,
      activeModal: null,
    }));

    get().addToast(isUnlocked ? 'Chuyển địa điểm bán!' : 'Đã mở địa điểm mới!', `Chào mừng bạn đến với ${loc.name}! ${loc.tagline}`, isUnlocked ? 'info' : 'success');
    get().saveCurrentGame();
    return true;
  },

  claimQuest: (questId: string) => {
    const state = get();
    const quest = state.quests.find((q) => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    sounds.playCash();
    sounds.playLevelUp();

    const newXP = state.xp + quest.rewardXP;
    const { level: newLevel } = calculateLevelFromXP(newXP);

    set((prev) => ({
      money: prev.money + quest.rewardMoney,
      xp: newXP,
      level: newLevel,
      quests: prev.quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q)),
    }));

    get().addToast(
      'Nhận thưởng nhiệm vụ!',
      `+${quest.rewardMoney.toLocaleString('vi-VN')}đ & +${quest.rewardXP} XP!`,
      'money'
    );
    get().saveCurrentGame();
  },

  endCurrentDay: () => {
    const state = get();
    const loc = LOCATION_MAP[state.currentLocationId] || LOCATION_MAP['sidewalk_start'];

    // Calculate wages of hired staff
    let totalWages = 0;
    INITIAL_STAFF.forEach((s) => {
      if (state.staff[s.id]) {
        totalWages += s.dailyWage;
      }
    });

    const rent = loc.dailyRent || 0;
    const shopIncome = STREET_SHOPS.reduce(
      (total, shop) => total + (state.shopLevels[shop.id] || 0) * shop.dailyBonusIncome,
      0,
    );
    const revenue = state.currentDayStats.revenue + shopIncome;
    const cogs = state.currentDayStats.cogs;
    const netProfit = revenue - cogs - rent - totalWages;

    // Best seller recipe
    let bestSellerId = 'banh_mi_thit';
    let maxSold = 0;
    Object.entries(state.currentDayStats.recipeSalesCount).forEach(([rId, qty]) => {
      if (qty > maxSold) {
        maxSold = qty;
        bestSellerId = rId;
      }
    });

    const averageRating =
      state.currentDayStats.ratingsCount > 0
        ? +(state.currentDayStats.ratingsSum / state.currentDayStats.ratingsCount).toFixed(1)
        : state.reputationRating;

    const record: DailyFinancialRecord = {
      day: state.day,
      dateStr: `Ngày ${state.day}`,
      revenue,
      cogs,
      rent,
      wages: totalWages,
      upgrades: 0,
      netProfit,
      customersServed: state.currentDayStats.customersServed,
      customersLost: state.currentDayStats.customersLost,
      averageRating,
      bestSellerRecipeId: bestSellerId,
      wastedIngredientsCost: 0,
    };

    const totalExpenses = rent + totalWages;
    const netDayEndCashDelta = shopIncome - totalExpenses;
    const newMoney = Math.max(0, state.money + netDayEndCashDelta);

    if (state.money + netDayEndCashDelta < 0) {
      get().addToast(
        'Thâm hụt tài chính!',
        `Doanh thu hôm nay không đủ trả tiền thuê mặt bằng và lương nhân viên (${totalExpenses.toLocaleString('vi-VN')}đ).`,
        'error',
      );
    }

    set({
      money: newMoney,
      isDayRunning: false,
      activeModal: 'DAY_END',
      financialHistory: [record, ...state.financialHistory],
    });

    get().saveCurrentGame();
  },

  startNextDay: () => {
    const state = get();
    const weathers: WeatherType[] = ['SUNNY', 'HOT', 'CLOUDY', 'RAIN'];
    const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];

    // Reset daily quests
    const resetQuests = state.quests.map((q) => {
      if (q.type === 'DAILY') {
        return {
          ...q,
          currentValue: 0,
          completed: false,
          claimed: false,
        };
      }
      return q;
    });

    set({
      day: state.day + 1,
      timeOfDay: 'DAWN',
      weather: nextWeather,
      dayProgress: 0,
      isDayRunning: true,
      activeModal: null,
      orders: [],
      quests: resetQuests,
      currentDayStats: {
        revenue: 0,
        cogs: 0,
        customersServed: 0,
        customersLost: 0,
        ratingsSum: 0,
        ratingsCount: 0,
        recipeSalesCount: {},
      },
    });

    get().addToast('Ngày mới bắt đầu!', `Chào đón Ngày ${state.day + 1} kinh doanh phát đạt!`, 'info');
    get().saveCurrentGame();
  },

  openModal: (modal: ModalType, meta?: string) => {
    sounds.playClick();
    if (meta && modal === 'SMARTPHONE') {
      set({ activeModal: modal, smartphoneApp: meta });
    } else {
      set({ activeModal: modal });
    }
  },

  closeModal: () => {
    sounds.playClick();
    set({ activeModal: null });
  },

  setSmartphoneApp: (appName: string) => {
    sounds.playClick();
    set({ smartphoneApp: appName });
  },

  updateSettings: (newSettings: Partial<GameSettings>) => {
    const current = get().settings;
    const merged = { ...current, ...newSettings };
    set({ settings: merged });
    sounds.setSettings(merged.soundEnabled, merged.musicEnabled, merged.soundVolume, merged.musicVolume);
    get().saveCurrentGame();
  },

  advanceTutorial: () => {
    const current = get().tutorialStep;
    if (current >= 9) {
      set({ tutorialCompleted: true, tutorialStep: 10 });
      get().addToast('TỐT NGHIỆP KHỞI NGHIỆP!', 'Chúc mừng bạn đã hoàn thành khóa hướng dẫn bán hàng rong!', 'success');
    } else {
      set({ tutorialStep: current + 1 });
    }
    get().saveCurrentGame();
  },

  skipTutorial: () => {
    set({ tutorialCompleted: true });
    get().addToast('Đã bỏ qua hướng dẫn', 'Bạn có thể tự do kinh doanh theo ý muốn!', 'info');
    get().saveCurrentGame();
  },

  addToast: (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    set((prev) => ({
      toasts: [...prev.toasts.slice(-4), newToast],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 3800);
  },

  removeToast: (id: string) => {
    set((prev) => ({
      toasts: prev.toasts.filter((t) => t.id !== id),
    }));
  },

  saveCurrentGame: async () => {
    if (isResettingGame) return;
    const state = get();
    const schema: SaveSchema = {
      version: 1,
      timestamp: Date.now(),
      player: {
        name: state.playerName,
        level: state.level,
        xp: state.xp,
        xpForNextLevel: calculateLevelFromXP(state.xp).xpForNext,
        money: state.money,
        lifetimeEarnings: state.lifetimeEarnings,
        reputationRating: state.reputationRating,
        gender: state.gender,
        outfitColor: '#ea580c',
      },
      time: {
        day: state.day,
        timeOfDay: state.timeOfDay,
        weather: state.weather,
        dayProgressPercent: state.dayProgress,
      },
      currentLocationId: state.currentLocationId,
      unlockedLocations: state.unlockedLocations,
      cartTier: state.cartTier,
      maxCartTier: state.maxCartTier,
      shopLevels: state.shopLevels,
      inventory: state.inventory,
      unlockedRecipes: state.unlockedRecipes,
      equipment: state.equipment,
      staff: state.staff,
      staffAssignments: state.staffAssignments,
      quests: state.quests,
      achievements: state.achievements,
      financialHistory: state.financialHistory,
      currentDayStats: state.currentDayStats,
      settings: state.settings,
      tutorialCompleted: state.tutorialCompleted,
      tutorialStep: state.tutorialStep,
    };

    await SaveSystem.saveGame(schema);
  },

  resetAllProgress: async () => {
    isResettingGame = true;

    // 1. Immediately reset in-memory state back to clean Day 1 defaults
    set({
      playerName: 'Bé Hàng Rong',
      gender: 'BOY',
      money: 50000,
      xp: 0,
      level: 1,
      reputationRating: 4.0,
      lifetimeEarnings: 0,
      day: 1,
      timeOfDay: 'DAWN',
      weather: 'SUNNY',
      dayProgress: 0,
      isDayRunning: false,
      currentLocationId: 'sidewalk_start',
      unlockedLocations: ['sidewalk_start'],
      cartTier: 1,
      maxCartTier: 1,
      shopLevels: { banh_mi: 1 },
      inventory: { ...DEFAULT_INVENTORY },
      unlockedRecipes: ['banh_mi_thit', 'xoi_xeo', 'tra_da', 'nuoc_mia', 'banh_trang_tron'],
      equipment: {
        stove_upgrade: 1,
        fridge_upgrade: 1,
        counter_upgrade: 1,
        signboard_upgrade: 1,
      },
      staff: { ...DEFAULT_STAFF_MAP },
      staffAssignments: { ...DEFAULT_STAFF_ASSIGNMENTS },
      staffAutoServeTimers: {},
      orders: [],
      maxOrdersQueue: 4,
      quests: [...INITIAL_QUESTS],
      achievements: [...INITIAL_ACHIEVEMENTS],
      financialHistory: [],
      currentDayStats: {
        revenue: 0,
        cogs: 0,
        customersServed: 0,
        customersLost: 0,
        ratingsSum: 0,
        ratingsCount: 0,
        recipeSalesCount: {},
      },
      activeModal: null,
      smartphoneApp: 'MARKET',
      cookingRecipeId: null,
      selectedShopId: null,
      targetServiceId: null,
      shopCustomerRequests: {},
      autoMode: false,
      autoCookingOrderId: null,
      autoCookingRemainingSeconds: 0,
      tutorialCompleted: false,
      tutorialStep: 0,
    });

    // 2. Wipe IndexedDB database and all localStorage entries
    await SaveSystem.clearSave();

    // 3. Reload cleanly into fresh session
    setTimeout(() => {
      window.location.href = window.location.origin + window.location.pathname;
    }, 150);
  },
}));
