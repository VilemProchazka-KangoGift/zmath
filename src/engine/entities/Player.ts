import type { PlayerState, GameConfig } from '../types.ts';

export function createPlayer(config: GameConfig): PlayerState {
  const rowHeight = (config.canvas.height - config.topPadding * 2) / config.numRows;
  return {
    x: config.playerX,
    y: config.topPadding + rowHeight / 2,
    width: config.playerSize,
    height: config.playerSize,
    row: 0,
    isShooting: false,
    shootAnimationTimer: 0,
    rotationAngle: 0,
  };
}

export function updatePlayerY(player: PlayerState, config: GameConfig): void {
  const rowHeight = (config.canvas.height - config.topPadding * 2) / config.numRows;
  player.y = config.topPadding + player.row * rowHeight + rowHeight / 2;
}
