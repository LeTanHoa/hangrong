import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
  formatVND,
  getTimeOfDayLabel,
  getWeatherLabel,
  calculateLevelFromXP,
} from '../utils/formatters';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Star,
  FastForward,
  Bell,
  Bot,
  Menu,
  X,
  Maximize,
  Minimize,
  ChefHat,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../audio/soundSystem';

export const TopHUD: React.FC = () => {
  const store = useGameStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const timeInfo = getTimeOfDayLabel(store.timeOfDay);
  const weatherInfo = getWeatherLabel(store.weather);
  const { progress } = calculateLevelFromXP(store.xp);

  // Check if any quest has uncollected reward
  const hasClaimableQuest = store.quests.some((q) => q.completed && !q.claimed);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleSound = () => {
    const nextState = !store.settings.soundEnabled;
    store.updateSettings({ soundEnabled: nextState, musicEnabled: nextState });
    sounds.playClick();
  };

  const cycleSpeed = (speed: number) => {
    store.updateSettings({ gameSpeed: speed });
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
      console.log('Fullscreen request error:', err);
    }
  };

  return (
    <header className="absolute top-1.5 left-1.5 right-1.5 sm:top-2 sm:left-2 sm:right-2 z-40 flex items-center justify-between gap-1 sm:gap-2 pointer-events-none select-none text-white text-xs sm:text-sm font-medium">
      {/* LEFT: Player Info & Money */}
      <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto shrink-0">
        {/* Money Pill */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600/95 to-yellow-600/95 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-yellow-300/40 shadow-lg shadow-amber-950/40 animate-glow">
          <span className="text-sm sm:text-base">💵</span>
          <div className="flex flex-col">
            <span className="hidden sm:block text-[9px] text-amber-200 uppercase font-bold tracking-wider leading-none">
              Tiền Vốn
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
              {formatVND(store.money)}
            </span>
          </div>
        </div>

        {/* Level badge */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-slate-700/60 shadow">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-[10px] sm:text-xs text-white shadow-inner">
            {store.level}
          </div>
          <div className="hidden sm:flex flex-col w-14 md:w-16">
            <div className="flex justify-between text-[9px] text-slate-300">
              <span>Cấp {store.level}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700/80 h-1 rounded-full overflow-hidden mt-0.5">
              <div
                className="bg-gradient-to-r from-indigo-400 to-purple-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/90 backdrop-blur-md px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border border-slate-700/60 shadow text-amber-400">
          <Star className="w-3 h-3 fill-amber-400" />
          <span className="font-bold text-white text-[11px] sm:text-xs">
            {store.reputationRating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* CENTER: Day, Time & Weather */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-700/70 shadow-lg pointer-events-auto shrink-0">
        <div className="flex items-center gap-1 text-orange-400 font-bold border-r border-slate-700 pr-1.5 sm:pr-2 text-[11px] sm:text-xs">
          <span>📅</span>
          <span>N.{store.day}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-200 px-0.5" title={timeInfo.desc}>
          <span className="text-sm">{timeInfo.icon}</span>
          <span className="hidden md:inline text-xs">{timeInfo.label.split(' ')[0]}</span>
        </div>

        <div
          className="hidden sm:flex items-center gap-1 text-sky-300 border-l border-slate-700 pl-1.5"
          title={weatherInfo.effect}
        >
          <span>{weatherInfo.icon}</span>
          <span className="hidden lg:inline text-xs">{weatherInfo.label}</span>
        </div>

        {/* Day timer progress bar */}
        <div className="w-7 sm:w-10 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-0.5">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-200"
            style={{ width: `${store.dayProgress}%` }}
          />
        </div>
      </div>

      {/* SIDEWALK MESS WARNING ALERT PILL */}
      {store.sidewalkMesses && store.sidewalkMesses.length > 0 && (
        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={() => {
              sounds.playClick();
              const firstMess = store.sidewalkMesses[0];
              const event = new CustomEvent('nav_to_screen', { detail: { screen: firstMess.streetScreen } });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-[10px] sm:text-xs border border-amber-300/80 shadow-lg shadow-rose-950/60 animate-bounce active:scale-95 transition"
            title="Bấm để đến ngay phố có chó mèo phóng uế"
          >
            <span>💩</span>
            <span className="hidden sm:inline">Cảnh Báo:</span>
            <span>Phố {store.sidewalkMesses[0].streetScreen} có phóng uế! (Dọn +5 XP)</span>
          </button>
        </div>
      )}

      {/* RIGHT: Compact Action Group & Single Unified Menu Button */}
      <div className="relative flex items-center gap-1 pointer-events-auto shrink-0" ref={menuRef}>
        {/* Fullscreen Button for instant full immersion */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 sm:p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-700 transition active:scale-95 shadow"
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Bật toàn màn hình'}
          aria-label="Toàn màn hình"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Unified Menu Icon Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsMenuOpen((prev) => !prev);
          }}
          className={`relative flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full font-bold shadow-lg transition active:scale-95 border ${
            isMenuOpen
              ? 'bg-amber-500 text-slate-950 border-amber-300'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
          }`}
          title="Mở menu tính năng"
          aria-label="Menu trò chơi"
        >
          {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="hidden sm:inline text-xs">Menu</span>
          {hasClaimableQuest && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Dropdown Menu Popover */}
        {isMenuOpen && (
          <div className="absolute top-11 right-0 w-64 bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 flex flex-col gap-1.5 animate-fadeIn text-white z-50">
            {/* 1. Smartphone launcher */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsMenuOpen(false);
                store.openModal('SMARTPHONE');
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-orange-600/90 to-rose-600/90 hover:from-orange-500 hover:to-rose-500 text-white font-extrabold text-xs shadow transition active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-200" />
                <span>Điện Thoại & Quản Lý</span>
              </div>
              {hasClaimableQuest && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                  Thưởng!
                </span>
              )}
            </button>

            {/* 2. Cooking station */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsMenuOpen(false);
                store.openCookingStation();
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-extrabold text-xs transition active:scale-95"
            >
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Trạm Bếp Nấu Ăn</span>
            </button>

            {/* 3. Call Customers */}
            <button
              onClick={() => {
                sounds.playClick();
                store.spawnCustomerOrder();
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Mời Thêm Khách Hàng</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">+1 Khách</span>
            </button>

            {/* 4. Auto mode toggle */}
            <button
              onClick={() => {
                sounds.playClick();
                store.toggleAutoMode();
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Bot className={`w-4 h-4 ${store.autoMode ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>Tự Động Nấu & Bán</span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  store.autoMode
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {store.autoMode ? 'BẬT' : 'TẮT'}
              </span>
            </button>

            {/* 5. Speed Selector */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <FastForward className="w-4 h-4 text-amber-400" />
                <span>Tốc Độ</span>
              </div>
              <div className="flex gap-1">
                {[1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => cycleSpeed(spd)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition active:scale-95 ${
                      store.settings.gameSpeed === spd
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Sound toggle */}
            <button
              onClick={toggleSound}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition active:scale-95"
            >
              <div className="flex items-center gap-2">
                {store.settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                )}
                <span>Âm Thanh & Nhạc</span>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  store.settings.soundEnabled
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {store.settings.soundEnabled ? 'BẬT' : 'TẮT'}
              </span>
            </button>

            {/* 7. Fullscreen Toggle */}
            <button
              onClick={() => {
                toggleFullscreen();
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs transition active:scale-95"
            >
              <div className="flex items-center gap-2">
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Maximize className="w-4 h-4 text-cyan-400" />
                )}
                <span>Toàn Màn Hình</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold">
                {isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
