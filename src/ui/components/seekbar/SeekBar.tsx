import React, { useContext, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import Slider from '@react-native-community/slider';
import { SingleThumbnailView } from './thumbnail/SingleThumbnailView';
import { useDuration } from '../hooks/useDuration';
import { useSeekable } from '../hooks/useSeekable';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useDebounce } from '../hooks/useDebounce';

export interface SeekBarProps {
  /**
   * Optional style applied to the SeekBar.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * The delay in milliseconds before an actual seek is executed while scrubbing the SeekBar.
 */
const DEBOUNCE_SEEK_DELAY = 250;

export const SeekBar = ({ style }: SeekBarProps) => {
  const player = useContext(PlayerContext).player;
  const [isSeeking, setIsSeeking] = useState(false);
  const [sliderTime, setSliderTime] = useState(0);
  const [pausedDueToScrubbing, setPausedDueToScrubbing] = useState(false);
  const [width, setWidth] = useState(0);

  const duration = useDuration();
  const seekable = useSeekable();
  const currentTime = useCurrentTime();

  useEffect(() => {
    // Set sliderTime based on currentTime changes
    setSliderTime(currentTime);
  }, [currentTime]);

  // Do not continuously seek while dragging the slider
  const debounceSeek = useDebounce((value: number) => {
    player.currentTime = value;
  }, DEBOUNCE_SEEK_DELAY);

  const onSlidingStart = (value: number) => {
    setSliderTime(value);
    setIsSeeking(true);
    if (!player.paused) {
      debounceSeek(value);
      player.pause();
      setPausedDueToScrubbing(true);
    }
  };

  const onValueChange = (value: number) => {
    setSliderTime(value);
    if (isSeeking) {
      debounceSeek(value);
    }
  };

  const onSlidingComplete = (value: number) => {
    setSliderTime(value);
    debounceSeek(value, true);
    const isEnded = player.currentTime === player.duration;
    if (pausedDueToScrubbing && !isEnded) {
      player.play();
      setPausedDueToScrubbing(false);
    }
    setIsSeeking(false);
  };

  const normalizedDuration = isNaN(duration) || !isFinite(duration) ? 0 : duration;
  const seekableStart = seekable.length > 0 ? seekable[0].start : 0;
  const seekableEnd = seekable.length > 0 ? seekable[0].end : normalizedDuration;

  return (
    <PlayerContext.Consumer>
      {(context: UiContext) => (
        <View
          style={[style ?? { flex: 1 }]}
          onLayout={(event: LayoutChangeEvent) => {
            setWidth(event.nativeEvent.layout.width);
          }}>
          {isSeeking && <SingleThumbnailView seekableStart={seekableStart} seekableEnd={seekableEnd} currentTime={sliderTime} seekBarWidth={width} />}
          <Slider
            disabled={(!(duration > 0) && seekable.length > 0) || context.adInProgress}
            style={[StyleSheet.absoluteFill, style]}
            minimumValue={seekableStart}
            maximumValue={seekableEnd}
            step={1000}
            onSlidingStart={onSlidingStart}
            onValueChange={onValueChange}
            onSlidingComplete={onSlidingComplete}
            value={sliderTime}
            focusable={true}
            minimumTrackTintColor={context.style.colors.seekBarMinimum}
            maximumTrackTintColor={context.style.colors.seekBarMaximum}
            thumbTintColor={context.style.colors.seekBarDot}
          />
        </View>
      )}
    </PlayerContext.Consumer>
  );
};
