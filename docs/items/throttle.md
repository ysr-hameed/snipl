# throttle

Create a throttled function that limits invocation rate.

```ts
throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: ThrottleOptions,
): ThrottledFunction<T>
```

## API

```ts
interface ThrottleOptions {
  leading?: boolean; // default: true
  trailing?: boolean; // default: true
}

interface ThrottledFunction<T> {
  (...args: Parameters<T>): void;
  cancel(): void;
}
```

## Examples

```ts
import { throttle } from './snippets/throttle.js';

const update = throttle(() => refresh(), 100);
window.addEventListener('scroll', update);
```

## Caveats

- `trailing: true` will invoke once more after the throttle window ends with the last arguments.
- `cancel()` discards pending trailing invocations.
