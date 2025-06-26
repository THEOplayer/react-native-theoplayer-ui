import React, { useContext, useState } from 'react';
import { type LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { Slider } from '@miblanchard/react-native-slider';
import { useDuration } from '../../hooks/useDuration';
import { useSeekable } from '../../hooks/useSeekable';
import { useDebounce } from '../../hooks/useDebounce';
import { SingleThumbnailView } from './thumbnail/SingleThumbnailView';
import { useSliderTime } from './useSliderTime';
import { TestIDs } from '../../utils/TestIDs';
import { useChaptersTrack } from '../../hooks/useChaptersTrack';

export interface SeekBarProps {
  /**
   * Optional style applied to the SeekBar.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Optional style applied to the SeekBar container.
   */
  sliderContainerStyle?: ViewStyle;
  /**
   * Optional style applied to the track left of the thumb.
   */
  sliderMinimumTrackStyle?: ViewStyle;
  /**
   * Optional style applied to the track right of the thumb.
   */
  sliderMaximumTrackStyle?: ViewStyle;
  /**
   * Optional
   */
  chapterMarkers?: (index?: number) => React.ReactNode;
  /** 
  * Callback for slider value updates. The provided callback will not be debounced.
  */
  onScrubbing?: (scrubTime: number | undefined) => void
  /**
   * Optional style applied to the thumb of the slider.
   */
  thumbStyle?: StyleProp<ViewStyle>;
  /**
   * An id used to locate this view in end-to-end tests.
   *
   * @default 'seek-bar'
   */
  testID?: string;
}

/**
 * The delay in milliseconds before an actual seek is executed while scrubbing the SeekBar.
 */
const DEBOUNCE_SEEK_DELAY = 250;

export const SeekBar = (props: SeekBarProps) => {
  const { onScrubbing } = props
  const { player } = useContext(PlayerContext);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubberTime, setScrubberTime] = useState<number | undefined>(undefined);
  const [width, setWidth] = useState(0);
  const duration = useDuration();
  const seekable = useSeekable();
  const sliderTime = useSliderTime();
  const chapters = useChaptersTrack();
  const chapterMarkerTimes: number[] = chapters?.cues?.map((cue) => cue.endTime).slice(0, -1) ?? [];
  // Do not continuously seek while dragging the slider
  const debounceSeek = useDebounce((value: number) => {
    player.currentTime = value;
  }, DEBOUNCE_SEEK_DELAY);

  const onSlidingStart = (value: number[]) => {
    setIsScrubbing(true);
    debounceSeek(value[0]);
  };

  const onSlidingValueChange = (value: number[]) => {
    if (isScrubbing) {
      if (onScrubbing) onScrubbing(value[0])
      setScrubberTime(value[0]);
      debounceSeek(value[0]);
    }
  };

  const onSlidingComplete = (value: number[]) => {
    setScrubberTime(undefined);
    if (onScrubbing) onScrubbing(undefined)
    setIsScrubbing(false);
    debounceSeek(value[0], true);
  };

  const normalizedDuration = isNaN(duration) || !isFinite(duration) ? 0 : Math.max(0, duration);
  const seekableStart = seekable.length > 0 ? seekable[0].start : 0;
  const seekableEnd = seekable.length > 0 ? seekable[0].end : normalizedDuration;

  return (
    <PlayerContext.Consumer>
      {(context: UiContext) => (
        <View
          style={[props.style ?? { flex: 1 }]}
          testID={props.testID ?? TestIDs.SEEK_BAR}
          onLayout={(event: LayoutChangeEvent) => {
            setWidth(event.nativeEvent.layout.width);
          }}>
          <Slider
            disabled={(!(duration > 0) && seekable.length > 0) || context.adInProgress}
            minimumValue={seekableStart}
            maximumValue={seekableEnd}
            containerStyle={props.sliderContainerStyle ?? { marginHorizontal: 8 }}
            minimumTrackStyle={props.sliderMinimumTrackStyle ?? {}}
            maximumTrackStyle={props.sliderMaximumTrackStyle ?? {}}
            step={1000}
            renderAboveThumbComponent={(_index: number, value: number) => {
              return (
                isScrubbing &&
                scrubberTime !== undefined && (
                  <SingleThumbnailView seekableStart={seekableStart} seekableEnd={seekableEnd} currentTime={value} seekBarWidth={width} />
                )
              );
            }}
            onSlidingStart={onSlidingStart}
            onValueChange={onSlidingValueChange}
            onSlidingComplete={onSlidingComplete}
            value={isScrubbing && scrubberTime !== undefined ? scrubberTime : sliderTime}
            minimumTrackTintColor={context.style.colors.seekBarMinimum}
            maximumTrackTintColor={context.style.colors.seekBarMaximum}
            thumbTintColor={context.style.colors.seekBarDot}
            thumbStyle={StyleSheet.flatten(props.thumbStyle)}
            renderTrackMarkComponent={chapterMarkerTimes.length ? props.chapterMarkers : undefined}
            trackMarks={chapterMarkerTimes}
          />
        </View>
      )}
    </PlayerContext.Consumer>
  );
};
