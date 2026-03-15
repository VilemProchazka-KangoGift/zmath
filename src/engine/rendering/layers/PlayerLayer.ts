import type { PlayerState } from '../../types.ts';

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  canShoot: boolean,
  playerImage: HTMLImageElement | undefined,
): void {
  ctx.save();

  if (!canShoot) {
    ctx.globalAlpha = 0.5;
  }

  if (player.isShooting) {
    ctx.filter = 'brightness(200%)';
  }

  ctx.translate(player.x + player.width / 2, player.y - player.height / 2);
  ctx.rotate(player.rotationAngle);
  ctx.translate(-player.width / 2, -player.height / 2);

  if (playerImage) {
    ctx.drawImage(playerImage, 0, 0, player.width, player.height);
  } else {
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, player.width, player.height);
  }

  ctx.restore();
}
