import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { StreetScene } from '../scenes/StreetScene';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 1600,
      height: 1040,
      render: {
        antialias: false,
        antialiasGL: false,
        roundPixels: true,
        powerPreference: 'low-power',
      },
      fps: {
        target: 30,
        limit: 30,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      input: {
        windowEvents: false,
      },
      backgroundColor: '#1e293b',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [BootScene, StreetScene],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden relative"
    />
  );
};

