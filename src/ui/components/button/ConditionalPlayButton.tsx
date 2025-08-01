import React from 'react';
import { PlayButton, PlayButtonProps } from './PlayButton';
import { useDebouncedValue, useWaiting } from '../../hooks/barrel';

const DEFAULT_DELAY_MS = 200;

export interface ConditionalPlayButtonProps extends PlayButtonProps {
  /**
   * The additional delay before the button is hidden when the player is waiting, in milliseconds.
   *
   * @default 200 milliseconds.
   */
  delay?: number;
}

/**
 * A conditional play/pause button for the `react-native-theoplayer` UI, which hides itself while the player is
 * not ready.
 */
export function ConditionalPlayButton(props: ConditionalPlayButtonProps) {
  const waiting = useWaiting();
  const hiding = useDebouncedValue(waiting, props.delay ?? DEFAULT_DELAY_MS);
  return hiding ? <></> : <PlayButton {...props} />;
}
