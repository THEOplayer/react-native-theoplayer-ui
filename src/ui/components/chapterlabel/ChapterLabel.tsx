import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native';
import React, { useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { useChaptersTrack } from '../../hooks/useChaptersTrack';
import { useCurrentTime } from '../../hooks/useCurrentTime';

export interface ChapterLabelProps {
  /**
   * The style overrides.
   */
  style?: StyleProp<TextStyle>;
}

/**
 * The default chapter label component for the `react-native-theoplayer` UI.
 */
export const ChapterLabel = (props: ChapterLabelProps) => {
  const { scrubberState, style: uiStyle } = useContext(PlayerContext);
  const currentTime = useCurrentTime();
  const chapters = useChaptersTrack();
  const { style } = props;
  const expectedSeekTarget = scrubberState.currentTime || currentTime;
  const currentChapter = chapters?.cues?.find((cue) => cue.startTime <= expectedSeekTarget && cue.endTime > expectedSeekTarget);
  const label = currentChapter?.content;
  if (!label) {
    return <></>;
  }
  return <Text style={[uiStyle.text, { color: uiStyle.colors.text }, style]}>{label}</Text>;
};
