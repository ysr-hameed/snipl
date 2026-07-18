export interface RetryOptions {
  attempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  jitter?: boolean;
  retryPredicate?: (error: unknown) => boolean;
}

export async function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
  const {
    attempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    jitter = false,
    retryPredicate,
  } = options ?? {};
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
