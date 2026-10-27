import React, { Suspense, lazy, useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { ExecutiveSidebar } from './components/ExecutiveSidebar';
import { CookingModal } from './components/CookingModal';
import { SmartphoneModal } from './components/SmartphoneModal';
import { DayEndReportModal } from './components/DayEndReportModal';
import { ShopWorkstationModal } from './components/ShopWorkstationModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { ToastContainer } from './components/ToastContainer';
import { OrientationHint } from './components/OrientationHint';

const GameCanvas = lazy(() =>
  import('./components/GameCanvas').then((module) => ({ default: module.GameCanvas })),
);

export const App: React.FC = () => {
  const store = useGameStore();

  useEffect(() => {
    store.initGame();
  }, []);

  useEffect(() => {
    const saveProgress = () => {
      void useGameStore.getState().saveCurrentGame();
    };
    const saveWhenHidden = () => {
      if (document.visibilityState === 'hidden') saveProgress();
    };

    window.addEventListener('beforeunload', saveProgress);
    document.addEventListener('visibilitychange', saveWhenHidden);
    return () => {
      window.removeEventListener('beforeunload', saveProgress);
      document.removeEventListener('visibilitychange', saveWhenHidden);
    };
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none flex">
      {/* Executive Sidebar Dashboard on the Left */}
      <ExecutiveSidebar />

      {/* Main Street Game World - 100% Clean & Visible on the Right */}
      <div className="flex-1 h-full relative overflow-hidden flex items-center justify-center lg:ml-72">
        <Suspense fallback={<div className="absolute inset-0 bg-slate-950" />}>
          <GameCanvas />
        </Suspense>

        {/* 10-Step Beginner Tutorial Overlay */}
        <TutorialOverlay />

        {/* Dynamic Floating Toast Alerts */}
        <ToastContainer />

        {/* Mobile Landscape Orientation Helper */}
        <OrientationHint />
      </div>

      {/* Modals */}
      {store.activeModal === 'COOKING' && <CookingModal />}
      {store.activeModal === 'SHOP_WORKSTATION' && <ShopWorkstationModal />}
      {store.activeModal === 'SMARTPHONE' && <SmartphoneModal />}
      {store.activeModal === 'DAY_END' && <DayEndReportModal />}
    </main>
  );
};

export default App;
