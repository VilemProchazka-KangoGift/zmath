import type { GameState, GameConfig, ZombieEntity } from '../types.ts';
import { drawBackground } from './layers/BackgroundLayer.ts';
import { drawBlood } from './layers/BloodLayer.ts';
import { drawRowHighlight } from './layers/RowHighlightLayer.ts';
import { drawLawnmowers } from './layers/LawnmowerLayer.ts';
import { drawZombies } from './layers/ZombieLayer.ts';
import { drawPlayer } from './layers/PlayerLayer.ts';
import { drawTarget } from './layers/TargetLayer.ts';
import {
  drawGameOverOverlay,
  drawPauseOverlay,
  drawLevelCompleteOverlay,
  drawPhaseAnnouncementOverlay,
  drawBonusPopups,
} from './layers/OverlayLayer.ts';

function getLeftmostAliveZombie(zombies: ZombieEntity[], row: number): ZombieEntity | undefined {
  let leftmost: ZombieEntity | undefined;
  for (const z of zombies) {
    if (z.row === row && z.state === 'alive') {
      if (!leftmost || z.x < leftmost.x) {
        leftmost = z;
      }
    }
  }
  return leftmost;
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private images: Map<string, HTMLImageElement>;
  private config: GameConfig;

  constructor(
    ctx: CanvasRenderingContext2D,
    images: Map<string, HTMLImageElement>,
    config: GameConfig,
  ) {
    this.ctx = ctx;
    this.images = images;
    this.config = config;
  }

  render(state: GameState): void {
    const ctx = this.ctx;
    const config = this.config;

    ctx.clearRect(0, 0, config.canvas.width, config.canvas.height);

    // 1. Background
    drawBackground(ctx, config, this.images);

    // 2. Blood splatters
    if (config.showBlood) {
      drawBlood(ctx, state.bloodSplatters, this.images.get('blood'));
    }

    // 3. Row highlight
    if (config.showRowHighlight) {
      drawRowHighlight(ctx, config, state.player);
    }

    // 4. Lawnmowers
    drawLawnmowers(ctx, state.lawnmowers, this.images.get('lawnmower'));

    // 5. Zombies
    drawZombies(ctx, state.zombies, this.images, config);

    // 6. Player
    drawPlayer(ctx, state.player, state.canShoot, this.images.get(config.playerSpriteKey));

    // 7. Target reticle
    if (!state.gameOver && !state.levelComplete) {
      const target = getLeftmostAliveZombie(state.zombies, state.player.row);
      drawTarget(ctx, target, this.images.get('target'));
    }

    // 8. Bonus popups (above game, below overlays)
    if (state.pendingBonuses.length > 0) {
      drawBonusPopups(ctx, state.pendingBonuses);
    }

    // 9. Overlays
    if (state.gameOver) {
      drawGameOverOverlay(ctx, config);
    } else if (state.levelComplete) {
      drawLevelCompleteOverlay(ctx, config, state.score);
    } else if (state.paused) {
      drawPauseOverlay(ctx, config);
    }

    // 10. Phase announcement (on top of everything)
    if (state.phase?.announcing) {
      drawPhaseAnnouncementOverlay(ctx, config, state);
    }
  }
}
