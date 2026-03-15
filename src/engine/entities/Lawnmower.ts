import type { LawnmowerEntity, GameConfig } from '../types.ts';

const LAWNMOWER_X = 10;

export function createLawnmowers(config: GameConfig): LawnmowerEntity[] {
  if (!config.level.lawnmowersEnabled) return [];

  const rowHeight = (config.canvas.height - config.topPadding * 2) / config.numRows;
  const mowers: LawnmowerEntity[] = [];

  for (let row = 0; row < config.numRows; row++) {
    mowers.push({
      row,
      x: LAWNMOWER_X,
      y: config.topPadding + row * rowHeight + rowHeight / 2,
      state: 'idle',
    });
  }

  return mowers;
}
