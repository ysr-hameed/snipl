import * as crypto from 'crypto';
import type { RegistryItem } from '@snipl/registry-schema';
import { RegistryItemSchema, safeParse } from '@snipl/registry-schema';

interface BuiltinItemDef {
  name: string;
  summary: string;
  tags: string[];
  environments: ('node' | 'browser' | 'universal')[];
  exports: { name: string; kind: 'function' | 'type' }[];
  getSource: () => string;
}

const itemDefs: BuiltinItemDef[] = [
  {
    name: 'sleep',
    summary: 'Delay execution for a given duration',
    tags: ['async', 'timer', 'utility'],
    environments: ['node', 'browser'],
    exports: [{ name: 'sleep', kind: 'function' }],
    getSource: (): string => {
      // Keep in sync with src/items/sleep.ts
      return `export async function sleep(ms: number, options?: { signal?: AbortSignal }): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (ms < 0) ms = 0;
    if (options?.signal?.aborted) {
      reject(new Error('The operation was aborted'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(new Error('The operation was aborted'));
    };
    options?.signal?.addEventListener('abort', onAbort, { once: true });
  });
}
`;
    },
  },
  {
    name: 'retry',
    summary: 'Retry an async operation with configurable backoff',
    tags: ['async', 'retry', 'resilience'],
    environments: ['node', 'browser', 'universal'],
    exports: [
      { name: 'retry', kind: 'function' },
      { name: 'RetryOptions', kind: 'type' },
    ],
    getSource: (): string => {
      // Keep in sync with src/items/retry.ts
      return `export interface RetryOptions {
  attempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
  retryPredicate?: (error: unknown) => boolean;
}

export async function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const { attempts = 3, baseDelay = 1000, maxDelay = 30000, jitter = false, retryPredicate } = options ?? {};
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (retryPredicate && !retryPredicate(err)) throw err;
      if (attempt === attempts - 1) throw err;
      let delay = baseDelay * Math.pow(2, attempt);
      if (jitter) delay = delay * (0.5 + Math.random() * 0.5);
      if (delay > maxDelay) delay = maxDelay;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
`;
    },
  },
  {
    name: 'debounce',
    summary: 'Create a debounced function that delays invocation',
    tags: ['async', 'timer', 'performance'],
    environments: ['node', 'browser', 'universal'],
    exports: [{ name: 'debounce', kind: 'function' }],
    getSource: (): string => {
      // Keep in sync with src/items/debounce.ts
      return `export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: DebounceOptions,
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let leadingInvoked = false;

  const { leading = false, trailing = true } = options ?? {};

  function invoke(): void {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
      leadingInvoked = true;
    }
  }

  const debounced: DebouncedFunction<T> = function (...args: Parameters<T>) {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    if (leading && !leadingInvoked) {
      invoke();
      leadingInvoked = true;
    }
    timer = setTimeout(() => {
      if (trailing) invoke();
      timer = null;
      leadingInvoked = false;
    }, wait);
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
    leadingInvoked = false;
  };

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      invoke();
      leadingInvoked = false;
    }
  };

  return debounced;
}
`;
    },
  },
  {
    name: 'throttle',
    summary: 'Create a throttled function that limits invocation rate',
    tags: ['async', 'timer', 'performance'],
    environments: ['node', 'browser', 'universal'],
    exports: [{ name: 'throttle', kind: 'function' }],
    getSource: (): string => {
      // Keep in sync with src/items/throttle.ts
      return `export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface ThrottledFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: ThrottleOptions,
): ThrottledFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const { leading = true, trailing = true } = options ?? {};

  function invoke(args: Parameters<T>): void {
    fn(...args);
    lastArgs = null;
  }

  const throttled: ThrottledFunction<T> = function (...args: Parameters<T>) {
    if (timer) {
      if (trailing) lastArgs = args;
      return;
    }
    if (leading) invoke(args);
    timer = setTimeout(() => {
      if (trailing && lastArgs) invoke(lastArgs);
      timer = null;
    }, wait);
  };

  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  return throttled;
}
`;
    },
  },
  {
    name: 'memoize',
    summary: 'Memoize a function with configurable cache key',
    tags: ['cache', 'performance', 'utility'],
    environments: ['node', 'browser', 'universal'],
    exports: [{ name: 'memoize', kind: 'function' }],
    getSource: (): string => {
      // Keep in sync with src/items/memoize.ts
      return `export interface MemoizeOptions {
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
`;
    },
  },
  {
    name: 'deep-clone',
    summary: 'Deep clone a value with circular reference handling',
    tags: ['clone', 'object', 'utility'],
    environments: ['node', 'browser', 'universal'],
    exports: [{ name: 'deepClone', kind: 'function' }],
    getSource: (): string => {
      // Keep in sync with src/items/deep-clone.ts
      return `export interface DeepCloneOptions {
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
`;
    },
  },
  {
    name: 'clamp',
    summary: 'Clamp a number within a specified range',
    tags: ['math', 'utility'],
    environments: ['node', 'browser', 'universal'],
    exports: [{ name: 'clamp', kind: 'function' }],
    getSource: (): string => {
      // Keep in sync with src/items/clamp.ts
      return `export function clamp(value: number, min: number, max: number): number {
  if (typeof value !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('All arguments must be numbers');
  }
  return Math.min(max, Math.max(min, value));
}
`;
    },
  },
  {
    name: 'slugify',
    summary: 'Convert a string to a URL-friendly slug',
    tags: ['string', 'url', 'utility'],
    environments: ['node', 'browser', 'universal'],
    exports: [{ name: 'slugify', kind: 'function' }],
    getSource: (): string => {
      // Keep in sync with src/items/slugify.ts
      return `export interface SlugifyOptions {
  separator?: string;
  lower?: boolean;
  strict?: boolean;
}

export function slugify(str: string, options?: SlugifyOptions): string {
  const { separator = '-', lower = true, strict = true } = options ?? {};
  let result = str.normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '');
  if (lower) result = result.toLowerCase();
  if (strict) {
    result = result.replace(/[^a-z0-9\\s-]/g, '');
    result = result.replace(/[^a-z0-9]/g, separator);
  } else {
    result = result.replace(/[^a-z0-9\\s-]/g, '');
  }
  result = result.trim().replace(/\\s+/g, separator);
  const escaped = separator.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
  const multiSep = new RegExp(escaped + '+', 'g');
  const edgeSep = new RegExp('^' + escaped + '|' + escaped + '$', 'g');
  result = result.replace(multiSep, separator).replace(edgeSep, '');
  return result;
}
`;
    },
  },
];

export function buildRegistryItems(): RegistryItem[] {
  return itemDefs.map((def) => {
    const content = def.getSource();
    const sha256 = crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
    const item: RegistryItem = {
      schemaVersion: 1,
      name: def.name,
      version: '0.1.0',
      summary: def.summary,
      tags: def.tags,
      language: 'ts',
      environments: def.environments,
      exports: def.exports,
      files: [{ path: `${def.name}.ts`, content, sha256 }],
      dependencies: [],
      templateVariables: [],
      license: { spdx: 'MIT', source: 'original' },
      tests: [],
      docs: {
        usage: `import { ${def.exports.map((e) => e.name).join(', ')} } from './${def.name}.js';`,
        caveats: [],
      },
    };
    const result = safeParse(RegistryItemSchema, item);
    if (!result.success) {
      throw new Error(
        `Builtin item "${def.name}" failed schema validation: ${JSON.stringify(result.errors)}`,
      );
    }
    return result.data;
  });
}
