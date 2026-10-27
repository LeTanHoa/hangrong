import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, Play, Check } from 'lucide-react';
import { sounds } from '../audio/soundSystem';

export const OrientationHint: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if device is portrait and either touch or small screen
      const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      const isPortraitScreen = window.innerHeight > window.innerWidth;
      const isMobileSize = window.innerWidth <= 1024;

      setIsPortrait(isPortraitScreen && (isTouch || isMobileSize));
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleRequestLandscape = async () => {
    sounds.playClick();
    try {
      // Request fullscreen first (required for orientation lock in modern mobile browsers)
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      // Attempt screen orientation lock
      // @ts-ignore
      if (screen.orientation && screen.orientation.lock) {
        // @ts-ignore
        await screen.orientation.lock('landscape');
      }
    } catch (err) {
      console.log('Orientation lock requested:', err);
    }
  };

  const handleDismiss = () => {
    sounds.playClick();
    setDismissed(true);
  };

  // If already in landscape, or user dismissed for this session, do not show
  if (!isPortrait || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white text-center select-none animate-fadeIn">
      {/* Animated Phone Rotation Graphic */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl animate-pulse" />
        
        {/* Phone frame that rotates from portrait to landscape */}
        <div className="relative w-16 h-28 border-4 border-orange-500 rounded-2xl flex flex-col items-center justify-between py-2 shadow-2xl shadow-orange-500/40 animate-[spin_3s_ease-in-out_infinite]">
          <div className="w-4 h-1 bg-orange-400/80 rounded-full" />
          <div className="w-8 h-8 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center text-xs">
            🥖
          </div>
          <div className="w-2 h-2 rounded-full border border-orange-400" />
        </div>

        {/* Orbiting rotation arrow */}
        <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-amber-500 to-orange-500 p-2 rounded-full shadow-lg">
          <RotateCw className="w-5 h-5 text-slate-950 animate-spin" />
        </div>
      </div>

      {/* Title & Description */}
      <h2 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide uppercase mb-2">
        Vui Lòng Xoay Ngang Màn Hình
      </h2>
      <p className="text-xs sm:text-sm text-slate-300 max-w-xs sm:max-w-md leading-relaxed mb-8">
        Trò chơi ẩm thực đường phố Sài Gòn được tối ưu hóa góc nhìn toàn cảnh <strong className="text-amber-300">Landscape (Nằm Ngang)</strong> để bạn ngắm trọn vỉa hè và buôn bán thuận tiện nhất!
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleRequestLandscape}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-xl shadow-orange-950/60 active:scale-95 transition"
        >
          <RotateCw className="w-4 h-4" />
          <span>Xoay Ngang Màn Hình</span>
        </button>

        <button
          onClick={handleDismiss}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition"
        >
          Tiếp tục chơi ở màn hình dọc
        </button>
      </div>

      {/* Tip footer */}
      <div className="mt-8 text-[11px] text-slate-500 flex items-center gap-1.5">
        <span>💡</span>
        <span>Mẹo: Hãy bật tính năng "Tự động xoay" trên điện thoại</span>
      </div>
    </div>
  );
};
