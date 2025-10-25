import { StyleProp, Text, TextStyle } from 'react-native';
import React, { useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { isAtLive, isLiveDuration } from '../util/LiveUtils';
import type { TimeRange } from 'react-native-theoplayer';

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

  // Live streams report an Infinity duration.
  if (showDuration && isLiveDuration(duration)) {
    if (isAtLive(duration, time, seekable)) {
      return <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{context.locale.liveLabel}</Text>;
    }

    const seekableEnd = seekable && seekable.length > 0 ? seekable[seekable.length - 1].end : 0;
    const delayFromLive = seekableEnd - time;
    let delayLabel = new Date(delayFromLive).toISOString().substring(11, 19);
    if (delayLabel.startsWith('00:')) {
      // Don't render hours if not needed.
      delayLabel = delayLabel.slice(3);
    }
    return <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{`-${delayLabel}`}</Text>;
  }

  try {
    let currentTimeLabel = new Date(time).toISOString().substring(11, 19);
    let durationLabel = new Date(duration ?? 0).toISOString().substring(11, 19);
    if (durationLabel.startsWith('00:')) {
      // Don't render hours if not needed.
      currentTimeLabel = currentTimeLabel.slice(3);
      durationLabel = durationLabel.slice(3);
    }
    const label = showDuration ? `${currentTimeLabel} / ${durationLabel}` : currentTimeLabel;
    return <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{label}</Text>;
  } catch {
    return <></>;
  }
}

function isValidDuration(duration: number | undefined): boolean {
  return duration !== undefined && !isNaN(duration) && duration > 0;
}
