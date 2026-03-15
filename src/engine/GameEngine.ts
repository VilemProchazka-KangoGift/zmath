import type { GameConfig, GameState, GameEvent, ZombieEntity } from './types.ts';
import type { ChallengeProvider, Challenge } from '../challenges/types.ts';
import type { FailedChallengeRecord } from '../persistence/types.ts';
import { createGameState, resetGameState } from './GameState.ts';
import { updatePlayerY } from './entities/Player.ts';
import { createZombie } from './entities/Zombie.ts';
import { createBloodSplatter } from './entities/BloodSplatter.ts';
import { updateSpawnSystem } from './systems/SpawnSystem.ts';
import { updatePhysicsSystem } from './systems/PhysicsSystem.ts';
import { updateDifficultySystem } from './systems/DifficultySystem.ts';
import { updateAnimationSystem } from './systems/AnimationSystem.ts';
import { updateCooldownSystem } from './systems/CooldownSystem.ts';
import { updateTimerSystem } from './systems/TimerSystem.ts';
import { updatePhaseSystem, getActivePhaseConfig } from './systems/PhaseSystem.ts';
import { CanvasRenderer } from './rendering/CanvasRenderer.ts';
import { AssetLoader } from './assets/AssetLoader.ts';
import { SoundManager } from './sound/SoundManager.ts';
import { FailedChallengeTracker } from './challenges/FailedChallengeTracker.ts';
import { recordCzechCorrect, resetCzechHistory } from '../challenges/czechProvider.ts';

const IMAGE_MANIFEST: Record<string, string> = {
  player: '/assets/images/player.png',
  zombie: '/assets/images/zombie.png',
  ragdoll: '/assets/images/ragdoll.png',
  tank: '/assets/images/tank.png',
  background: '/assets/images/background.png',
  target: '/assets/images/target.png',
  blood: '/assets/images/blood.png',
  lawnmower: '/assets/images/lawnmower.png',
};

function normalizeAnswer(s: string): string {
  return s.toLowerCase().replace(/ý/g, 'y').replace(/í/g, 'i');
}

function getLeftmostAliveZombie(zombies: ZombieEntity[], row: number): ZombieEntity | undefined {
  let leftmost: ZombieEntity | undefined;
  for (const z of zombies) {
    if (z.row === row && z.state === 'alive') {
      if (!leftmost || z.x < leftmost.x) leftmost = z;
    }
  }
  return leftmost;
}

const STREAK_BONUS_INTERVAL = 5;

export class GameEngine {
  private config: GameConfig;
  private state: GameState;
  private providers: Map<string, ChallengeProvider> = new Map();
  private tracker: FailedChallengeTracker;
  private handlers: Set<(event: GameEvent) => void> = new Set();

  private assetLoader: AssetLoader;
  private soundManager: SoundManager;
  private renderer: CanvasRenderer | null = null;
  private rafId: number | null = null;
  private lastTimestamp = 0;

  constructor(config: GameConfig) {
    this.config = config;
    this.state = createGameState(config);
    this.tracker = new FailedChallengeTracker(
      config.failedChallengeRetryChance,
      config.failedChallengeCorrectToRemove,
    );
    this.assetLoader = new AssetLoader();
    this.soundManager = new SoundManager();

    // Track failures when zombies reach the end (lawnmower or game over)
    this.on((event) => {
      if (event.type === 'zombieReachedEnd') {
        this.tracker.recordFailure(event.challenge, 1);
        // Reset streak on zombie reaching end
        this.state.streak = 0;
        this.emit({ type: 'streakUpdate', streak: 0 });
      }
    });
  }

  registerProvider(provider: ChallengeProvider): void {
    this.providers.set(provider.id, provider);
  }

  async start(canvas: HTMLCanvasElement): Promise<void> {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2d context');

    canvas.width = this.config.canvas.width;
    canvas.height = this.config.canvas.height;

    const [images] = await Promise.all([
      this.assetLoader.loadAll(IMAGE_MANIFEST),
      this.soundManager.loadAll(this.config.sounds),
    ]);

    this.renderer = new CanvasRenderer(ctx, images, this.config);

    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.soundManager.destroy();
  }

  // ── Public API ──

  movePlayerUp(): void {
    if (this.state.gameOver || this.state.paused || this.state.levelComplete) return;
    if (this.state.player.row > 0) {
      this.state.player.row--;
      updatePlayerY(this.state.player, this.config);
      this.playSound('step');
    }
  }

  movePlayerDown(): void {
    if (this.state.gameOver || this.state.paused || this.state.levelComplete) return;
    if (this.state.player.row < this.config.numRows - 1) {
      this.state.player.row++;
      updatePlayerY(this.state.player, this.config);
      this.playSound('step');
    }
  }

  submitAnswer(input: string): void {
    if (this.state.gameOver || this.state.paused || this.state.levelComplete) return;

    if (!this.state.canShoot) {
      this.playSound('cannotShoot');
      return;
    }

    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;

    this.playSound('shoot');
    this.state.player.isShooting = true;
    this.state.player.shootAnimationTimer = 0;

    const target = getLeftmostAliveZombie(this.state.zombies, this.state.player.row);
    if (!target) return;

    if (normalizeAnswer(trimmed) === normalizeAnswer(target.challenge.answer)) {
      // Correct
      const responseTimeMs = this.state.levelTimer - target.spawnedAtGameTime;
      this.tracker.recordSuccess(target.challenge);

      // Slow answer: treat as failed so it gets retried
      if (responseTimeMs >= 20000) {
        this.tracker.recordFailure(target.challenge, target.typeConfig.challengeDifficulty);
      }

      this.emit({ type: 'challengeCorrect', challenge: target.challenge, responseTimeMs });

      // Track correct Czech answers to reduce repetition
      if (target.challenge.inputType === 'text') {
        recordCzechCorrect(target.challenge.display);
      }

      setTimeout(() => {
        if (target.typeConfig.id === 'tank' && !target.isTransformed) {
          this.playSound(target.typeConfig.deathSound);
        } else if (target.typeConfig.id === 'ragdoll') {
          this.playSound(target.typeConfig.deathSound);
        } else {
          this.playSound('hit');
        }
      }, 100);

      target.state = 'dying';
      target.dyingAnimationTimer = 0;

      // Blood splatter (suppress for tank transform or if blood disabled)
      const suppressBlood =
        !this.config.showBlood ||
        (target.typeConfig.suppressBloodOnTransform && !target.isTransformed);
      if (!suppressBlood) {
        this.state.bloodSplatters.push(
          createBloodSplatter(
            target.x + target.width / 2,
            target.y - target.height / 2 + target.bobbingOffset,
            target.width,
            target.height,
          ),
        );
      }

      // Handle tank transformation: spawn a new regular zombie at the same position
      if (target.typeConfig.transformOnDeath && !target.isTransformed) {
        this.scheduleTransform(target);
      }

      this.state.score++;
      this.emit({ type: 'scoreChanged', score: this.state.score });

      // Streak tracking
      this.state.streak++;
      this.emit({ type: 'streakUpdate', streak: this.state.streak });

      // Streak bonus every N correct answers
      if (this.state.streak > 0 && this.state.streak % STREAK_BONUS_INTERVAL === 0) {
        const points = this.state.streak;
        const bonus = {
          text: `+${points} Série ${this.state.streak}!`,
          points,
          x: this.config.canvas.width / 2,
          y: this.config.canvas.height / 2 + 40,
          timer: 0,
        };
        this.state.pendingBonuses.push(bonus);
        this.state.bonusScore += points;
        this.state.score += points;
        this.emit({ type: 'scoreBonus', bonus });
        this.emit({ type: 'scoreChanged', score: this.state.score });
      }
    } else {
      // Incorrect
      this.tracker.recordFailure(target.challenge, target.typeConfig.challengeDifficulty);
      this.emit({ type: 'challengeIncorrect', challenge: target.challenge });

      // Czech (vyjmenovaná slova) questions: swap for a fresh one so the
      // player doesn't just guess the other letter on the same word.
      if (target.challenge.inputType === 'text') {
        const czechProvider = this.providers.get('czech');
        if (czechProvider) {
          target.challenge = czechProvider.generate(
            target.typeConfig.challengeDifficulty,
            { czechLetters: this.config.czechLetters },
          );
        }
      }

      setTimeout(() => {
        this.playSound('missed');
      }, 100);

      this.state.canShoot = false;
      this.state.cooldownTimer = 0;
      this.emit({ type: 'cooldownStarted' });

      // Reset streak on wrong answer
      this.state.streak = 0;
      this.emit({ type: 'streakUpdate', streak: 0 });
    }
  }

  pause(): void {
    if (this.state.gameOver || this.state.levelComplete) return;
    this.state.paused = true;
    this.emit({ type: 'paused' });
  }

  resume(): void {
    if (!this.state.paused) return;
    this.state.paused = false;
    this.lastTimestamp = performance.now();
    this.emit({ type: 'resumed' });
  }

  restart(): void {
    resetGameState(this.state, this.config);
    resetCzechHistory();
    this.emit({ type: 'restarted' });
    this.lastTimestamp = performance.now();
    if (this.rafId === null) {
      this.loop(this.lastTimestamp);
    }
  }

  on(handler: (event: GameEvent) => void): void {
    this.handlers.add(handler);
  }

  off(handler: (event: GameEvent) => void): void {
    this.handlers.delete(handler);
  }

  getFailedChallenges(): FailedChallengeRecord[] {
    return this.tracker.getAll();
  }

  loadFailedChallenges(records: FailedChallengeRecord[]): void {
    this.tracker.loadFrom(records);
  }

  markUserInteracted(): void {
    this.soundManager.markUserInteracted();
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundManager.setEnabled(enabled);
  }

  setMasterVolume(volume: number): void {
    this.soundManager.setMasterVolume(volume);
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  async setCustomPlayerImage(dataUrl: string): Promise<void> {
    await this.assetLoader.loadImage(this.config.playerSpriteKey, dataUrl);
  }

  // ── Internal ──

  private emit(event: GameEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }

  private playSound(id: string): void {
    this.soundManager.play(id);
  }

  private playLoop(soundId: string, key: string): void {
    this.soundManager.playLoop(soundId, key);
  }

  private stopLoop(key: string): void {
    this.soundManager.stopLoop(key);
  }

  private loop(timestamp: number): void {
    const dt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (!this.state.paused && !this.state.gameOver && !this.state.levelComplete) {
      this.update(dt);
    }

    this.renderer?.render(this.state);

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number): void {
    const emitter = (e: GameEvent) => this.emit(e);
    const soundPlayer = (id: string) => this.playSound(id);
    const loopPlayer = (soundId: string, key: string) => this.playLoop(soundId, key);
    const loopStopper = (key: string) => this.stopLoop(key);

    updateCooldownSystem(this.state, this.config, dt, emitter);
    updatePhaseSystem(this.state, this.config, dt, emitter);
    updateTimerSystem(this.state, this.config, dt, emitter);

    const phaseConfig = getActivePhaseConfig(this.config, this.state);
    updateDifficultySystem(this.state, this.config, dt, phaseConfig);
    updateSpawnSystem(this.state, this.config, dt, this.providers, this.tracker, soundPlayer, phaseConfig);
    updatePhysicsSystem(this.state, this.config, dt, emitter, soundPlayer, loopPlayer);
    updateAnimationSystem(this.state, dt, this.config.canvas.width, soundPlayer, loopStopper);

    // Update bonus popup timers
    for (const bonus of this.state.pendingBonuses) {
      bonus.timer += dt;
    }
    this.state.pendingBonuses = this.state.pendingBonuses.filter(b => b.timer < 1000);
  }

  private scheduleTransform(dyingZombie: ZombieEntity): void {
    // After the dying animation completes (500ms), create a new regular zombie at that position
    const transformTypeId = dyingZombie.typeConfig.transformOnDeath!;
    const transformType = this.config.level.zombieTypes.find(t => t.id === transformTypeId);
    if (!transformType) return;

    setTimeout(() => {
      if (this.state.gameOver || this.state.levelComplete) return;

      const phaseConfig = getActivePhaseConfig(this.config, this.state);
      const ops = phaseConfig?.mathOperations ?? this.config.mathOperations;
      const maxResult = phaseConfig?.maxResult ?? this.config.maxResult;
      const minResult = phaseConfig?.minResult ?? this.config.minResult;

      const provider = this.providers.get(
        this.config.level.challengeProviderIds[0],
      );
      const challenge: Challenge = provider
        ? provider.generate(transformType.challengeDifficulty, {
            minResult,
            maxResult,
            operations: ops,
            nasoblikaTables: this.config.nasoblikaTables,
            nasoblikaDivision: this.config.nasoblikaDivision,
            czechLetters: this.config.czechLetters,
          })
        : { display: '1 + 1 = ?', answer: '2', inputType: 'numeric' };

      const newZombie = createZombie(
        this.state.nextZombieId++,
        dyingZombie.row,
        transformType,
        challenge,
        this.state.zombieSpeed,
        this.config,
        dyingZombie.x,
      );
      newZombie.isTransformed = true;
      newZombie.spawnedAtGameTime = this.state.levelTimer;
      this.state.zombies.push(newZombie);
    }, 500);
  }
}
