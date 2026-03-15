import type { ZombieEntity } from '../../types.ts';

export function drawTarget(
  ctx: CanvasRenderingContext2D,
  target: ZombieEntity | undefined,
  targetImage: HTMLImageElement | undefined,
): void {
  if (!target) return;

  const x = target.x;
  const y = target.y - target.height / 2 + target.bobbingOffset;

  if (targetImage) {
    ctx.drawImage(targetImage, x, y, target.width, target.height);
  } else {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, target.width, target.height);
  }
}
