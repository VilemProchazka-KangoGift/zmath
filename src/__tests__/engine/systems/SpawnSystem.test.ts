import { describe, it, expect } from 'vitest';
import { selectZombieType, getAvailableRows } from '../../../engine/systems/SpawnSystem.ts';
import { REGULAR, RAGDOLL, TANK } from '../../../config/zombieTypes.ts';
import { createGameState } from '../../../engine/GameState.ts';
import { createDefaultConfig } from '../../../config/defaultConfig.ts';
import { createZombie } from '../../../engine/entities/Zombie.ts';

describe('SpawnSystem', () => {
  describe('selectZombieType', () => {
    const types = [REGULAR, RAGDOLL, TANK];
    const config = createDefaultConfig();
    const tankFreq = config.tankFrequency;
    const ragdollFreq = config.ragdollFrequency;

    it('returns regular for most spawn counts', () => {
      expect(selectZombieType(1, types, tankFreq, ragdollFreq).id).toBe('regular');
      expect(selectZombieType(2, types, tankFreq, ragdollFreq).id).toBe('regular');
      expect(selectZombieType(3, types, tankFreq, ragdollFreq).id).toBe('regular');
    });

    it('returns ragdoll every 5th spawn', () => {
      expect(selectZombieType(5, types, tankFreq, ragdollFreq).id).toBe('ragdoll');
      expect(selectZombieType(10, types, tankFreq, ragdollFreq).id).toBe('ragdoll');
      expect(selectZombieType(25, types, tankFreq, ragdollFreq).id).toBe('ragdoll');
    });

    it('returns tank every 12th spawn', () => {
      expect(selectZombieType(12, types, tankFreq, ragdollFreq).id).toBe('tank');
      expect(selectZombieType(24, types, tankFreq, ragdollFreq).id).toBe('tank');
    });

    it('tank takes priority over ragdoll at 60th spawn (60 % 12 === 0)', () => {
      expect(selectZombieType(60, types, tankFreq, ragdollFreq).id).toBe('tank');
    });
  });

  describe('getAvailableRows', () => {
    const config = createDefaultConfig();

    it('returns all rows when no zombies', () => {
      const state = createGameState(config);
      const rows = getAvailableRows(state, config);
      expect(rows).toHaveLength(6);
    });

    it('excludes rows where zombies are too close to spawn edge', () => {
      const state = createGameState(config);
      const challenge = { display: '1+1=?', answer: '2', inputType: 'numeric' as const };
      // Place zombie near the right edge (close to spawn)
      const zombie = createZombie(1, 0, REGULAR, challenge, 0.05, config);
      zombie.x = config.canvas.width - 50; // within minZombieSpacing
      state.zombies.push(zombie);

      const rows = getAvailableRows(state, config);
      expect(rows).not.toContain(0);
      expect(rows).toHaveLength(5);
    });
  });
});
