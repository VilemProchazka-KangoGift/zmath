import type { GameConfig, GameState, ScoreBonus } from '../../types.ts';

export function drawGameOverOverlay(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
): void {
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);
}

export function drawPauseOverlay(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);

  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('PAUZA', config.canvas.width / 2, config.canvas.height / 2);
}

export function drawLevelCompleteOverlay(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  score: number,
): void {
  ctx.fillStyle = 'rgba(0, 128, 0, 0.5)';
  ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);

  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('LEVEL HOTOV!', config.canvas.width / 2, config.canvas.height / 2 - 30);
  ctx.font = '32px Arial';
  ctx.fillText(`Skóre: ${score}`, config.canvas.width / 2, config.canvas.height / 2 + 20);
}

export function drawPhaseAnnouncementOverlay(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  state: GameState,
): void {
  if (!state.phase || !state.phase.announcing || !state.phase.announceText) return;

  const phases = config.level.phases;
  const currentPhase = phases?.[state.phase.currentPhaseIndex];
  const duration = currentPhase?.announceDurationMs ?? 2000;
  const progress = Math.min(1, state.phase.announceTimer / duration);

  // Fade in/out
  let alpha: number;
  if (progress < 0.15) {
    alpha = progress / 0.15;
  } else if (progress > 0.75) {
    alpha = (1 - progress) / 0.25;
  } else {
    alpha = 1;
  }
  alpha = Math.max(0, Math.min(1, alpha));

  // Semi-transparent backdrop
  ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * alpha})`;
  ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);

  // Text color based on phase type
  const isBoss = currentPhase?.type === 'boss';
  const textColor = isBoss
    ? `rgba(255, 50, 50, ${alpha})`
    : `rgba(76, 255, 76, ${alpha})`;

  ctx.save();
  ctx.font = `bold ${isBoss ? 64 : 52}px Creepster, cursive`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Slight scale effect
  const scale = 0.8 + 0.2 * alpha;
  ctx.translate(config.canvas.width / 2, config.canvas.height / 2);
  ctx.scale(scale, scale);
  ctx.fillText(state.phase.announceText, 0, 0);
  ctx.restore();
}

export function drawBonusPopups(
  ctx: CanvasRenderingContext2D,
  bonuses: ScoreBonus[],
): void {
  for (const bonus of bonuses) {
    const progress = bonus.timer / 1000; // 0..1 over 1 second
    const alpha = 1 - progress;
    const yOffset = -40 * progress; // drift upward

    ctx.save();
    ctx.font = 'bold 24px Creepster, cursive';
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bonus.text, bonus.x, bonus.y + yOffset);
    ctx.restore();
  }
}
