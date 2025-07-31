import React, { useContext } from 'react';
import { ActivityIndicator, ActivityIndicatorProps, type StyleProp, View, type ViewStyle } from 'react-native';
import { PlayerContext } from '../util/PlayerContext';
import { FULLSCREEN_CENTER_STYLE } from '../uicontroller/UiContainer';
import { useWaiting, WAITING_DEFAULT_DELAY_MS } from '../../hooks/useWaiting';

export interface DelayedActivityIndicatorProps extends ActivityIndicatorProps {
  containerStyle?: StyleProp<ViewStyle>;

  delay?: number;
}

/**
 * The default spinner for the `react-native-theoplayer` UI. It renders an ActivityIndicator when the player's playback is stalling due
 * readystate changes.
 */
export const CenteredDelayedActivityIndicator = (props: DelayedActivityIndicatorProps) => {
  const waiting = useWaiting(props.delay ?? WAITING_DEFAULT_DELAY_MS);
  const context = useContext(PlayerContext);

  return waiting ? (
    <View style={[FULLSCREEN_CENTER_STYLE, props.containerStyle]}>
      <ActivityIndicator color={context.style.colors.icon} {...props} />
    </View>
  ) : (
    <></>
  );
};
