import React, { PropsWithChildren } from 'react';

/**
 * Native passthrough component - no touch event handling needed on native platforms.
 */
export const SeekBarTouchHandler = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};
