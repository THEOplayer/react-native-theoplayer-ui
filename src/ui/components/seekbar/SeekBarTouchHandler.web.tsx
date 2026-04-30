import React, { PropsWithChildren, useCallback } from 'react';
import { GestureResponderEvent, View } from 'react-native';

/**
 * Web-specific wrapper that calls preventDefault on touchstart and touchend events.
 * This prevents iOS Safari from firing synthetic mouse events after touch events,
 * which would cause the slider to snap back to its original position during scrubbing.
 */
export const SeekBarTouchHandler = ({ children }: PropsWithChildren) => {
  const onTouchEvent = useCallback((e: GestureResponderEvent) => {
    e.preventDefault();
  }, []);

  return (
    <View onTouchStart={onTouchEvent} onTouchEnd={onTouchEvent}>
      {children}
    </View>
  );
};
