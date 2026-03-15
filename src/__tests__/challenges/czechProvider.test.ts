import { describe, it, expect } from 'vitest';
import { czechProvider } from '../../challenges/czechProvider.ts';

describe('czechProvider', () => {
  it('has correct id and name', () => {
    expect(czechProvider.id).toBe('czech');
    expect(czechProvider.name).toBe('Vyjmenovaná slova');
  });

  it('generates conforming Challenge objects', () => {
    for (let i = 0; i < 20; i++) {
      const c = czechProvider.generate(1);
      expect(c.display).toBeTruthy();
      expect(typeof c.answer).toBe('string');
      expect(c.answer.length).toBeGreaterThan(0);
      expect(c.inputType).toBe('text');
    }
  });
});
