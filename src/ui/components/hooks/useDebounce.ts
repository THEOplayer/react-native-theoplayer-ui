import { useCallback, useRef } from 'react';

export function useDebounce<T>(func: (value: T) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  return useCallback(
    (value: T, force?: boolean) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
      if (force) {
        func(value);
      } else {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = undefined;
          func(value);
        }, delay);
      }
    },
    [func, delay],
  );
}
