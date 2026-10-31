import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
  SUPERMARKET_SHELVES,
  SupermarketShelfDef,
  SupermarketProduct,
  getSupermarketProductsForShelf,
} from '../data/supermarket';
import { formatVND } from '../utils/formatters';
import { sounds } from '../audio/soundSystem';
import {
  X,
  ShoppingCart,
  Check,
  CreditCard,
  Plus,
  Minus,
  Sparkles,
  Store,
  ChevronRight,
  Package,
  Coins,
  ArrowRight,
  Scan,
  Compass,
  Eye,
  Sliders,
  MoveUp,
  MoveDown,
  RotateCcw,
  Volume2,
  Navigation,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  MousePointer,
} from 'lucide-react';

interface CartItem {
  product: SupermarketProduct;
  quantity: number;
}

// 6 Interactive Supermarket Counters with 3D POV details
interface SupermarketCounter {
  id: string;
  name: string;
  shortName: string;
  categoryTitle: string;
  icon: string;
  tagline: string;
  bannerColor: string;
  accentColor: string;
  radarX: number; // Percentage on radar
  radarY: number;
  shelfDef: SupermarketShelfDef;
  featuredBadges: string[];
  bgImage: string;
}

export const SupermarketModal: React.FC = () => {
  const store = useGameStore();

  // Custom Background Override (if user manually selects a favorite background)
  const [customBgOverride, setCustomBgOverride] = useState<string | null>(null);
  const [isBgSelectorOpen, setIsBgSelectorOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // 6 Distinct Counters (Quầy hàng siêu thị) that player can move between
  const counters: SupermarketCounter[] = useMemo(
    () => [
      {
        id: 'counter_produce',
        name: 'Quầy Trái Cây & Nông Sản Tươi Ngon',
        shortName: 'Trái Cây & Rau',
        categoryTitle: 'NÔNG SẢN VIETGAP ĐÀ LẠT',
        icon: '🍎',
        tagline: 'Trái cây nhập mới mỗi ngày, rau củ quả chuẩn VietGAP 29.000đ/kg',
        bannerColor: '#16a34a',
        accentColor: '#4ade80',
        radarX: 25,
        radarY: 35,
        shelfDef: SUPERMARKET_SHELVES[0],
        featuredBadges: ['Tươi Ngon Mỗi Ngày', '29.000đ/kg', 'VietGAP Sạch'],
        bgImage: '/assets/supermarket/bg_counter_produce.jpg',
      },
      {
        id: 'counter_snack',
        name: 'Quầy Bánh Kẹo & Snack Khuyến Mãi',
        shortName: 'Bánh Kẹo & Snack',
        categoryTitle: 'BÁNH KẸO & ĐỒ KHÔ KHUYẾN MÃI',
        icon: '🍟',
        tagline: 'Khoai tây Lay\'s, snack giòn rụm, bánh tráng dẻo ưu đãi giờ vàng',
        bannerColor: '#dc2626',
        accentColor: '#f87171',
        radarX: 75,
        radarY: 35,
        shelfDef: SUPERMARKET_SHELVES[2],
        featuredBadges: ['Khuyến Mãi Hấp Dẫn %', 'Giảm 10%', 'Mua 2 Tặng 1'],
        bgImage: '/assets/supermarket/bg_counter_snack.jpg',
      },
      {
        id: 'counter_dairy',
        name: 'Quầy Sữa Tươi & Đồ Uống Giải Khát',
        shortName: 'Sữa & Nước',
        categoryTitle: 'SỮA TƯƠI VINAMILK & GIẢI KHÁT',
        icon: '🥛',
        tagline: 'Sữa tươi tiệt trùng 100%, sữa đặc Ông Thọ, cà phê Robusta, nước dừa',
        bannerColor: '#0284c7',
        accentColor: '#38bdf8',
        radarX: 80,
        radarY: 65,
        shelfDef: SUPERMARKET_SHELVES[3],
        featuredBadges: ['Vinamilk 100%', 'Bảo Quản Lạnh 4°C', 'Bình Ổn Giá'],
        bgImage: '/assets/supermarket/bg_counter_dairy.jpg',
      },
      {
        id: 'counter_meat',
        name: 'Quầy Thực Phẩm Sạch & Thịt Co.op Food',
        shortName: 'Thịt & Hải Sản',
        categoryTitle: 'THỊT TƯƠI SẠCH CO.OP FOOD',
        icon: '🥩',
        tagline: 'Thịt heo xá xíu, thịt bò phi lê tươi mổ sớm, chả lụa gia truyền',
        bannerColor: '#b91c1c',
        accentColor: '#ef4444',
        radarX: 20,
        radarY: 65,
        shelfDef: SUPERMARKET_SHELVES[1],
        featuredBadges: ['Tiêu Chuẩn HACCP', 'Mổ Sớm 4h', 'Tươi Ngon 100%'],
        bgImage: '/assets/supermarket/bg_counter_meat.jpg',
      },
      {
        id: 'counter_bakery',
        name: 'Lò Bánh Mì Co.op Bakery Nóng Hổi',
        shortName: 'Lò Bánh Mì',
        categoryTitle: 'CO.OP BAKERY RA LÒ MỖI 15 PHÚT',
        icon: '🥖',
        tagline: 'Ổ bánh mì baguette nóng giòn rụm ra lò liên tục, thơm nức siêu thị',
        bannerColor: '#d97706',
        accentColor: '#fbbf24',
        radarX: 50,
        radarY: 20,
        shelfDef: SUPERMARKET_SHELVES[2],
        featuredBadges: ['Nóng Hổi Ra Lò', 'Giòn Rụm 15p', 'Bột Mì Thượng Hạng'],
        bgImage: '/assets/supermarket/bg_counter_bakery.jpg',
      },
      {
        id: 'counter_checkout',
        name: 'Quầy Thu Ngân Số 1 (Thanh Toán)',
        shortName: 'Quầy Thu Ngân',
        categoryTitle: 'QUẦY THU NGÂN & SCAN BARCODE',
        icon: '💳',
        tagline: 'Băng chuyền tính tiền, máy quét mã vạch laser, in hóa đơn nhanh gọn',
        bannerColor: '#059669',
        accentColor: '#34d399',
        radarX: 50,
        radarY: 85,
        shelfDef: SUPERMARKET_SHELVES[0],
        featuredBadges: ['Thu Ngân Thúy Hằng', 'Quét Mã Laser', 'Tích Điểm Co.op'],
        bgImage: '/assets/supermarket/bg_counter_checkout.jpg',
      },
    ],
    []
  );

  // Current counter index (0 to 5)
  const [currentCounterIndex, setCurrentCounterIndex] = useState(0);
  const currentCounter = counters[currentCounterIndex] || counters[0];

  // Current counter products on 3D shelves
  const currentProducts = useMemo(() => {
    return getSupermarketProductsForShelf(currentCounter.shelfDef);
  }, [currentCounter]);

  // Toggle shelf visibility
  const [isShelvesMinimized, setIsShelvesMinimized] = useState(false);
  // Clean View Mode (Hide all UI to view full 3D background without obstructions)
  const [isCleanViewMode, setIsCleanViewMode] = useState(false);

  // Supermarket Cart State - Preloaded with 3 items matching user's reference image
  const [cartItems, setCartItems] = useState<CartItem[]>(() => [
    {
      product: {
        id: 'bread',
        name: 'Bánh Mì Baguette Giòn',
        categoryName: 'STARCH',
        icon: '🥖',
        unit: 'ổ',
        unitPrice: 2300,
        originalPrice: 2500,
        tag: 'Co.op Bakery',
        description: 'Bánh mì baguette nướng mới nóng giòn thơm phức',
      },
      quantity: 1,
    },
    {
      product: {
        id: 'condensed_milk',
        name: 'Sữa Vinamilk 100% Tươi',
        categoryName: 'BEVERAGE',
        icon: '🥛',
        unit: 'hộp',
        unitPrice: 4200,
        originalPrice: 4500,
        tag: 'Vinamilk',
        description: 'Sữa tươi sạch nguyên chất 100% tiệt trùng',
      },
      quantity: 1,
    },
    {
      product: {
        id: 'potatoes',
        name: 'Khoai Tây Snack Lay\'s',
        categoryName: 'SNACK',
        icon: '🍟',
        unit: 'gói',
        unitPrice: 3800,
        originalPrice: 4000,
        tag: 'Lay\'s Giòn',
        description: 'Khoai tây chiên giòn tan đậm đà hương vị',
      },
      quantity: 1,
    },
  ]);

  const [activeShelf, setActiveShelf] = useState<SupermarketShelfDef | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // 5D Camera & Movement Physics
  const [cameraPanX, setCameraPanX] = useState(0); // -1 (left), 0 (center), 1 (right)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [walkBobY, setWalkBobY] = useState(0);
  const [walkSwayX, setWalkSwayX] = useState(0);
  const [wheelRollAngle, setWheelRollAngle] = useState(0);
  const [radarSweepAngle, setRadarSweepAngle] = useState(0);

  const walkTimerRef = useRef(0);

  // Total cart calculation
  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const totalCartCost = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.unitPrice * item.quantity, 0),
    [cartItems]
  );

  // Move forward to next counter
  const handleMoveToNextCounter = useCallback(() => {
    sounds.playCart();
    setIsTransitioning(true);
    setCurrentCounterIndex((prev) => (prev + 1) % counters.length);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
  }, [counters.length]);

  // Move back to previous counter
  const handleMoveToPrevCounter = useCallback(() => {
    sounds.playCart();
    setIsTransitioning(true);
    setCurrentCounterIndex((prev) => (prev - 1 + counters.length) % counters.length);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
  }, [counters.length]);

  // Direct move to counter
  const handleJumpToCounter = (idx: number) => {
    if (idx === currentCounterIndex) return;
    sounds.playCart();
    setIsTransitioning(true);
    setCurrentCounterIndex(idx);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
  };

  // Cart operations
  const handleAddToCart = (product: SupermarketProduct, qty = 1) => {
    if (qty <= 0) return;
    sounds.playCart();
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const handleUpdateCartItemQty = (productId: string, delta: number) => {
    sounds.playClick();
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleClearCart = () => {
    sounds.playClick();
    setCartItems([]);
  };

  // Keyboard navigation: Arrow Keys (↑ ↓ ← →) & WASD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        e.preventDefault();
        handleMoveToNextCounter();
      } else if (key === 's' || key === 'arrowdown') {
        e.preventDefault();
        handleMoveToPrevCounter();
      } else if (key === 'a' || key === 'arrowleft') {
        e.preventDefault();
        handleMoveToPrevCounter();
      } else if (key === 'd' || key === 'arrowright') {
        e.preventDefault();
        handleMoveToNextCounter();
      } else if (key === 'e' || key === ' ') {
        e.preventDefault();
        if (currentCounter.id === 'counter_checkout') {
          handlePerformCheckout();
        } else if (currentProducts.length > 0) {
          handleAddToCart(currentProducts[0], 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMoveToNextCounter, handleMoveToPrevCounter, currentCounter, currentProducts]);

  // Continuous 5D Motion Physics (Radar sweep, subtle breathing sway)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Radar rotation
      setRadarSweepAngle((prev) => (prev + dt * 50) % 360);

      // 5D subtle cart idle breathing
      walkTimerRef.current += dt * 3.5;
      if (isTransitioning) {
        setWalkBobY(Math.sin(walkTimerRef.current * 4) * 8);
        setWalkSwayX(Math.cos(walkTimerRef.current * 2) * 6);
        setWheelRollAngle((prev) => prev + 15);
      } else {
        setWalkBobY(Math.sin(walkTimerRef.current) * 2);
        setWalkSwayX(Math.cos(walkTimerRef.current * 0.7) * 1.5);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isTransitioning]);

  // Mouse move parallax inside the 5D scene
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    setCameraPanX(relX);
  };

  // Checkout execution
  const handlePerformCheckout = () => {
    if (totalCartCost > store.money) {
      sounds.playClick();
      store.addToast('Không đủ tiền!', 'Vui lòng bỏ bớt một số mặt hàng trong giỏ.', 'error');
      return;
    }

    setIsScanning(true);
    setScanStep(0);

    let step = 0;
    const scanInterval = setInterval(() => {
      sounds.playScan();
      step++;
      setScanStep(step);

      if (step >= Math.min(4, cartItems.length + 1)) {
        clearInterval(scanInterval);
        setIsScanning(false);

        const itemsToCheckout = cartItems.map((ci) => ({
          ingredientId: ci.product.id,
          quantity: ci.quantity,
          cost: ci.product.unitPrice * ci.quantity,
        }));

        const success = store.checkoutSupermarket(itemsToCheckout);
        if (success) {
          setCheckoutSuccess(true);
          setCartItems([]);
        }
      }
    }, 380);
  };

  // Active background: manual override or current counter's designated 3D photo
  const activeBgImage = customBgOverride || currentCounter.bgImage || '/assets/supermarket/bg_counter_produce.jpg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-2 bg-black/95 backdrop-blur-md animate-fade-in select-none"
      onClick={() => store.closeModal()}
      onMouseMove={handleMouseMove}
    >
      <div
        className="relative w-full max-w-6xl h-[96vh] sm:h-[92vh] flex flex-col bg-slate-950 border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= 5D FIRST-PERSON POV SIMULATOR VIEWPORT ================= */}
        <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-900 flex items-center justify-center">
          {/* Main Photographic 3D Supermarket Scene (Matching Reference Image) */}
          <div
            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-500 ease-out ${
              isTransitioning ? 'scale-105 filter blur-[1px]' : 'scale-100'
            }`}
            style={{
              backgroundImage: `url('${activeBgImage}')`,
              transform: `translate(${cameraPanX * -25 + walkSwayX}px, ${walkBobY}px) scale(${
                isTransitioning ? 1.06 : 1.02
              })`,
              filter: 'brightness(1.02) contrast(1.04)',
            }}
          />

          {/* 5D Atmospheric Lighting & Floor Reflections Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-black/20" />

          {/* ================= TOP HUD: COIN 12.500 & LEVEL 5 (EXACT MATCH) ================= */}
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
            {/* 1. TOP-LEFT GOLD COIN PILL (Exact Reference Style: Gold round coin with 12.500) */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/60 shadow-2xl">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 flex items-center justify-center shadow-md shrink-0">
                <span className="text-xs font-black text-slate-950">₫</span>
              </div>
              <span className="text-sm font-black text-amber-300 tracking-wide">
                {formatVND(store.money).replace('đ', '')}
              </span>
            </div>

            {/* 2. TOP-CENTER 5D AISLE STEPPER BAR (Di Chuyển Từng Quầy Hàng) */}
            <div className="flex items-center gap-1 sm:gap-2 px-2 py-1 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-700 shadow-2xl">
              <button
                onClick={handleMoveToPrevCounter}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition"
                title="Quầy trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {counters.map((c, idx) => {
                  const isActive = idx === currentCounterIndex;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleJumpToCounter(idx)}
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-950/60 scale-105'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span className="hidden md:inline">{c.shortName}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleMoveToNextCounter}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition"
                title="Quầy tiếp theo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3. TOP-RIGHT LEVEL STAR HUD, CLEAN VIEW, BACKGROUND CHANGER & CLOSE BUTTON */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsCleanViewMode((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition shadow-lg backdrop-blur-md active:scale-95 cursor-pointer ${
                  isCleanViewMode
                    ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400 font-black'
                    : 'bg-slate-950/85 hover:bg-slate-800 border-amber-500/50 text-amber-300'
                }`}
                title="Xem trọn vẹn hình nền 3D (Ẩn/Hiện giao diện)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isCleanViewMode ? 'Hiện Giao Diện' : 'Xem Nền 3D'}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsBgSelectorOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition shadow-lg backdrop-blur-md active:scale-95 cursor-pointer"
                title="Đổi hình nền không gian siêu thị 3D"
              >
                <span>🖼️</span>
                <span className="hidden sm:inline">Đổi Background</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/60 shadow-2xl">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-200 flex items-center justify-center shadow-md shrink-0">
                  <span className="text-xs text-slate-950">⭐</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white">Lv. {store.level}</span>
                  <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, store.xp % 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => store.closeModal()}
                className="p-1.5 rounded-full bg-slate-950/85 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
                title="Rời siêu thị"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ================= CLEAN VIEW MODE TOGGLE BANNER ================= */}
          {isCleanViewMode && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-fadeIn select-none">
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsCleanViewMode(false);
                }}
                className="px-4 py-2 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-amber-500 text-amber-300 text-xs font-black shadow-2xl flex items-center gap-2 backdrop-blur-md transition transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Bấm để mở lại quầy kệ và bảng điều khiển"
              >
                <span>👁️</span>
                <span>Đang Xem Toàn Cảnh Background 3D • Click để Hiện Lại Giao Diện</span>
                <X className="w-4 h-4 text-slate-400 hover:text-white ml-1" />
              </button>
            </div>
          )}

          {/* ================= SCREEN SIDE EDGE CLICK-TO-MOVE BUTTONS ================= */}
          <button
            onClick={handleMoveToPrevCounter}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-20 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-2xl backdrop-blur-sm group cursor-pointer"
            title="Click chuột để sang quầy trước (Phím [←] hoặc [A])"
          >
            <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-amber-300 transition-colors" />
          </button>

          <button
            onClick={handleMoveToNextCounter}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-20 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-2xl backdrop-blur-sm group cursor-pointer"
            title="Click chuột để sang quầy tiếp theo (Phím [→] hoặc [D])"
          >
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-amber-300 transition-colors" />
          </button>

          {/* ================= MAIN INTERACTIVE SUPERMARKET OVERLAYS (HIDDEN IN CLEAN VIEW) ================= */}
          {!isCleanViewMode && (
            <>
              {/* CURRENT COUNTER 3D BANNER & AISLE SIGNBOARD */}
              <div className="absolute top-16 sm:top-[70px] left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-1 animate-fadeIn">
                <div
                  className="px-4 py-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border shadow-2xl flex items-center gap-2.5 transition-all"
                  style={{ borderColor: currentCounter.accentColor }}
                >
                  <span className="text-xl animate-bounce">{currentCounter.icon}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                        {currentCounter.name}
                      </h3>
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase"
                        style={{
                          backgroundColor: `${currentCounter.bannerColor}30`,
                          color: currentCounter.accentColor,
                        }}
                      >
                        Vị Trí {currentCounterIndex + 1}/{counters.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 line-clamp-1">{currentCounter.tagline}</p>
                  </div>
                </div>
              </div>

              {/* 3D INTERACTIVE SUPERMARKET SHELVES / CHECKOUT CONVEYOR */}
              {!isShelvesMinimized && (
                <div className="absolute top-[20%] sm:top-[21%] left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20 pointer-events-auto transition-all duration-300">
                  {currentCounter.id !== 'counter_checkout' ? (
                    /* MULTI-TIER SUPERMARKET SHELVING RACK (KỆ SIÊU THỊ ĐA TẦNG TRỰC TIẾP) */
                    <div
                      className="relative rounded-2xl bg-slate-950/85 backdrop-blur-md border shadow-2xl p-2.5 sm:p-3.5 overflow-hidden"
                      style={{ borderColor: `${currentCounter.accentColor}80` }}
                    >
                      {/* Top Shelf Lighting / Accent Glow Strip */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${currentCounter.accentColor}, transparent)`,
                        }}
                      />

                      {/* Rack Header */}
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{currentCounter.icon}</span>
                          <span className="text-xs font-black text-white uppercase tracking-wider">
                            {currentCounter.categoryTitle}
                          </span>
                          <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                            ⚡ Click vào món hàng để lấy vào giỏ
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <span>{currentProducts.length} mặt hàng trên kệ</span>
                        </div>
                      </div>

                      {/* 3D Shelves Goods Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 max-h-[35vh] sm:max-h-[36vh] overflow-y-auto pr-1 custom-scrollbar">
                        {currentProducts.map((prod) => {
                          const inCartItem = cartItems.find((ci) => ci.product.id === prod.id);
                          const inCartQty = inCartItem?.quantity || 0;

                          return (
                            <div
                              key={prod.id}
                              onClick={() => handleAddToCart(prod, 1)}
                              className="group relative flex flex-col justify-between p-2 sm:p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/95 border border-slate-700/80 hover:border-amber-400/90 shadow-lg cursor-pointer transform transition-all duration-200 hover:-translate-y-1 hover:shadow-amber-500/20"
                            >
                              {/* Top Badges */}
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {prod.tag || 'Ưu Đãi'}
                                </span>
                                {inCartQty > 0 && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 flex items-center gap-0.5 shadow">
                                    <span>🛒</span>
                                    <span>x{inCartQty}</span>
                                  </span>
                                )}
                              </div>

                              {/* Product 3D Icon & Hover Floating */}
                              <div className="flex flex-col items-center justify-center my-1">
                                <span className="text-3xl sm:text-4xl group-hover:scale-125 transition-transform duration-200 drop-shadow-md">
                                  {prod.icon}
                                </span>
                                <span className="text-xs font-bold text-white text-center mt-1 line-clamp-1 group-hover:text-amber-300 transition-colors">
                                  {prod.name}
                                </span>
                              </div>

                              {/* Shelf Lip Price Tag */}
                              <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-amber-300">
                                    {formatVND(prod.unitPrice)}
                                  </span>
                                  {prod.originalPrice > prod.unitPrice && (
                                    <span className="text-[9px] text-slate-500 line-through">
                                      {formatVND(prod.originalPrice)}
                                    </span>
                                  )}
                                </div>

                                <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(prod, 1);
                              }}
                              className="px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-[10px] flex items-center gap-0.5 shadow active:scale-95 transition"
                              title="Lấy vào giỏ"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Lấy</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Metallic Shelf Lip Bar */}
                  <div className="mt-2 h-1.5 rounded-full bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 shadow-inner" />
                </div>
              ) : (
                /* 3D CASHIER CHECKOUT CONVEYOR (BĂNG CHUYỀN THU NGÂN 3D) */
                <div className="relative rounded-2xl bg-slate-950/90 backdrop-blur-md border border-emerald-500/60 shadow-2xl p-4 sm:p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">👩‍💼</span>
                      <div>
                        <h4 className="text-sm font-black text-emerald-300 uppercase">
                          Quầy Thu Ngân Số 1 • Băng Chuyền Tính Tiền
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Băng chuyền tính tiền & máy quét mã vạch Barcode Laser
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold animate-pulse">
                      🔴 Laser Sẵn Sàng
                    </span>
                  </div>

                  {/* 3D Conveyor Belt with Moving Stripes */}
                  <div className="relative h-28 rounded-xl bg-slate-900 border-2 border-slate-700 overflow-hidden flex items-center px-4 mb-3">
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, #000, #000 12px, #fff 12px, #fff 24px)',
                      }}
                    />

                    {cartItems.length > 0 ? (
                      <div className="relative z-10 flex items-center gap-3 overflow-x-auto w-full py-1 custom-scrollbar">
                        {cartItems.map((ci) => (
                          <div
                            key={ci.product.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-700 shrink-0 shadow-md animate-pulse"
                          >
                            <span className="text-2xl">{ci.product.icon}</span>
                            <div>
                              <span className="text-xs font-bold text-white block">
                                {ci.product.name}
                              </span>
                              <span className="text-[10px] text-amber-300 font-bold">
                                {formatVND(ci.product.unitPrice)} x{ci.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative z-10 w-full text-center text-slate-500 text-xs italic">
                        Băng chuyền đang trống. Hãy di chuyển qua các quầy bằng nút mũi tên hoặc click chuột để lấy hàng!
                      </div>
                    )}
                  </div>

                  {/* Checkout Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-slate-400">Tổng thanh toán: </span>
                      <span className="text-amber-300 font-black text-sm">
                        {formatVND(totalCartCost)}
                      </span>
                      <span className="text-slate-500 ml-2">({totalCartCount} món)</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handlePerformCheckout}
                        disabled={isScanning || store.money < totalCartCost || cartItems.length === 0}
                        className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase shadow-xl transition flex items-center justify-center gap-2 active:scale-95 ${
                          store.money >= totalCartCost && cartItems.length > 0 && !isScanning
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-slate-950 hover:brightness-110 shadow-emerald-950/50 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 fill-current shrink-0" />
                        <span>
                          {isScanning
                            ? 'Đang Quét Laser Barcode...'
                            : `Thanh Toán & Nhận Hàng (${formatVND(totalCartCost)})`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ON-SCREEN GAME D-PAD ARROW CONTROLS (CLICK CHUỘT DI CHUYỂN) */}
          <div className="absolute bottom-4 left-36 sm:left-40 z-30 pointer-events-auto flex flex-col items-center select-none bg-slate-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
            <button
              onClick={handleMoveToNextCounter}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 flex items-center justify-center font-bold active:scale-90 transition shadow cursor-pointer"
              title="Tiến tới trước (Phím [↑] hoặc [W])"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 my-0.5">
              <button
                onClick={handleMoveToPrevCounter}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 flex items-center justify-center font-bold active:scale-90 transition shadow cursor-pointer"
                title="Sang trái (Phím [←] hoặc [A])"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-black text-amber-400">
                POV
              </div>

              <button
                onClick={handleMoveToNextCounter}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 flex items-center justify-center font-bold active:scale-90 transition shadow cursor-pointer"
                title="Sang phải (Phím [→] hoặc [D])"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleMoveToPrevCounter}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 flex items-center justify-center font-bold active:scale-90 transition shadow cursor-pointer"
              title="Lùi lại (Phím [↓] hoặc [S])"
            >
              <ArrowDown className="w-4 h-4" />
            </button>

            <span className="text-[8px] font-bold text-slate-400 mt-0.5">MŨI TÊN</span>
          </div>

          {/* ================= BOTTOM-LEFT: CIRCULAR RADAR MINIMAP (EXACT MATCH) ================= */}
          <div className="absolute bottom-4 left-4 z-30 pointer-events-auto">
            <div
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-950/90 backdrop-blur-md border-2 border-slate-600/90 shadow-2xl flex items-center justify-center overflow-hidden cursor-pointer"
              title="Radar Siêu Thị (Bấm để nhảy tới quầy)"
            >
              {/* Radar Grid Lines */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-full h-[1px] bg-slate-400" />
                <div className="h-full w-[1px] bg-slate-400 absolute" />
                <div className="w-16 h-16 rounded-full border border-slate-400 absolute" />
              </div>

              {/* Radar Rotating Sweep Beam */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `conic-gradient(from ${radarSweepAngle}deg, transparent 0deg, rgba(56, 189, 248, 0.3) 45deg, transparent 50deg)`,
                }}
              />

              {/* 6 Interactive Counter Blips on Radar */}
              {counters.map((c, idx) => {
                const isCurrent = idx === currentCounterIndex;
                return (
                  <div
                    key={c.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJumpToCounter(idx);
                    }}
                    className={`absolute rounded-full transition-transform cursor-pointer ${
                      isCurrent
                        ? 'w-3.5 h-3.5 bg-cyan-400 border border-white shadow-lg shadow-cyan-400 animate-ping'
                        : 'w-2 h-2 bg-slate-400 hover:scale-150'
                    }`}
                    style={{
                      top: `${c.radarY}%`,
                      left: `${c.radarX}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    title={c.name}
                  />
                );
              })}

              {/* Cyan Direction Arrow of Player (Center) */}
              <div
                className="relative z-10 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-cyan-400 drop-shadow-md transition-transform duration-300"
                style={{
                  transform: `rotate(${currentCounterIndex * 60 + cameraPanX * 25}deg)`,
                }}
              />

              {/* Radar Label */}
              <span className="absolute bottom-1.5 text-[8px] font-black text-cyan-300 tracking-wider">
                RADAR 5D
              </span>
            </div>
          </div>

          {/* ================= BOTTOM-RIGHT: FLOATING BLUE CART BUTTON (EXACT MATCH) ================= */}
          <div className="absolute bottom-4 right-4 z-30 pointer-events-auto">
            <button
              onClick={() => {
                sounds.playClick();
                setIsCartDrawerOpen(true);
              }}
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 hover:from-blue-600 hover:to-sky-400 text-white shadow-2xl shadow-blue-950/70 border-2 border-white/90 flex items-center justify-center active:scale-95 transition cursor-pointer"
              title="Xem Giỏ Hàng"
            >
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />

              {/* Red Item Counter Badge */}
              {totalCartCount > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-md animate-pulse">
                  {totalCartCount}
                </div>
              )}
            </button>
          </div>

          {/* ================= 5D WHEEL MOTION CONTROLS ================= */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-auto select-none">
            <button
              onClick={handleMoveToPrevCounter}
              className="px-3.5 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs shadow-2xl active:scale-95 transition flex items-center gap-1 cursor-pointer"
              title="Quầy trước (Phím [←] hoặc [A])"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quầy Trước</span>
            </button>

            {/* Nút Ẩn Kệ / Hiện Kệ (Nằm xuống dưới theo yêu cầu) */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsShelvesMinimized((prev) => !prev);
              }}
              className={`px-3.5 py-2 rounded-xl border font-black text-xs uppercase shadow-2xl active:scale-95 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                isShelvesMinimized
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-950/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/60 shadow-slate-950/50'
              }`}
              title={isShelvesMinimized ? 'Bấm để hiện lại quầy kệ hàng' : 'Bấm để thu gọn quầy kệ'}
            >
              <Eye className="w-4 h-4" />
              <span>{isShelvesMinimized ? 'Hiện Kệ' : 'Ẩn Kệ'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                if (currentCounter.id === 'counter_checkout') {
                  setIsCheckoutOpen(true);
                } else {
                  setActiveShelf(currentCounter.shelfDef);
                }
              }}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase shadow-2xl active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-emerald-950/40"
            >
              <span>{currentCounter.id === 'counter_checkout' ? '💳' : '🛒'}</span>
              <span>
                {currentCounter.id === 'counter_checkout' ? 'Tính Tiền' : 'Lấy Hàng'}
              </span>
            </button>

            <button
              onClick={handleMoveToNextCounter}
              className="px-3.5 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs shadow-2xl active:scale-95 transition flex items-center gap-1 cursor-pointer"
              title="Quầy tiếp (Phím [→] hoặc [D])"
            >
              <span className="hidden sm:inline">Quầy Tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
            </>
          )}
        </div>

        {/* ================= SHELF GOODS BROWSER DRAWER ================= */}
        {activeShelf && (
          <div
            className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fade-in"
            onClick={() => setActiveShelf(null)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div
                className="p-3.5 sm:p-4 text-white flex items-center justify-between border-b border-slate-800"
                style={{ backgroundColor: activeShelf.bannerColor }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl">{activeShelf.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-black truncate">
                      {activeShelf.name}
                    </h3>
                    <p className="text-[10px] text-white/80 truncate">
                      {activeShelf.shelfTagline}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveShelf(null)}
                  className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shelf Product Items Grid */}
              <div className="p-3 sm:p-4 overflow-y-auto max-h-[60vh] space-y-2 custom-scrollbar">
                {getSupermarketProductsForShelf(activeShelf).map((product) => {
                  const inCartItem = cartItems.find((c) => c.product.id === product.id);
                  const inCartQty = inCartItem?.quantity || 0;
                  const currentStock = store.inventory[product.id] || 0;

                  return (
                    <div
                      key={product.id}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                          {product.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                              {product.name}
                            </h4>
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              -6%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-black text-amber-300 text-xs">
                              {formatVND(product.unitPrice)}
                            </span>
                            <span className="line-through text-slate-500 text-[9px]">
                              {formatVND(product.originalPrice)}
                            </span>
                            <span>• Trong kho: {currentStock}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pick to Cart Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {inCartQty > 0 && (
                          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateCartItemQty(product.id, -1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-black text-amber-400">
                              {inCartQty}
                            </span>
                            <button
                              onClick={() => handleUpdateCartItemQty(product.id, 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleAddToCart(product, 1)}
                          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow active:scale-95 transition flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 fill-current" />
                          <span>+1 Giỏ</span>
                        </button>

                        <button
                          onClick={() => handleAddToCart(product, 5)}
                          className="hidden sm:inline-block px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
                          title="Thêm 5 món"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer with Quick Checkout Jump */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400 font-medium">
                  Đã chọn: <strong className="text-amber-400 font-black">{totalCartCount} món</strong>{' '}
                  ({formatVND(totalCartCost)})
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveShelf(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Tiếp Tục Đẩy Xe
                  </button>
                  <button
                    onClick={() => {
                      setActiveShelf(null);
                      setIsCheckoutOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md shadow-emerald-950/50"
                  >
                    <span>Ra Quầy Thu Ngân</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SHOPPING CART REVIEW DRAWER ================= */}
        {isCartDrawerOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in"
            onClick={() => setIsCartDrawerOpen(false)}
          >
            <div
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase">
                    Xe Giỏ Hàng POV ({totalCartCount} món)
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 sm:p-4 max-h-[55vh] overflow-y-auto space-y-1.5 custom-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <span className="text-3xl block mb-2">🛒</span>
                    Xe giỏ hàng đang trống. Hãy nhìn vào kệ hàng để nhặt đồ vào giỏ!
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{item.product.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-amber-400 font-bold">
                            {formatVND(item.product.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateCartItemQty(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateCartItemQty(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">
                    Tổng tiền giỏ hàng
                  </span>
                  <span className="text-sm font-black text-amber-300">
                    {formatVND(totalCartCost)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold"
                    >
                      Xóa giỏ
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    disabled={cartItems.length === 0}
                    className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition ${
                      cartItems.length > 0
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Ra Quầy Tính Tiền
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= FIRST PERSON CHECKOUT / QUẦY THU NGÂN MODAL ================= */}
        {isCheckoutOpen && (
          <div
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in"
            onClick={() => setIsCheckoutOpen(false)}
          >
            <div
              className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Checkout Header */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                    💳
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-300 uppercase">
                      Quầy Thu Ngân Siêu Thị Số 1 (POV)
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      Thu ngân: <strong className="text-white">Thúy Hằng Co.op</strong> • Quét mã laser tính tiền
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {checkoutSuccess ? (
                /* Success Receipt Screen */
                <div className="p-6 text-center flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-3 animate-bounce">
                    🎉
                  </div>
                  <h3 className="text-base font-black text-emerald-300 mb-1">
                    THANH TOÁN THÀNH CÔNG!
                  </h3>
                  <p className="text-xs text-slate-300 mb-3 max-w-sm">
                    Tất cả các sản phẩm đã được đóng gói và chuyển vào kho của bạn. Chúc quán bán đắt khách!
                  </p>

                  <div className="flex gap-3 mb-4">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 font-bold block">Tặng thưởng</span>
                      <span className="text-xs font-black text-amber-400">+25 XP</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[9px] text-slate-400 font-bold block">Uy tín phố</span>
                      <span className="text-xs font-black text-emerald-400">+0.05⭐</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutSuccess(false);
                      setIsCheckoutOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase shadow-lg shadow-emerald-950/40"
                  >
                    Xong • Tiếp Tục Mua Sắm
                  </button>
                </div>
              ) : (
                /* Itemized Checkout Breakdown */
                <div className="p-3 sm:p-4 flex flex-col gap-3">
                  {cartItems.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      <ShoppingCart className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      Giỏ hàng của bạn đang trống! Hãy quay lại các quầy để nhặt hàng trước.
                    </div>
                  ) : (
                    <>
                      {/* Scanning animation bar */}
                      {isScanning && (
                        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between animate-pulse">
                          <div className="flex items-center gap-2">
                            <Scan className="w-4 h-4 text-emerald-400 animate-spin" />
                            <span className="text-xs font-bold text-emerald-300">
                              Đang quét mã vạch sản phẩm... BÍP!
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-amber-300">
                            {scanStep}/{cartItems.length}
                          </span>
                        </div>
                      )}

                      {/* Cashier Welcome Dialogue */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                        <span className="text-xl">👩‍💼</span>
                        <p className="text-[11px] text-slate-300 italic">
                          &ldquo;Dạ em chào anh/chị Bé Hàng Rong! Em tính tiền {totalCartCount} món trên băng chuyền cho mình nhé!&rdquo;
                        </p>
                      </div>

                      {/* Items Summary Table */}
                      <div className="max-h-44 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 p-2 space-y-1 custom-scrollbar">
                        {cartItems.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-none"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span>{item.product.icon}</span>
                              <span className="text-slate-200 truncate">{item.product.name}</span>
                              <span className="text-[10px] text-slate-500">x{item.quantity}</span>
                            </div>
                            <span className="font-bold text-amber-300 shrink-0">
                              {formatVND(item.product.unitPrice * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bill Calculation */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Tổng giá trị hàng:</span>
                          <span className="text-white font-bold">{formatVND(totalCartCost)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400 text-[11px]">
                          <span>Ưu đãi thành viên Co.opmart:</span>
                          <span className="font-bold">Đã trừ trực tiếp</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Số dư ví hiện có:</span>
                          <span className="font-bold text-amber-400">{formatVND(store.money)}</span>
                        </div>
                        <div className="border-t border-slate-800 pt-1 flex justify-between items-center text-sm font-black">
                          <span className="text-white uppercase">Tổng thanh toán:</span>
                          <span className="text-amber-300 text-base">{formatVND(totalCartCost)}</span>
                        </div>
                      </div>

                      {/* Checkout Confirm Button */}
                      <button
                        onClick={handlePerformCheckout}
                        disabled={isScanning || store.money < totalCartCost || cartItems.length === 0}
                        className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wide transition shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
                          store.money >= totalCartCost && cartItems.length > 0 && !isScanning
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 text-slate-950 hover:brightness-110 shadow-emerald-950/50'
                            : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 fill-current shrink-0" />
                        <span>
                          {store.money < totalCartCost
                            ? `THIẾU ${formatVND(totalCartCost - store.money)} ĐỂ THANH TOÁN`
                            : isScanning
                            ? 'ĐANG QUÉT MÃ VẠCH...'
                            : `THANH TOÁN & NHẬN HÀNG (${formatVND(totalCartCost)})`}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {/* ================= BACKGROUND CHANGER MODAL ================= */}
        {isBgSelectorOpen && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
            onClick={() => setIsBgSelectorOpen(false)}
          >
            <div
              className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🖼️</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-amber-300 uppercase tracking-wide">
                      Tùy Chọn Hình Nền Siêu Thị 3D
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Chọn bối cảnh quầy hàng yêu thích hoặc để hệ thống tự động đổi khi di chuyển
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBgSelectorOpen(false)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar">
                {/* Auto Mode Option */}
                <div
                  onClick={() => {
                    sounds.playClick();
                    setCustomBgOverride(null);
                    store.addToast('Chế độ Tự Động', 'Hình nền 3D sẽ tự động đổi tương ứng với mỗi quầy hàng bạn ghé thăm!', 'info');
                    setIsBgSelectorOpen(false);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    customBgOverride === null
                      ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shrink-0">
                      ✨
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          Tự Động Đổi Theo Từng Quầy (Khuyên dùng)
                        </span>
                        {customBgOverride === null && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                            Đang dùng
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Khi bạn chuyển sang quầy Trái Cây, Snack, Sữa, Thịt, Lò Bánh hay Thu Ngân, nền 3D đổi theo đúng bối cảnh đó.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>

                {/* 6 Counter 3D Backgrounds Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <span>🏬</span>
                    <span>Chọn Cố Định 1 Quầy Yêu Thích ({counters.length} Bối Cảnh)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {counters.map((c) => {
                      const isSelected = customBgOverride === c.bgImage;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            sounds.playClick();
                            setCustomBgOverride(c.bgImage);
                            store.addToast('Đã đổi background', `Đã chọn bối cảnh: ${c.name}`, 'info');
                            setIsBgSelectorOpen(false);
                          }}
                          className={`group relative rounded-xl overflow-hidden border cursor-pointer transition transform hover:-translate-y-0.5 shadow-md ${
                            isSelected
                              ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20'
                              : 'border-slate-800 hover:border-slate-600 bg-slate-950'
                          }`}
                        >
                          <div className="h-28 w-full relative overflow-hidden bg-slate-900">
                            <img
                              src={c.bgImage}
                              alt={c.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                              <span>{c.icon}</span>
                              <span className="truncate max-w-[120px]">{c.shortName}</span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="p-2.5 bg-slate-950">
                            <p className="text-xs font-bold text-slate-200 line-clamp-1">{c.name}</p>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{c.tagline}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom URL Option */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔗</span>
                    <span className="text-xs font-bold text-slate-200">
                      Hoặc dán URL hình ảnh siêu thị riêng của bạn:
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://example.com/anh-sieu-thi-3d.jpg"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => {
                        if (customUrlInput.trim()) {
                          sounds.playClick();
                          setCustomBgOverride(customUrlInput.trim());
                          store.addToast('Đã đổi background', 'Đã áp dụng hình ảnh từ URL tùy chọn!', 'info');
                          setIsBgSelectorOpen(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0"
                    >
                      Áp Dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
