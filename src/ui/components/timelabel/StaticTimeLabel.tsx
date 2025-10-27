import { StyleProp, Text, TextStyle } from 'react-native';
import React, { useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { isAtLive, isLiveDuration } from '../util/LiveUtils';
import type { TimeRange } from 'react-native-theoplayer';
import { formatTime } from '../util/TimeUtils';

export interface StaticTimeLabelProps {
  /**
   * Whether to show the duration of the current source.
   */
  showDuration: boolean;
  /**
   * The style overrides.
   */
  style?: StyleProp<TextStyle>;
  /**
   * The current time of the player
   */
  time: number;
  /**
   * The duration of the current source.
   */
  duration?: number;
  /**
   * The seekable window of the player
   */
  seekable?: TimeRange[];
}

/**
 * A static time label for the `react-native-theoplayer` UI.
 */
export function StaticTimeLabel(props: StaticTimeLabelProps) {
  const { style, showDuration, time, duration, seekable } = props;
  const context = useContext(PlayerContext);

  // An invalid duration
  if (showDuration && !isValidDuration(duration)) {
    return <></>;
  }

  const isLive = isLiveDuration(duration);
  const atLive = isAtLive(duration, time, seekable);
  if (isLive && atLive) {
    return <></>;
  }

  const endTime = duration && isFinite(duration) ? duration : seekable && seekable.length > 0 ? seekable[seekable.length - 1].end : NaN;
  let timeOnLabel = time;
  if (isLive) {
    timeOnLabel = -((endTime || 0) - time);
  }
  let text: string;
  if (showDuration && !isLive) {
    text = `${formatTime(timeOnLabel, endTime, isLive)} / ${formatTime(endTime)}`;
  } else {
    text = formatTime(timeOnLabel, endTime, isLive);
  }

  return <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{`${text}`}</Text>;
}

function isValidDuration(duration: number | undefined): boolean {
  return duration !== undefined && !isNaN(duration) && duration > 0;
}
