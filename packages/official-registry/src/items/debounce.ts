export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options?: DebounceOptions,
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let leadingInvoked = false;

  const { leading = false, trailing = true } = options ?? {};

  function invoke(): void {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
      leadingInvoked = true;
    }
  }

  const debounced: DebouncedFunction<T> = function (...args: Parameters<T>) {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    if (leading && !leadingInvoked) {
      invoke();
      leadingInvoked = true;
    }
    timer = setTimeout(() => {
      if (trailing) invoke();
      timer = null;
      leadingInvoked = false;
    }, wait);
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
    leadingInvoked = false;
  };

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      invoke();
      leadingInvoked = false;
    }
  };

  return debounced;
}
