import type { StyleProp, TextStyle } from 'react-native';
import React from 'react';
import { StaticTimeLabel } from './StaticTimeLabel';
import { useCurrentTime, useDuration } from '../../hooks/barrel';

export interface TimeLabelProps {
  /**
   * Whether to show the duration of the player.
   */
  showDuration: boolean;
  /**
   * The style overrides.
   */
  style?: StyleProp<TextStyle>;

  /**
   * The playhead position to which the user might seek. Use this property to pass slider values before the actual (debounced) seek happens.
   */
  scrubTime?: number;
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
  const { showDuration, style, scrubTime } = props;
  const expectedSeekTarget = scrubTime || currentTime
  return <StaticTimeLabel showDuration={showDuration} time={expectedSeekTarget} duration={duration} style={[DEFAULT_TIME_LABEL_STYLE, style]} />;
};
