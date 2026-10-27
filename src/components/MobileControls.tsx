import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { ChefHat, ShoppingCart, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Utensils } from 'lucide-react';
import { sounds } from '../audio/soundSystem';

export const MobileControls: React.FC = () => {
  const store = useGameStore();

  // Hide virtual touch controls when any modal is active
  if (store.activeModal) return null;

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch (_) {}
    }
  };

  const handleDPadPress = (key: string) => {
    triggerHaptic();
    sounds.playClick();
    window.dispatchEvent(new KeyboardEvent('keydown', { key, code: key }));
  };

  const handleDPadRelease = (key: string) => {
    window.dispatchEvent(new KeyboardEvent('keyup', { key, code: key }));
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex justify-between items-end p-2 sm:p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
      {/* LEFT: Sleek Virtual D-Pad for Mobile */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 bg-slate-900/75 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/60 shadow-2xl transition sm:hidden touch-none select-none">
        <button
          onTouchStart={(e) => { e.preventDefault(); handleDPadPress('ArrowUp'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleDPadRelease('ArrowUp'); }}
          onMouseDown={() => handleDPadPress('ArrowUp')}
          onMouseUp={() => handleDPadRelease('ArrowUp')}
          className="w-10 h-10 bg-slate-800/90 active:bg-orange-600 rounded-xl flex items-center justify-center text-white border border-slate-600/70 shadow active:scale-95 transition"
          aria-label="Đi lên"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        <div className="flex gap-1.5">
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPadPress('ArrowLeft'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDPadRelease('ArrowLeft'); }}
            onMouseDown={() => handleDPadPress('ArrowLeft')}
            onMouseUp={() => handleDPadRelease('ArrowLeft')}
            className="w-10 h-10 bg-slate-800/90 active:bg-orange-600 rounded-xl flex items-center justify-center text-white border border-slate-600/70 shadow active:scale-95 transition"
            aria-label="Sang trái"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPadPress('ArrowDown'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDPadRelease('ArrowDown'); }}
            onMouseDown={() => handleDPadPress('ArrowDown')}
            onMouseUp={() => handleDPadRelease('ArrowDown')}
            className="w-10 h-10 bg-slate-800/90 active:bg-orange-600 rounded-xl flex items-center justify-center text-white border border-slate-600/70 shadow active:scale-95 transition"
            aria-label="Đi xuống"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPadPress('ArrowRight'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDPadRelease('ArrowRight'); }}
            onMouseDown={() => handleDPadPress('ArrowRight')}
            onMouseUp={() => handleDPadRelease('ArrowRight')}
            className="w-10 h-10 bg-slate-800/90 active:bg-orange-600 rounded-xl flex items-center justify-center text-white border border-slate-600/70 shadow active:scale-95 transition"
            aria-label="Sang phải"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RIGHT: Quick Action Touch Buttons */}
      <div className="pointer-events-auto flex flex-col gap-2 shrink-0 sm:hidden pb-1 pr-1 touch-none">
        {/* Cooking action */}
        <button
          onClick={() => {
            triggerHaptic();
            store.openCookingStation();
          }}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-950/60 border border-orange-300/40 active:scale-90 transition"
          title="Nấu ăn"
          aria-label="Nấu ăn"
        >
          <ChefHat className="w-5 h-5" />
        </button>

        {/* Market action */}
        <button
          onClick={() => {
            triggerHaptic();
            store.openModal('SMARTPHONE', 'MARKET');
          }}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-300/40 active:scale-90 transition"
          title="Chợ nguyên liệu"
          aria-label="Chợ nguyên liệu"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

