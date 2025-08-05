import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A throttled version of React's `useState` that limits how often the state is updated.
 *
 * When `setValue` is called repeatedly, the state will update immediately if enough time
 * has passed since the last update. Otherwise, it schedules an update after the remaining
 * throttle interval. The most recent value is always applied eventually (trailing flush).
 *
 * @param initialValue The initial state value.
 * @param intervalMs The minimum interval (in milliseconds) between state updates.
 * @returns A tuple of `[state, setValue]`, just like `useState`.
 */
export function useThrottledState<T>(initialValue: T, intervalMs: number): [T, (value: T, forced: boolean | undefined) => void] {
  const [state, setState] = useState<T>(initialValue);
  const pendingValue = useRef<T>(initialValue);
  const lastExecuted = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const setThrottled = useCallback(
    (value: T, forced: boolean | undefined = false) => {
      pendingValue.current = value;
      const now = Date.now();
      const timeSinceLast = now - lastExecuted.current;

      clearTimeout(timeoutRef.current);
      if (forced || timeSinceLast >= intervalMs) {
        setState(value);
        lastExecuted.current = now;
      } else {
        timeoutRef.current = setTimeout(() => {
          setState(pendingValue.current);
          lastExecuted.current = Date.now();
        }, intervalMs - timeSinceLast);
      }
    },
    [intervalMs],
  );

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return [state, setThrottled];
}
