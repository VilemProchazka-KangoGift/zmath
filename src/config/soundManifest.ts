import type { SoundEntry } from '../engine/types.ts';

export const SOUND_MANIFEST: Record<string, SoundEntry> = {
  cannotShoot: { path: '/assets/sounds/cannot-shoot.mp3', volume: 1.0 },
  gameOver: { path: '/assets/sounds/game-over.mp3', volume: 1.0 },
  hit: { path: '/assets/sounds/hit.mp3', volume: 0.7 },
  shoot: { path: '/assets/sounds/shoot.mp3', volume: 1.0 },
  spawn: { path: '/assets/sounds/spawn.mp3', volume: 0.2 },
  step: { path: '/assets/sounds/step.mp3', volume: 1.0 },
  missed: { path: '/assets/sounds/missed.mp3', volume: 1.0 },
  ragdollSpawn: { path: '/assets/sounds/meow.mp3', volume: 0.5 },
  ragdollDeath: { path: '/assets/sounds/catscream.mp3', volume: 0.5 },
  tankSpawn: { path: '/assets/sounds/wroom.mp3', volume: 0.5 },
  tankDeath: { path: '/assets/sounds/explosion.mp3', volume: 0.5 },
  lawnmower: { path: '/assets/sounds/lawnmower.mp3', volume: 0.6 },
};
