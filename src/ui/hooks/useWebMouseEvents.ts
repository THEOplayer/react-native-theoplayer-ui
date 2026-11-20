import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Listens to mouse events on Web.
 *
 * @param hoverOnly only report mouse movement, not clicks or touch-generated mouse events, as interactions.
 */
export const useWebMouseEvents = (elementId: string, onInteraction: () => void, onLeave?: () => void, hoverOnly: boolean = false) => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const elementRef = document?.querySelector(elementId);
    const onMouseMove = (event: Event) => {
      if ((event as PointerEvent).pointerType === 'mouse') {
        onInteraction();
      }
    };
    const interactionListeners: [string, (event: Event) => void][] = hoverOnly
      ? [['pointermove', onMouseMove]]
      : [
          ['mousemove', onInteraction],
          ['click', onInteraction],
        ];
    if (elementRef) {
      interactionListeners.forEach(([type, listener]) => elementRef.addEventListener(type, listener));
      if (onLeave) {
        elementRef?.addEventListener('mouseleave', onLeave);
      }
    }
    return () => {
      interactionListeners.forEach(([type, listener]) => elementRef?.removeEventListener(type, listener));
      if (onLeave) {
        elementRef?.removeEventListener('mouseleave', onLeave);
      }
    };
  }, [onInteraction, onLeave, elementId, hoverOnly]);
};
