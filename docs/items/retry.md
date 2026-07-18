# retry

Retry an async operation with configurable backoff.

```ts
retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>
```

## API

```ts
interface RetryOptions {
  attempts?: number; // default: 3
  baseDelay?: number; // default: 1000ms
  maxDelay?: number; // default: 30000ms
  jitter?: boolean; // default: false
  retryPredicate?: (error: unknown) => boolean;
}
```

Backoff: `delay = baseDelay * 2^attempt`, capped at `maxDelay`. With jitter: `delay * (0.5 + random() * 0.5)`.

## Examples

```ts
import { retry } from './snippets/retry.js';

const data = await retry(() => fetch('/api/data'));
```

Retry only certain errors:

```ts
const data = await retry(fetchData, {
  attempts: 5,
  retryPredicate: (err) => err instanceof NetworkError,
});
```

## Caveats

- Exponential backoff can produce long delays at high attempt counts.
- `retryPredicate` can cause unexpected non-retryable errors to propagate immediately.
- Jitter adds randomness — tests should use fixed seeds or mock `Math.random`.
