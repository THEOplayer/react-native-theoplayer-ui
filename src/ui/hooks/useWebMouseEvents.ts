import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Listens to mouse events on Web.
 */
export const useWebMouseEvents = (elementId: string, onInteraction: () => void, onLeave?: () => void) => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const elementRef = document?.querySelector(elementId);
    if (elementRef) {
      elementRef?.addEventListener('mousemove', onInteraction);
      elementRef?.addEventListener('click', onInteraction);
      if (onLeave) {
        elementRef?.addEventListener('mouseleave', onLeave);
      }
    }
    return () => {
      elementRef?.removeEventListener('mousemove', onInteraction);
      elementRef?.removeEventListener('click', onInteraction);
      if (onLeave) {
        elementRef?.removeEventListener('mouseleave', onLeave);
      }
    };
  }, [onInteraction, onLeave, elementId]);
};
