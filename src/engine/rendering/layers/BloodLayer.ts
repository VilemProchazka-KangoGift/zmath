import type { BloodSplatterEntity } from '../../types.ts';

export function drawBlood(
  ctx: CanvasRenderingContext2D,
  splatters: BloodSplatterEntity[],
  bloodImage: HTMLImageElement | undefined,
): void {
  if (!bloodImage) return;
  for (const b of splatters) {
    ctx.save();
    ctx.globalAlpha = b.opacity;
    ctx.drawImage(bloodImage, b.x, b.y, b.width, b.height);
    ctx.restore();
  }
}
