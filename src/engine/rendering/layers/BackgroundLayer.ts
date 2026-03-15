import type { GameConfig } from '../../types.ts';

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  images: Map<string, HTMLImageElement>,
): void {
  const bg = images.get(config.level.backgroundKey);
  if (bg) {
    ctx.drawImage(bg, 0, 0, config.canvas.width, config.canvas.height);
  }
}
