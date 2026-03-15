import type { Challenge, ChallengeProvider, ChallengeOptions } from './types.ts';
import { ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, type MathOperation } from '../config/mathOperations.ts';

const OP_MAP: Record<string, MathOperation> = {
  '+': ADDITION,
  '-': SUBTRACTION,
  '\u00d7': MULTIPLICATION,
  '\u00f7': DIVISION,
};

function getOperations(symbols?: string[]): MathOperation[] {
  if (!symbols || symbols.length === 0) return [ADDITION];
  const ops = symbols.map(s => OP_MAP[s]).filter(Boolean);
  return ops.length > 0 ? ops : [ADDITION];
}

function randomInt(min: number, max: number): number {
  let result = Math.floor(Math.random() * (max - min + 1)) + min;
  if (result === 0) result = randomInt(min, max);
  return result;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 20;

function multiplyMin(op: MathOperation, minR: number): number {
  // For multiplication, avoid trivial 1×N problems (75% of the time)
  if (op === MULTIPLICATION && minR < 2 && Math.random() < 0.75) return 2;
  return minR;
}

function generate2Operand(operations: MathOperation[], minR: number, maxR: number): Challenge {
  const op = pickRandom(operations);
  const num1 = randomInt(multiplyMin(op, minR), maxR);
  const num2 = op.generateOperand(num1, minR, maxR);
  const result = op.apply(num1, num2);
  return {
    display: `${num1} ${op.symbol} ${num2} = ?`,
    answer: String(result),
    inputType: 'numeric',
  };
}

function generate3Operand(operations: MathOperation[], minR: number, maxR: number): Challenge {
  const op1 = pickRandom(operations);
  const op2 = pickRandom(operations);
  const num1 = randomInt(multiplyMin(op1, minR), maxR);
  const num2 = op1.generateOperand(num1, minR, maxR);
  const intermediate = op1.apply(num1, num2);
  const num3 = op2.generateOperand(intermediate, minR, maxR);
  const result = op2.apply(intermediate, num3);
  return {
    display: `${num1} ${op1.symbol} ${num2} ${op2.symbol} ${num3} = ?`,
    answer: String(result),
    inputType: 'numeric',
  };
}

function generateNasobilka(tables: number[], maxR: number, allowDivision?: boolean): Challenge {
  const table = tables[Math.floor(Math.random() * tables.length)];
  const multiplier = randomInt(1, Math.min(10, Math.floor(maxR / table)));
  const product = table * multiplier;

  // 50% chance to generate division form when enabled: product ÷ table = multiplier
  if (allowDivision && Math.random() < 0.5) {
    return {
      display: `${product} \u00f7 ${table} = ?`,
      answer: String(multiplier),
      inputType: 'numeric',
    };
  }

  return {
    display: `${table} \u00d7 ${multiplier} = ?`,
    answer: String(product),
    inputType: 'numeric',
  };
}

export const mathProvider: ChallengeProvider = {
  id: 'math',
  name: 'Matematika',
  generate(difficulty: number, options?: ChallengeOptions): Challenge {
    const minR = options?.minResult ?? DEFAULT_MIN;
    const maxR = options?.maxResult ?? DEFAULT_MAX;
    const ops = getOperations(options?.operations);
    const tables = options?.nasoblikaTables ?? [];

    // If násobilka tables are set, 50% chance to use them
    if (tables.length > 0 && Math.random() < 0.5) {
      return generateNasobilka(tables, maxR, options?.nasoblikaDivision);
    }

    if (difficulty >= 3) {
      return generate2Operand(ops, minR, maxR);
    } else if (difficulty >= 2) {
      return generate3Operand(ops, minR, maxR);
    } else {
      return generate2Operand(ops, minR, maxR);
    }
  },
};
