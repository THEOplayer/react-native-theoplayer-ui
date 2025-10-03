import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Listens to pointer events on Web.
 */
export const usePointerMove = (elementId: string, onMove: () => void, onLeave?: () => void) => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const elementRef = document?.querySelector(elementId);
    if (elementRef) {
      /**
       * Listening to `mousemove` events instead of `pointermove`, which requires the page to be "activated" through
       * a tap/click first.
       */
      elementRef?.addEventListener('mousemove', onMove);
      if (onLeave) {
        elementRef?.addEventListener('mouseleave', onLeave);
      }
    }
    return () => {
      elementRef?.removeEventListener('mousemove', onMove);
      if (onLeave) {
        elementRef?.removeEventListener('mouseleave', onLeave);
      }
    };
  }, [onMove, onLeave, elementId]);
};
