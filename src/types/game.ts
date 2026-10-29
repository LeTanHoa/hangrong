export type TimeOfDay = 'DAWN' | 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING';

export type WeatherType = 'SUNNY' | 'HOT' | 'CLOUDY' | 'RAIN';

export type FoodCategory = 'BREAKFAST' | 'SNACK' | 'DRINK';

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  category: 'MEAT' | 'VEGGIE' | 'DRY' | 'DRINK_BASE' | 'SEASONING';
  shelfLifeDays: number;
  icon: string;
  supplierName: string;
}

export interface InventoryItem {
  ingredientId: string;
  quantity: number;
  maxCapacity: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: FoodCategory;
  description: string;
  ingredients: RecipeIngredient[];
  prepTimeSeconds: number; // in-game cooking time
  baseCost: number; // calculated cost
  sellPrice: number;
  xpReward: number;
  unlockedAtLevel: number;
  icon: string;
  ratingScore?: number;
  popularTimes: TimeOfDay[];
  unlockCost: number;
  isUnlocked: boolean;
}

export interface CustomerType {
  id: string;
  name: string;
  title: string;
  description: string;
  spriteColor: number;
  shirtColor: number;
  hairColor: number;
  accessory?: 'backpack' | 'glasses' | 'hat' | 'phone' | 'helmet' | 'tie';
  budgetMultiplier: number;
  patienceSeconds: number;
  speed: number;
  favoriteFoods: string[];
  tipChance: number;
  isVip?: boolean;
}

export type OrderStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'EXPIRED';

export interface OrderItem {
  recipeId: string;
  quantity: number;
  preparedQuantity?: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerTypeId: string;
  items: OrderItem[];
  totalPrice: number;
  createdAt: number;
  maxWaitSeconds: number;
  remainingSeconds: number;
  status: OrderStatus;
  tipAmount: number;
  tableIndex?: number;
}

export interface CartUpgrade {
  id: string;
  tier: number;
  name: string;
  description: string;
  cost: number;
  requiredLevel: number;
  maxCapacityBonus: number;
  prepSpeedMultiplier: number;
  prestigeBonus: number; // increases customer spawn rate & star rating
  spriteKey: string;
}

export interface EquipmentUpgrade {
  id: string;
  name: string;
  category: 'STOVE' | 'FRIDGE' | 'COUNTER' | 'SIGNBOARD';
  level: number;
  maxLevel: number;
  cost: number;
  requiredLevel: number;
  effectDescription: string;
  prepTimeReduction: number;
  shelfLifeBonus: number;
  capacityBonus: number;
  customerFlowBonus: number;
}

export type StaffRole =
  | 'ASSISTANT'
  | 'CHEF'
  | 'CLEANER'
  | 'MARKETER'
  | 'BARISTA'
  | 'MECHANIC'
  | 'BARBER'
  | 'CASHIER'
  | 'BAKER'
  | 'SHIPPER'
  | 'MANAGER';

export interface Staff {
  id: string;
  name: string;
  avatar: string;
  dailyWage: number;
  hiringCost: number;
  requiredLevel: number;
  hired: boolean;
  skillLevel: number;
  efficiencyBonus: number;
  role?: StaffRole;
  title?: string;
  description?: string;
}

export interface LocationArea {
  id: string;
  name: string;
  tagline: string;
  description: string;
  requiredLevel: number;
  unlockCost: number;
  dailyRent: number;
  customerFlowMultiplier: number;
  spendingPowerMultiplier: number;
  unlocked: boolean;
  bgAtmosphere: string;
  popularCategories: FoodCategory[];
  bgAssetKey: string;
  cartLayout: { x: number; y: number; scale?: number };
  tableLayouts: Array<{ x: number; y: number; stoolType: 'red' | 'blue' }>;
  queueStart: { x: number; y: number };
  walkZone: { minX: number; maxX: number; minY: number; maxY: number };
  specialPropDesc: string;
  /** Independent objects placed above the background; coordinates use the 800x450 stage. */
  mapProps?: MapPropLayout[];
  expansionPoints?: Array<{ id: string; x: number; y: number; label: string }>;
}

export interface MapPropLayout {
  id: string;
  assetKey: string;
  x: number;
  y: number;
  scale?: number;
  interactive?: boolean;
  name?: string;
  dialogue?: string;
}


export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'CHAPTER' | 'MILESTONE';
  targetType: 'SERVE_CUSTOMERS' | 'EARN_MONEY' | 'COOK_RECIPE' | 'UPGRADE_CART' | 'REACH_RATING';
  targetValue: number;
  currentValue: number;
  targetRecipeId?: string;
  rewardMoney: number;
  rewardXP: number;
  rewardBadge?: string;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  unlockedAt?: string;
}

export interface DailyFinancialRecord {
  day: number;
  dateStr: string;
  revenue: number;
  cogs: number; // Cost of Goods Sold
  rent: number;
  wages: number;
  upgrades: number;
  netProfit: number;
  customersServed: number;
  customersLost: number;
  averageRating: number;
  bestSellerRecipeId: string;
  wastedIngredientsCost: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  gameSpeed: number; // 1, 1.5, 2
  joystickEnabled: boolean;
}

export interface SaveSchema {
  version: number;
  timestamp: number;
  player: {
    name: string;
    level: number;
    xp: number;
    xpForNextLevel: number;
    money: number;
    lifetimeEarnings: number;
    reputationRating: number; // 1.0 to 5.0
    gender: 'BOY' | 'GIRL';
    outfitColor: string;
  };
  time: {
    day: number;
    timeOfDay: TimeOfDay;
    weather: WeatherType;
    dayProgressPercent: number; // 0 to 100
  };
  currentLocationId: string;
  unlockedLocations?: string[];
  cartTier: number;
  maxCartTier?: number;
  shopLevels?: Record<string, number>;
  inventory: Record<string, number>;
  unlockedRecipes: string[];
  equipment: Record<string, number>;
  staff: Record<string, boolean>;
  staffAssignments?: Record<string, string | null>;
  quests: Quest[];
  achievements: Achievement[];
  financialHistory: DailyFinancialRecord[];
  currentDayStats: {
    revenue: number;
    cogs: number;
    customersServed: number;
    customersLost: number;
    ratingsSum: number;
    ratingsCount: number;
    recipeSalesCount: Record<string, number>;
    shopDailyStats?: Record<string, { itemsSold: number; revenue: number }>;
  };
  settings: GameSettings;
  tutorialCompleted: boolean;
  tutorialStep: number;
}
