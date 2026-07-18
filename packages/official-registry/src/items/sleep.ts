export async function sleep(ms: number, options?: { signal?: AbortSignal }): Promise<void> {
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
