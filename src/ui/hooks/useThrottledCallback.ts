import { useCallback, useRef } from 'react';

export function useThrottledCallback<T extends (...args: any[]) => void>(cb: T, delay: number): T {
  const lastCallRef = useRef(0);
  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        cb(...args);
      }
    }) as T,
    [cb, delay],
  );
}
