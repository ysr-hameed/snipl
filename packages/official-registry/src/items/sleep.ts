/**
 * Pause execution for a given number of milliseconds.
 * Uses setTimeout, so precision is limited by the event loop.
 *
 * @param ms - Milliseconds to sleep (defaults to 1000).
 * @param signal - Optional AbortSignal to cancel the sleep.
 */
export async function sleep(ms: number = 1000, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * New in v1.1: sleep without creating a micro-task gap.
 */
export function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
