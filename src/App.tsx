import React, { Suspense, lazy, useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { TopHUD } from './components/TopHUD';
import { OrderQueueHUD } from './components/OrderQueueHUD';
import { CookingModal } from './components/CookingModal';
import { SmartphoneModal } from './components/SmartphoneModal';
import { DayEndReportModal } from './components/DayEndReportModal';
import { ShopWorkstationModal } from './components/ShopWorkstationModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { MobileControls } from './components/MobileControls';
import { ToastContainer } from './components/ToastContainer';
import { OrientationHint } from './components/OrientationHint';
import { StoreOverviewWidget } from './components/StoreOverviewWidget';

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
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 2D Phaser Canvas Simulation World */}
      <Suspense fallback={<div className="absolute inset-0 bg-slate-950" />}>
        <GameCanvas />
      </Suspense>

      {/* Top Header HUD (Money, Level, Time, Weather, V-Phone) */}
      <TopHUD />

      {/* Store & Staff Monitoring Sidebar Widget (fills empty space on the left) */}
      <StoreOverviewWidget />

      {/* Active Orders Floating Ribbon */}
      <OrderQueueHUD />

      {/* Virtual D-Pad & Controls for Mobile / Touch screens */}
      <MobileControls />

      {/* 10-Step Beginner Tutorial Overlay */}
      <TutorialOverlay />

      {/* Dynamic Floating Toast Alerts */}
      <ToastContainer />

      {/* Mobile Landscape Orientation Helper */}
      <OrientationHint />

      {/* Modals */}
      {store.activeModal === 'COOKING' && <CookingModal />}
      {store.activeModal === 'SHOP_WORKSTATION' && <ShopWorkstationModal />}
      {store.activeModal === 'SMARTPHONE' && <SmartphoneModal />}
      {store.activeModal === 'DAY_END' && <DayEndReportModal />}
    </main>
  );
};

export default App;
