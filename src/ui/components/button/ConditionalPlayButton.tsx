import React from 'react';
import { PlayButton, PlayButtonProps } from './PlayButton';
import { useWaiting } from '../../hooks/useWaiting';

/**
 * A conditional play/pause button for the `react-native-theoplayer` UI, which hides itself while the player is
 * not ready.
 */
export function ConditionalPlayButton(props: PlayButtonProps) {
  const waiting = useWaiting();
  return waiting ? <></> : <PlayButton {...props} />;
}
