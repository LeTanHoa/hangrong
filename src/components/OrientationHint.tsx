import React, { useState, useEffect } from 'react';
import { Smartphone, X } from 'lucide-react';

export const OrientationHint: React.FC = () => {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortraitMobile || dismissed) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[65] w-[90%] max-w-sm pointer-events-auto animate-fadeIn">
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/95 border border-orange-500/60 shadow-xl backdrop-blur-md text-white">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-orange-400 rotate-90 animate-bounce" />
          <span className="text-xs font-bold text-orange-200">
            Mẹo: Xoay ngang máy để trải nghiệm phố phường rộng đẹp nhất!
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-400 hover:text-white rounded"
          title="Đóng mẹo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

