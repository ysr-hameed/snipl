# debounce

Create a debounced function that delays invocation.

```ts
debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: DebounceOptions,
): DebouncedFunction<T>
```

## API

```ts
interface DebounceOptions {
  leading?: boolean; // default: false
  trailing?: boolean; // default: true
}

interface DebouncedFunction<T> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
}
```

## Examples

```ts
import { debounce } from './snippets/debounce.js';

const debounced = debounce(() => save(), 300);
input.addEventListener('input', debounced);
```

Leading invocation + flush:

```ts
const fn = debounce(validate, 200, { leading: true });
fn('a'); // validates immediately
fn('ab'); // trailing call schedules
fn.flush(); // immediately calls with 'ab'
```

## Caveats

- The debounced function is void-returning. Use `flush()` to get the last pending invocation.
- `leading: true, trailing: true` triggers twice per burst (leading + trailing).
