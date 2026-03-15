import type { GameConfig, PlayerState } from '../../types.ts';

export function drawRowHighlight(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  player: PlayerState,
): void {
  const rowHeight = (config.canvas.height - config.topPadding * 2) / config.numRows;
  const y = config.topPadding + player.row * rowHeight;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, y, config.canvas.width, rowHeight);
  ctx.restore();
}
