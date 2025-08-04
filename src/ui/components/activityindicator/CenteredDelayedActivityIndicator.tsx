import React, { useContext } from 'react';
import { ActivityIndicator, ActivityIndicatorProps, type StyleProp, View, type ViewStyle } from 'react-native';
import { PlayerContext } from '../util/PlayerContext';
import { FULLSCREEN_CENTER_STYLE } from '../uicontroller/UiContainer';
import { useDebouncedValue, useWaiting } from '../../hooks/barrel';

const DEFAULT_DELAY_MS = 200;

export interface DelayedActivityIndicatorProps extends ActivityIndicatorProps {
  /**
   * The style override for the container.
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * The additional delay before the ActivityIndicator is shown, in milliseconds.
   *
   * @default 200 milliseconds.
   */
  delay?: number;
}

/**
 * The default spinner for the `react-native-theoplayer` UI. It renders an ActivityIndicator when the player's playback is stalling due
 * readystate changes.
 */
export const CenteredDelayedActivityIndicator = (props: DelayedActivityIndicatorProps) => {
  const waiting = useWaiting();
  const context = useContext(PlayerContext);
  const showing = useDebouncedValue(waiting, props.delay ?? DEFAULT_DELAY_MS);

  return showing ? (
    <View style={[FULLSCREEN_CENTER_STYLE, props.containerStyle]}>
      <ActivityIndicator color={context.style.colors.icon} {...props} />
    </View>
  ) : (
    <></>
  );
};
