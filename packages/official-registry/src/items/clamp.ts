export function clamp(value: number, min: number, max: number): number {
  if (typeof value !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('All arguments must be numbers');
  }
  return Math.min(max, Math.max(min, value));
}
