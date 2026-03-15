import { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../../engine/GameEngine.ts';
import { createDefaultConfig } from '../../config/defaultConfig.ts';
import { mathProvider } from '../../challenges/mathProvider.ts';
import { czechProvider } from '../../challenges/czechProvider.ts';
import type { SavedSettings } from '../../persistence/types.ts';

export function useGameEngine(
  levelId: string,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  settings?: SavedSettings,
) {
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = createDefaultConfig(levelId, settings);
    const engine = new GameEngine(config);
    engine.registerProvider(mathProvider);
    engine.registerProvider(czechProvider);
    engineRef.current = engine;

    // If a custom avatar is selected, inject its data URL before starting
    const customAvatar = settings?.customAvatars?.find(a => a.id === settings.avatarId);
    if (customAvatar) {
      void engine.setCustomPlayerImage(customAvatar.dataUrl).then(() => engine.start(canvas));
    } else {
      void engine.start(canvas);
    }

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  // Settings are captured at engine creation time — changing settings requires restarting the level
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId, canvasRef]);

  const getEngine = useCallback(() => engineRef.current, []);

  return { getEngine };
}
