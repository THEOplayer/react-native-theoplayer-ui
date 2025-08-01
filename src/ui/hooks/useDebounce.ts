import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, debounceMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined;
    timer = setTimeout(() => {
      setDebouncedValue(value);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [debounceMs, value]);
  return debouncedValue;
}
