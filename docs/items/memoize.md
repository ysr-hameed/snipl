# memoize

Memoize a function with configurable cache key.

```ts
memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: MemoizeOptions,
): T
```

## API

```ts
interface MemoizeOptions {
  maxSize?: number; // default: Infinity
  keyFn?: (...args: any[]) => string; // default: JSON.stringify
}
```

## Examples

```ts
import { memoize } from './snippets/memoize.js';

const fib = memoize((n: number): number => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));
fib(40); // fast — cached from prior recursive calls
```

Custom key function:

```ts
const getUser = memoize(fetchUser, {
  keyFn: (id: number) => `user:${id}`,
  maxSize: 100,
});
```

## Caveats

- Default key function (`JSON.stringify`) is fast but fails on circular references and non-serializable values like `undefined`, `BigInt`, or DOM nodes.
- Cache grows unbounded unless `maxSize` is set (LRU eviction).
- Memoized function identity changes — the returned function is a wrapper, not the original.
