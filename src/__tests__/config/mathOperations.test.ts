import { describe, it, expect } from 'vitest';
import { ADDITION, SUBTRACTION } from '../../config/mathOperations.ts';

describe('ADDITION', () => {
  it('applies correctly', () => {
    expect(ADDITION.apply(3, 7)).toBe(10);
    expect(ADDITION.apply(0, 0)).toBe(0);
  });

  it('generates operand within bounds', () => {
    for (let i = 0; i < 100; i++) {
      const a = 15;
      const b = ADDITION.generateOperand(a, 0, 20);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(5); // 20 - 15
      expect(a + b).toBeLessThanOrEqual(20);
    }
  });
});

describe('SUBTRACTION', () => {
  it('applies correctly', () => {
    expect(SUBTRACTION.apply(10, 3)).toBe(7);
    expect(SUBTRACTION.apply(5, 5)).toBe(0);
  });

  it('generates operand that never produces negative result', () => {
    for (let i = 0; i < 100; i++) {
      const a = 8;
      const b = SUBTRACTION.generateOperand(a, 0, 20);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(a);
      expect(a - b).toBeGreaterThanOrEqual(0);
    }
  });
});
