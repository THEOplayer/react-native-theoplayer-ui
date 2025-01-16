import React, { useContext, useEffect, useState } from 'react';
import { type LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { Slider } from '@miblanchard/react-native-slider';
import { useDuration } from '../hooks/useDuration';
import { useSeekable } from '../hooks/useSeekable';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useDebounce } from '../hooks/useDebounce';
import { SingleThumbnailView } from './thumbnail/SingleThumbnailView';

export interface SeekBarProps {
  /**
   * Optional style applied to the SeekBar.
   */
  style?: StyleProp<ViewStyle>;

  sliderContainerStyle?: ViewStyle;

  sliderMaximumTrackStyle?: ViewStyle;
}

/**
 * The delay in milliseconds before an actual seek is executed while scrubbing the SeekBar.
 */
const DEBOUNCE_SEEK_DELAY = 250;

export const SeekBar = (props: SeekBarProps) => {
  const player = useContext(PlayerContext).player;
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [sliderTime, setSliderTime] = useState(0);
  const [width, setWidth] = useState(0);
  const duration = useDuration();
  const seekable = useSeekable();
  const currentTime = useCurrentTime();

  useEffect(() => {
    // Set sliderTime based on currentTime changes
    if (!isScrubbing) {
      setSliderTime(currentTime);
    }
  }, [currentTime]);

  // Do not continuously seek while dragging the slider
  const debounceSeek = useDebounce((value: number) => {
    player.currentTime = value;
  }, DEBOUNCE_SEEK_DELAY);

  const onSlidingStart = (value: number[]) => {
    setSliderTime(value[0]);
    setIsScrubbing(true);
    debounceSeek(value[0]);
  };

  const onSlidingValueChange = (value: number[]) => {
    if (isScrubbing) {
      setSliderTime(value[0]);
      debounceSeek(value[0]);
    }
  };

  const onSlidingComplete = (value: number[]) => {
    setSliderTime(value[0]);
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
          onLayout={(event: LayoutChangeEvent) => {
            setWidth(event.nativeEvent.layout.width);
          }}>
          <Slider
            disabled={(!(duration > 0) && seekable.length > 0) || context.adInProgress}
            minimumValue={seekableStart}
            maximumValue={seekableEnd}
            containerStyle={props.sliderContainerStyle ?? { marginHorizontal: 8 }}
            maximumTrackStyle={props.sliderMaximumTrackStyle ?? {}}
            step={1000}
            renderAboveThumbComponent={(_index: number, value: number) => {
              return (
                isScrubbing && (
                  <SingleThumbnailView seekableStart={seekableStart} seekableEnd={seekableEnd} currentTime={value} seekBarWidth={width} />
                )
              );
            }}
            onSlidingStart={onSlidingStart}
            onValueChange={onSlidingValueChange}
            onSlidingComplete={onSlidingComplete}
            value={sliderTime}
            minimumTrackTintColor={context.style.colors.seekBarMinimum}
            maximumTrackTintColor={context.style.colors.seekBarMaximum}
            thumbTintColor={context.style.colors.seekBarDot}
          />
        </View>
      )}
    </PlayerContext.Consumer>
  );
};
