# deep-clone

Deep clone a value with circular reference handling.

```ts
deepClone<T>(value: T, options?: DeepCloneOptions): T
```

## API

```ts
interface DeepCloneOptions {
  maxDepth?: number; // default: 100
}
```

## Examples

```ts
import { deepClone } from './snippets/deep-clone.js';

const obj = { a: 1, b: { c: [1, 2, 3] } };
const clone = deepClone(obj);
clone.b.c.push(4); // original unaffected
```

Circular references:

```ts
const obj: any = { a: 1 };
obj.self = obj;
const clone = deepClone(obj); // works — circular ref preserved
```

## Supported types

- Primitives (by value)
- Date, RegExp, Map, Set
- Arrays and plain objects
- Circular references (via `WeakMap`)

## Caveats

- Functions, class instances, Symbols, WeakMap, WeakSet, and typed arrays are NOT deeply cloned — they're copied by reference.
- Recursive depth is capped at `maxDepth` (default 100). Throws on exceed.
