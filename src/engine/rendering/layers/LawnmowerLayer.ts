import type { LawnmowerEntity } from '../../types.ts';

const MOWER_SIZE = 36;

export function drawLawnmowers(
  ctx: CanvasRenderingContext2D,
  lawnmowers: LawnmowerEntity[],
  lawnmowerImage: HTMLImageElement | undefined,
): void {
  for (const lm of lawnmowers) {
    if (lm.state === 'used') continue;

    ctx.save();

    const LEFT_MARGIN = 6;
    const x = lm.x - MOWER_SIZE / 2 + LEFT_MARGIN;
    const y = lm.y - MOWER_SIZE / 2;

    if (lawnmowerImage) {
      if (lm.state === 'active') {
        // Slight red tint when sweeping
        ctx.filter = 'brightness(120%) hue-rotate(-20deg)';
      }
      ctx.drawImage(lawnmowerImage, x, y, MOWER_SIZE, MOWER_SIZE);
    } else {
      // Fallback rectangle
      ctx.fillStyle = lm.state === 'active' ? '#ff4444' : '#888888';
      ctx.fillRect(x, y, MOWER_SIZE, MOWER_SIZE);
    }

    ctx.restore();
  }
}
