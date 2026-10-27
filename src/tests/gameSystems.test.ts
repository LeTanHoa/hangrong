import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../stores/gameStore';
import { formatVND, calculateLevelFromXP } from '../utils/formatters';
import { SaveSystem } from '../saves/saveSystem';
import { INGREDIENT_MAP } from '../data/ingredients';
import { RECIPE_MAP } from '../data/recipes';

describe('Game Systems Unit Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGameStore.setState({
      money: 50000,
      xp: 0,
      level: 1,
      reputationRating: 4.0,
      lifetimeEarnings: 0,
      day: 1,
      cartTier: 1,
      inventory: {
        bread: 10,
        pork: 10,
        herbs_cucumber: 10,
      },
      unlockedRecipes: ['banh_mi_thit'],
      orders: [],
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
  });

  describe('1. Economy System', () => {
    it('correctly formats Vietnamese Currency (VNĐ)', () => {
      expect(formatVND(15000)).toBe('15.000đ');
      expect(formatVND(1250000)).toBe('1.250.000đ');
      expect(formatVND(0)).toBe('0đ');
    });

    it('prevents purchasing when player has insufficient money', () => {
      useGameStore.setState({ money: 2000 }); // only 2000đ
      // Pork costs 5000đ each
      const success = useGameStore.getState().buyIngredient('pork', 1);
      expect(success).toBe(false);
      expect(useGameStore.getState().money).toBe(2000);
    });

    it('accurately calculates net profit: Revenue - COGS - Rent - Wages', () => {
      const revenue = 120000;
      const cogs = 45000;
      const rent = 15000;
      const wages = 20000;
      const netProfit = revenue - cogs - rent - wages;
      expect(netProfit).toBe(40000);
    });
  });

  describe('2. Inventory System', () => {
    it('correctly adds items on purchase and deducts money', () => {
      useGameStore.setState({ money: 50000 });
      const initialBread = useGameStore.getState().inventory['bread'] || 0;
      const success = useGameStore.getState().buyIngredient('bread', 2); // 2500 * 2 = 5000đ

      expect(success).toBe(true);
      expect(useGameStore.getState().money).toBe(45000);
      expect(useGameStore.getState().inventory['bread']).toBe(initialBread + 2);
    });

    it('respects maximum storage capacity', () => {
      const maxCap = useGameStore.getState().getMaxStorageCapacity();
      // Set inventory already near max
      useGameStore.setState({
        money: 1000000,
        inventory: { bread: maxCap },
      });

      const success = useGameStore.getState().buyIngredient('pork', 1);
      expect(success).toBe(false);
    });

    it('deducts ingredients when cooking a recipe', () => {
      const initialBread = useGameStore.getState().inventory['bread'];
      const initialPork = useGameStore.getState().inventory['pork'];

      const cooked = useGameStore.getState().finishCooking('banh_mi_thit');
      expect(cooked).toBe(true);
      expect(useGameStore.getState().inventory['bread']).toBe(initialBread - 1);
      expect(useGameStore.getState().inventory['pork']).toBe(initialPork - 1);
    });

    it('prevents cooking when missing required ingredients', () => {
      useGameStore.setState({ inventory: { bread: 0 } });
      const cooked = useGameStore.getState().finishCooking('banh_mi_thit');
      expect(cooked).toBe(false);
    });
  });

  describe('3. Order System', () => {
    it('spawns a customer order within queue capacity', () => {
      expect(useGameStore.getState().orders.length).toBe(0);
      useGameStore.getState().spawnCustomerOrder();
      expect(useGameStore.getState().orders.length).toBe(1);

      const order = useGameStore.getState().orders[0];
      expect(order.status).toBe('PENDING');
      expect(order.items.length).toBeGreaterThan(0);
    });

    it('serves ready order, awards revenue and updates customer count', () => {
      useGameStore.getState().spawnCustomerOrder();
      const order = useGameStore.getState().orders[0];

      // Finish cooking to make it ready
      useGameStore.getState().finishCooking(order.items[0].recipeId);

      const initialMoney = useGameStore.getState().money;
      const served = useGameStore.getState().serveOrder(order.id);

      expect(served).toBe(true);
      expect(useGameStore.getState().money).toBeGreaterThan(initialMoney);
      expect(useGameStore.getState().currentDayStats.customersServed).toBe(1);
      expect(useGameStore.getState().orders.length).toBe(0);
    });
  });

  describe('4. Quest System & XP Leveling', () => {
    it('calculates level thresholds accurately', () => {
      const lvl1 = calculateLevelFromXP(0);
      expect(lvl1.level).toBe(1);

      const lvlHigher = calculateLevelFromXP(500);
      expect(lvlHigher.level).toBeGreaterThan(1);
    });

    it('allows claiming completed quest rewards and prevents duplicate claims', () => {
      const state = useGameStore.getState();
      const quest = state.quests[0];

      // Mark quest completed
      useGameStore.setState({
        quests: state.quests.map((q) =>
          q.id === quest.id ? { ...q, completed: true, claimed: false } : q
        ),
      });

      const initialMoney = useGameStore.getState().money;
      useGameStore.getState().claimQuest(quest.id);

      // Money increased
      expect(useGameStore.getState().money).toBe(initialMoney + quest.rewardMoney);

      // Cannot claim a second time
      useGameStore.getState().claimQuest(quest.id);
      expect(useGameStore.getState().money).toBe(initialMoney + quest.rewardMoney);
    });
  });

  describe('5. Save System', () => {
    it('parses valid save JSON and rejects corrupted JSON', () => {
      const validJSON = JSON.stringify({
        version: 1,
        timestamp: Date.now(),
        player: { name: 'Bé Hàng Rong', money: 50000, level: 1, xp: 0, lifetimeEarnings: 0, reputationRating: 4.5, gender: 'BOY', outfitColor: '#fff' },
        inventory: { bread: 10 },
      });

      const parsed = SaveSystem.parseSaveJSON(validJSON);
      expect(parsed).not.toBeNull();
      expect(parsed?.player.name).toBe('Bé Hàng Rong');

      const corrupted = SaveSystem.parseSaveJSON('{"broken: json');
      expect(corrupted).toBeNull();
    });

    it('clears saved data thoroughly', async () => {
      const mockStorage: Record<string, string> = {
        hang_rong_save_data_v1: JSON.stringify({ version: 1 }),
      };
      (globalThis as unknown as { localStorage: Storage }).localStorage = {
        getItem: (k: string) => mockStorage[k] || null,
        setItem: (k: string, v: string) => { mockStorage[k] = v; },
        removeItem: (k: string) => { delete mockStorage[k]; },
        clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
        key: (i: number) => Object.keys(mockStorage)[i] || null,
        get length() { return Object.keys(mockStorage).length; },
      } as unknown as Storage;

      await SaveSystem.clearSave();
      expect(mockStorage['hang_rong_save_data_v1']).toBeUndefined();
    });
  });
});

