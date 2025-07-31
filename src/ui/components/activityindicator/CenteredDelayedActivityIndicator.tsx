import React, { useContext } from 'react';
import { DelayedActivityIndicator, type DelayedActivityIndicatorProps } from './DelayedActivityIndicator';
import { View } from 'react-native';
import { PlayerContext } from '../util/PlayerContext';
import { FULLSCREEN_CENTER_STYLE } from '../uicontroller/UiContainer';
import { useWaiting } from '../../hooks/useWaiting';

/**
 * The default spinner for the `react-native-theoplayer` UI. It renders an ActivityIndicator when the player's playback is stalling due
 * readystate changes.
 */
export const CenteredDelayedActivityIndicator = (props: DelayedActivityIndicatorProps) => {
  const waiting = useWaiting();
  const context = useContext(PlayerContext);

  return waiting ? (
    <View style={FULLSCREEN_CENTER_STYLE}>
      <DelayedActivityIndicator color={context.style.colors.icon} {...props} />
    </View>
  ) : (
    <></>
  );
};
