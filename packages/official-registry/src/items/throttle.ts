export interface ThrottleOptions {
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
