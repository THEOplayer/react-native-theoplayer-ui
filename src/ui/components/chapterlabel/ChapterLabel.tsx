import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native'
import React, { useCallback, useContext, useState } from 'react';
import { PlayerEventType, TimeUpdateEvent } from 'react-native-theoplayer';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { useChaptersTrack } from '../../hooks/useChaptersTrack';
import { usePlayerEvent } from '../../hooks/usePlayerEvent';

export interface ChapterLabelProps {
  /**
   * Whether to fade out after a seek.
   */
  fadeOut: boolean;
  /**
   * The style overrides.
   */
  style?: StyleProp<TextStyle>;
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
    const player = useContext(PlayerContext).player;
    const [currentTime, setCurrentTime] = useState(0);
    const chapters = useChaptersTrack()
    const onTimeUpdate = useCallback(
        (event?: TimeUpdateEvent) => {
            if (!event) return;
            const { currentTime } = event
            setCurrentTime(currentTime);
        },
        [],
    );  
    usePlayerEvent(player, PlayerEventType.TIME_UPDATE, onTimeUpdate, [onTimeUpdate]);  
    const currentChapter = chapters?.cues?.find(cue => (cue.startTime <= currentTime && cue.endTime > currentTime))
    const label = currentChapter?.content
    const { style } = props;
    return (
        <PlayerContext.Consumer>
            {(context: UiContext) => <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{label}</Text>}
        </PlayerContext.Consumer>
        );
}
