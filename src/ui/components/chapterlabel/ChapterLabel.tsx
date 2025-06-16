import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native'
import React from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { useChaptersTrack } from '../../hooks/useChaptersTrack';
import { useCurrentTime } from '../../hooks/useCurrentTime';

export interface ChapterLabelProps {
  /**
   * The style overrides.
   */
  style?: StyleProp<TextStyle>;
  /**
   * The playhead position to which the user might seek. Use this property to pass slider values before the actual (debounced) seek happens.
   */
  scrubTime?: number

}

export interface ChapterLabelState {
  currentTime: number;
}

/**
 * The default style for the time label.
 */
export const DEFAULT_CHAPTER_LABEL_STYLE: TextStyle = {
  marginLeft: 10,
  marginRight: 10,
  height: 20,
  alignSelf: 'center',
};

/**
 * The default time label component for the `react-native-theoplayer` UI.
 */


export const ChapterLabel = (props: ChapterLabelProps) => {
    const { style, scrubTime } = props;
    const currentTime = useCurrentTime();
    const chapters = useChaptersTrack()
    const expectedSeekTarget = scrubTime || currentTime
    const currentChapter = chapters?.cues?.find(cue => (cue.startTime <= expectedSeekTarget && cue.endTime > expectedSeekTarget))
    const label = currentChapter?.content
    return (
        <PlayerContext.Consumer>
            {(context: UiContext) => <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{label}</Text>}
        </PlayerContext.Consumer>
        );
}
