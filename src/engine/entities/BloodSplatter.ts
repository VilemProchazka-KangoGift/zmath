import type { BloodSplatterEntity } from '../types.ts';

export function createBloodSplatter(
  x: number,
  y: number,
  zombieWidth: number,
  zombieHeight: number,
): BloodSplatterEntity {
  const width = zombieWidth * 2;
  const height = zombieHeight * 2;
  const offsetX = (Math.random() - 0.5) * 0.2 * width;
  const offsetY = (Math.random() - 0.5) * 0.2 * height;

  return {
    x: x + offsetX - width / 2,
    y: y + offsetY - height / 2,
    width,
    height,
    opacity: 0.5,
  };
}
