export interface MemoizeOptions {
  maxSize?: number;
  keyFn?: (...args: any[]) => string;
}

export function memoize<T extends (...args: any[]) => any>(fn: T, options?: MemoizeOptions): T {
  const cache = new Map<string, ReturnType<T>>();
  const { maxSize = Infinity, keyFn = (...args: any[]) => JSON.stringify(args) } = options ?? {};

  const memoized = function (...args: any[]): any {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    if (cache.size > maxSize) {
      const first = cache.keys().next().value;
      if (first !== undefined) cache.delete(first);
    }
    return result;
  };

  return memoized as unknown as T;
}
