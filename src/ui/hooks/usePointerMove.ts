import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useThrottledCallback } from './useThrottledCallback';

export const usePointerMove = (elementId: string, onMove: () => void, onLeave?: () => void, throttle = 500) => {
  const debouncedMove = useThrottledCallback(onMove, throttle);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const elementRef = document?.querySelector(elementId);
    if (elementRef) {
      elementRef?.addEventListener('mousemove', debouncedMove);
      if (onLeave) {
        elementRef?.addEventListener('mouseleave', onLeave);
      }
    }
    return () => {
      elementRef?.removeEventListener('mousemove', debouncedMove);
      if (onLeave) {
        elementRef?.removeEventListener('mouseleave', onLeave);
      }
    };
  }, [debouncedMove, onLeave]);
};
