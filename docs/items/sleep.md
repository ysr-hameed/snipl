# sleep

Delay execution for a given duration.

```ts
sleep(ms: number, options?: { signal?: AbortSignal }): Promise<void>
```

## API

- `ms` — delay in milliseconds. Negative values are clamped to 0.
- `options.signal` — optional `AbortSignal` to cancel the delay. The promise rejects with `Error('The operation was aborted')`.

## Examples

```ts
import { sleep } from './snippets/sleep.js';

await sleep(1000); // wait 1 second
```

With cancellation:

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 500);
await sleep(1000, { signal: controller.signal }); // rejects after 500ms
```

## Caveats

- Relies on `setTimeout` and `Promise` — no high-precision timing guarantees.
- AbortSignal support requires Node 16+ or modern browser.
