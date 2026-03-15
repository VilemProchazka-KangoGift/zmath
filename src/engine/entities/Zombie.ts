import type { ZombieEntity, ZombieTypeConfig, GameConfig } from '../types.ts';
import type { Challenge } from '../../challenges/types.ts';

function randomVariance(baseSpeed: number): number {
  return baseSpeed * Math.random() * 0.2; // 0..20% of base speed
}

export function createZombie(
  id: number,
  row: number,
  typeConfig: ZombieTypeConfig,
  challenge: Challenge,
  baseSpeed: number,
  config: GameConfig,
  xOverride?: number,
): ZombieEntity {
  const baseSize = config.playerSize;
  const size = baseSize * typeConfig.sizeMultiplier * (config.zombieSizeMultiplier ?? 1.0);
  const rowHeight = (config.canvas.height - config.topPadding * 2) / config.numRows;
  const variance = randomVariance(baseSpeed);

  return {
    id,
    x: xOverride ?? config.canvas.width - size,
    y: config.topPadding + row * rowHeight + rowHeight / 2,
    width: size,
    height: size,
    row,
    speed: (baseSpeed + variance) * typeConfig.speedMultiplier,
    randomVariance: variance,
    state: 'alive',
    dyingAnimationTimer: 0,
    angle: 0,
    bobbingAngle: Math.random() * Math.PI * 2,
    bobbingOffset: 0,
    shouldRemove: false,
    typeConfig,
    challenge,
    isTransformed: false,
    spawnedAtGameTime: 0,
  };
}
