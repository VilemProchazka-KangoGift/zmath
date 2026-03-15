import { describe, it, expect } from 'vitest';
import { mathProvider } from '../../challenges/mathProvider.ts';

describe('mathProvider', () => {
  it('has correct id and name', () => {
    expect(mathProvider.id).toBe('math');
    expect(mathProvider.name).toBe('Matematika');
  });

  it('generates valid challenges at difficulty 1 (2 operands)', () => {
    for (let i = 0; i < 50; i++) {
      const c = mathProvider.generate(1);
      expect(c.inputType).toBe('numeric');
      expect(c.display).toMatch(/^\d+ [+\-] \d+ = \?$/);
      const result = Number(c.answer);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(20);
    }
  });

  it('generates 3-operand challenges at difficulty 2', () => {
    for (let i = 0; i < 50; i++) {
      const c = mathProvider.generate(2);
      expect(c.inputType).toBe('numeric');
      expect(c.display).toMatch(/^\d+ [+\-] \d+ [+\-] \d+ = \?$/);
      const result = Number(c.answer);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(20);
    }
  });

  it('generates 2-operand challenges at difficulty 3', () => {
    for (let i = 0; i < 50; i++) {
      const c = mathProvider.generate(3);
      expect(c.inputType).toBe('numeric');
      const result = Number(c.answer);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(20);
    }
  });

  it('answer is a string', () => {
    const c = mathProvider.generate(1);
    expect(typeof c.answer).toBe('string');
  });

  it('respects custom maxResult option', () => {
    for (let i = 0; i < 50; i++) {
      const c = mathProvider.generate(1, { minResult: 0, maxResult: 10 });
      const result = Number(c.answer);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it('respects custom minResult option', () => {
    for (let i = 0; i < 50; i++) {
      const c = mathProvider.generate(1, { minResult: 5, maxResult: 50 });
      // The first operand should be >= minResult
      const firstNum = Number(c.display.split(' ')[0]);
      expect(firstNum).toBeGreaterThanOrEqual(5);
      // Result should be within range
      const result = Number(c.answer);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(50);
    }
  });

  it('generates challenges with high maxResult', () => {
    for (let i = 0; i < 50; i++) {
      const c = mathProvider.generate(1, { minResult: 0, maxResult: 100 });
      const result = Number(c.answer);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    }
  });
});
