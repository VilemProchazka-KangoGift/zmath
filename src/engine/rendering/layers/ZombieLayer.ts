import type { ZombieEntity, GameConfig } from '../../types.ts';

export function drawZombies(
  ctx: CanvasRenderingContext2D,
  zombies: ZombieEntity[],
  images: Map<string, HTMLImageElement>,
  config?: GameConfig,
): void {
  // Sort right-to-left so leftmost zombies (and their labels) draw on top
  const sorted = [...zombies].sort((a, b) => b.x - a.x);

  for (const zombie of sorted) {
    ctx.save();

    const drawX = zombie.x + zombie.width / 2;
    const drawY = zombie.y - zombie.height / 2 + zombie.bobbingOffset;

    ctx.translate(drawX, drawY);

    if (zombie.state === 'dying') {
      ctx.filter = 'brightness(150%) sepia(100%) saturate(500%) hue-rotate(-50deg)';
      ctx.rotate(zombie.angle);
    }

    const sprite = images.get(zombie.typeConfig.spriteKey);
    if (sprite) {
      ctx.drawImage(sprite, -zombie.width / 2, -zombie.height / 2, zombie.width, zombie.height);
    } else {
      ctx.fillStyle = 'green';
      ctx.fillRect(-zombie.width / 2, -zombie.height / 2, zombie.width, zombie.height);
    }

    ctx.restore();

    // Problem text — drawn after all zombies so it's always on top
  }

  // Second pass: draw problem labels on top of all zombie sprites
  for (const zombie of sorted) {
    if (zombie.state === 'alive') {
      const text = `${zombie.challenge.display}`;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';

      const metrics = ctx.measureText(text);
      const padding = 5;
      const halfLabel = metrics.width / 2 + padding;

      // Clamp horizontally so the label never overflows the canvas
      const canvasW = config?.canvas.width ?? ctx.canvas.width;
      let textX = zombie.x + zombie.width / 2;
      if (textX + halfLabel > canvasW) {
        textX = canvasW - halfLabel;
      }
      if (textX - halfLabel < 0) {
        textX = halfLabel;
      }

      // Clamp so text never goes above canvas top
      const rawY = zombie.y - zombie.height / 2 + zombie.bobbingOffset - 35;
      const textY = Math.max(16, rawY);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(
        textX - halfLabel,
        textY - 14 - padding,
        metrics.width + padding * 2,
        14 + padding * 2,
      );

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        textX - halfLabel,
        textY - 14 - padding,
        metrics.width + padding * 2,
        14 + padding * 2,
      );

      ctx.fillStyle = '#111';
      ctx.fillText(text, textX, textY);
    }
  }
}
