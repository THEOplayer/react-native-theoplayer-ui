import type { StyleProp, TextStyle } from 'react-native';
import React from 'react';
import { StaticTimeLabel } from './StaticTimeLabel';
import { useCurrentTime, useDuration, useSeekable } from '../../hooks/barrel';

export interface TimeLabelProps {
  /**
   * Whether to show the duration of the player.
   */
  showDuration: boolean;
  /**
   * The style overrides.
   */
  style?: StyleProp<TextStyle>;
}

/**
 * The default style for the time label.
 */
export const DEFAULT_TIME_LABEL_STYLE: TextStyle = {
  marginLeft: 10,
  marginRight: 10,
  height: 20,
  alignSelf: 'center',
};

/**
 * The default time label component for the `react-native-theoplayer` UI.
 */
export const TimeLabel = (props: TimeLabelProps) => {
  const currentTime = useCurrentTime();
  const duration = useDuration();
  const seekable = useSeekable();
  const { showDuration, style } = props;
  return (
    <StaticTimeLabel
      showDuration={showDuration}
      time={currentTime}
      duration={duration}
      seekable={seekable}
      style={[DEFAULT_TIME_LABEL_STYLE, style]}
    />
  );
};
