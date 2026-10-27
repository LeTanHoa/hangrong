import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { formatVND, getTimeOfDayLabel, getWeatherLabel, calculateLevelFromXP } from '../utils/formatters';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Star,
  FastForward,
  Bell,
  Bot,
} from 'lucide-react';
import { sounds } from '../audio/soundSystem';

export const TopHUD: React.FC = () => {
  const store = useGameStore();
  const timeInfo = getTimeOfDayLabel(store.timeOfDay);
  const weatherInfo = getWeatherLabel(store.weather);
  const { currentXP, xpForNext, progress } = calculateLevelFromXP(store.xp);

  // Check if any quest has uncollected reward
  const hasClaimableQuest = store.quests.some((q) => q.completed && !q.claimed);

  const toggleSound = () => {
    const nextState = !store.settings.soundEnabled;
    store.updateSettings({ soundEnabled: nextState, musicEnabled: nextState });
    sounds.playClick();
  };

  const cycleSpeed = () => {
    const current = store.settings.gameSpeed;
    const next = current === 1 ? 1.5 : current === 1.5 ? 2 : 1;
    store.updateSettings({ gameSpeed: next });
    sounds.playClick();
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

        {/* Level badge for mobile & full bar for desktop */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/90 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-slate-700/60 shadow">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-[10px] sm:text-xs text-white shadow-inner">
            {store.level}
          </div>
          <div className="hidden sm:flex flex-col w-16 md:w-20">
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
          <span className="font-bold text-white text-[11px] sm:text-xs">{store.reputationRating.toFixed(1)}</span>
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

        <div className="hidden sm:flex items-center gap-1 text-sky-300 border-l border-slate-700 pl-1.5" title={weatherInfo.effect}>
          <span>{weatherInfo.icon}</span>
          <span className="hidden lg:inline text-xs">{weatherInfo.label}</span>
        </div>

        {/* Day timer progress bar */}
        <div className="w-8 sm:w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-0.5">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-200"
            style={{ width: `${store.dayProgress}%` }}
          />
        </div>
      </div>

      {/* RIGHT: Controls & Phone launcher */}
      <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0">
        {/* Auto mode button */}
        <button
          onClick={store.toggleAutoMode}
          aria-pressed={store.autoMode}
          className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border font-extrabold text-xs shadow transition active:scale-95 ${
            store.autoMode
              ? 'bg-emerald-500 text-slate-950 border-emerald-200 shadow-emerald-950/40'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
          title={store.autoMode ? 'Tắt tự nấu và giao món' : 'Bật tự nấu và giao món'}
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{store.autoMode ? 'Tự động' : 'Thủ công'}</span>
        </button>

        {/* Call Customers Bell button */}
        <button
          onClick={() => {
            store.spawnCustomerOrder();
            sounds.playBell();
          }}
          className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-extrabold p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs shadow active:scale-95 transition"
          title="Rung chuông mời khách"
        >
          <Bell className="w-3.5 h-3.5 animate-bounce" />
          <span className="hidden md:inline">Mời Khách</span>
        </button>

        {/* Speed button */}
        <button
          onClick={cycleSpeed}
          className="flex items-center gap-0.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border border-slate-700 text-xs transition active:scale-95 shadow"
          title="Tốc độ game"
        >
          <FastForward className="w-3 h-3 text-amber-400" />
          <span className="font-bold text-[10px] sm:text-[11px]">{store.settings.gameSpeed}x</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-full border border-slate-700 transition active:scale-95 shadow"
          title="Bật/Tắt âm thanh"
        >
          {store.settings.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          )}
        </button>

        {/* Smartphone Modal Button */}
        <button
          onClick={() => store.openModal('SMARTPHONE')}
          className="relative flex items-center gap-1 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-bold shadow-lg shadow-orange-950/50 border border-orange-300/40 active:scale-95 transition"
          title="Mở điện thoại thông minh"
        >
          <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-xs sm:text-sm">Điện Thoại</span>
          {hasClaimableQuest && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>
      </div>
    </header>
  );
};

