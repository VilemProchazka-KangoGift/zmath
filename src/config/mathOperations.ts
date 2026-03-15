export interface MathOperation {
  symbol: string;
  apply(a: number, b: number): number;
  generateOperand(a: number, minResult: number, maxResult: number): number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ADDITION: MathOperation = {
  symbol: '+',
  apply: (a, b) => a + b,
  generateOperand(a, _minResult, maxResult) {
    return randomInt(0, maxResult - a);
  },
};

export const SUBTRACTION: MathOperation = {
  symbol: '-',
  apply: (a, b) => a - b,
  generateOperand(a, _minResult, _maxResult) {
    return randomInt(0, a);
  },
};

export const MULTIPLICATION: MathOperation = {
  symbol: '\u00d7',
  apply: (a, b) => a * b,
  generateOperand(a, _minResult, maxResult) {
    if (a === 0) return randomInt(0, maxResult);
    return randomInt(0, Math.floor(maxResult / a));
  },
};

export const DIVISION: MathOperation = {
  symbol: '\u00f7',
  apply: (a, b) => a / b,
  generateOperand(a, _minResult, _maxResult) {
    // Generate a divisor that divides evenly
    if (a === 0) return 1;
    const divisors = [];
    for (let i = 1; i <= a; i++) {
      if (a % i === 0) divisors.push(i);
    }
    // Avoid trivial a ÷ a = 1: re-roll if we picked a itself (75% chance)
    if (divisors.length > 1) {
      const nonSelf = divisors.filter(d => d !== a);
      if (nonSelf.length > 0 && Math.random() < 0.75) {
        return nonSelf[randomInt(0, nonSelf.length - 1)];
      }
    }
    return divisors[randomInt(0, divisors.length - 1)];
  },
};

export const ALL_OPERATIONS: MathOperation[] = [ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION];
