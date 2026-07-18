export interface DeepCloneOptions {
  maxDepth?: number;
}

export function deepClone<T>(value: T, options?: DeepCloneOptions): T {
  const seen = new WeakMap<object, object>();
  const { maxDepth = 100 } = options ?? {};

  function clone(val: unknown, depth: number): unknown {
    if (depth > maxDepth) throw new Error('Maximum clone depth exceeded');
    if (val === null || typeof val !== 'object') return val;
    if (seen.has(val as object)) return seen.get(val as object);

    if (val instanceof Date) return new Date(val.getTime());
    if (val instanceof RegExp) return new RegExp(val.source, val.flags);
    if (val instanceof Map) {
      const result = new Map();
      seen.set(val, result);
      for (const [k, v] of val) result.set(clone(k, depth + 1), clone(v, depth + 1));
      return result;
    }
    if (val instanceof Set) {
      const result = new Set();
      seen.set(val, result);
      for (const v of val) result.add(clone(v, depth + 1));
      return result;
    }
    if (Array.isArray(val)) {
      const result: unknown[] = [];
      seen.set(val, result);
      for (const v of val) result.push(clone(v, depth + 1));
      return result;
    }

    const result: Record<string, unknown> = {};
    seen.set(val as object, result);
    for (const key of Object.keys(val as object)) {
      result[key] = clone((val as Record<string, unknown>)[key], depth + 1);
    }
    return result;
  }

  return clone(value, 0) as T;
}
