import React, { useCallback, useContext, useState } from 'react';
import { type LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { PlayerContext } from '../util/PlayerContext';
import { Slider } from '@miblanchard/react-native-slider';
import { useChaptersTrack, useDuration, useSeekable, useDebounce } from '../../hooks/barrel';
import { SingleThumbnailView } from './thumbnail/SingleThumbnailView';
import { useSlider } from './useSlider';
import { TestIDs } from '../../utils/TestIDs';
import { PlayerEventType, SeekedEvent } from 'react-native-theoplayer';
import type { THEOplayer } from 'react-native-theoplayer';
import { fuzzyEquals } from '../../utils/NumberUtils';

export type ThumbDimensions = {
  height: number;
  width: number;
};

const SEEKED_TOLERANCE = 1e3
const WAIT_FOR_SEEKED_TIMEOUT = 8e3

export const waitForSeeked = (player: THEOplayer, target: number): Promise<number> => {
  return new Promise<number>((resolve,reject) => {
      if (!player) {
        reject(new Error('Player not instantiated yet'))
      }
      const onSeeked = (event: SeekedEvent) => {
        if (!fuzzyEquals(event.currentTime, target, SEEKED_TOLERANCE)) {
          return
        }
        player.removeEventListener(PlayerEventType.SEEKED, onSeeked)
        resolve(event.currentTime)
      }
      player.addEventListener(PlayerEventType.SEEKED, onSeeked);
      setTimeout(() => {
        player.removeEventListener(PlayerEventType.SEEKED, onSeeked)
      }, WAIT_FOR_SEEKED_TIMEOUT)
  })
}

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
  onScrubbing?: (scrubberTime: number | undefined) => void;
  /**
   * Optional override the component that is rendered above the thumbnail.
   */
  renderAboveThumbComponent?: (isScrubbing: boolean, scrubberTime: number | undefined, seekBarWidth: number) => React.ReactNode;
  /**
   * Optional style applied to the thumb of the slider.
   */
  thumbStyle?: StyleProp<ViewStyle>;
  /**
   * Expose thumbTouchSize prop to allow custom thumb touch size.
   */
  thumbTouchSize?: ThumbDimensions;
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

const renderThumbnailView = (isScrubbing: boolean, scrubberTime: number | undefined, seekBarWidth: number): React.ReactNode => {
  return isScrubbing && scrubberTime !== undefined && <SingleThumbnailView currentTime={scrubberTime} seekBarWidth={seekBarWidth} />;
};

export const SeekBar = (props: SeekBarProps) => {
  const { onScrubbing, renderAboveThumbComponent: customRenderAboveThumbComponent } = props;
  const { player, style: theme, adInProgress } = useContext(PlayerContext);
  const [width, setWidth] = useState(0);
  const [seekTarget, setSeekTarget] = useState(0)
  const duration = useDuration();
  const seekable = useSeekable();
  const [sliderTime, isScrubbing, setIsScrubbing] = useSlider();
  const chapters = useChaptersTrack();
  const chapterMarkerTimes: number[] = chapters?.cues?.map((cue) => cue.endTime).slice(0, -1) ?? [];
  // Do not continuously seek while dragging the slider
  const debounceSeek = useDebounce((value: number) => {
    player.currentTime = value;
  }, DEBOUNCE_SEEK_DELAY);

  const onSlidingStart = useCallback((value: number[]) => {
    setIsScrubbing(true);
    debounceSeek(value[0]);
  },[player, setIsScrubbing]);

  const onSlidingValueChange = useCallback((value: number[]) => {
    if (isScrubbing) {
      if (onScrubbing) onScrubbing(value[0]);
      debounceSeek(value[0]);
    }
  },[player,isScrubbing]);

  const onSlidingComplete = useCallback((value: number[]) => {
    setSeekTarget(value[0])
      waitForSeeked(player, value[0])
      .then( (seekedTo) => {
        if (!fuzzyEquals(seekedTo, seekTarget, SEEKED_TOLERANCE)) {
          return
        }
        setIsScrubbing(false)
      }).catch(
        //do nothing
      )
    debounceSeek(value[0], true);
  },[player]);

  const normalizedDuration = normalizedTime(duration);
  const seekableRange = {
    start: seekable.length > 0 ? seekable[0].start : 0,
    end: seekable.length > 0 ? seekable[seekable.length - 1].end : normalizedDuration,
  };

  const renderAboveThumbComponent = (_index: number, value: number) => {
    if (customRenderAboveThumbComponent) {
      return customRenderAboveThumbComponent(isScrubbing, value, width);
    }
    return renderThumbnailView(isScrubbing, value, width);
  };

  /**
   * Disable the seekbar:
   * - while playing an ad;
   * - if duration === 0;
   * - if seekable length === 0;
   *
   * Do not disable seekbar for live content.
   */
  const isLive = duration === Infinity;
  const disabled = (!(normalizedDuration > 0 || isLive) && seekable.length > 0) || adInProgress;

  return (
    <View
      style={[props.style ?? { flex: 1 }]}
      testID={props.testID ?? TestIDs.SEEK_BAR}
      onLayout={(event: LayoutChangeEvent) => {
        setWidth(event.nativeEvent.layout.width);
      }}>
      <Slider
        disabled={disabled}
        minimumValue={normalizedTime(seekableRange.start)}
        maximumValue={normalizedTime(seekableRange.end)}
        containerStyle={props.sliderContainerStyle ?? { marginHorizontal: 8 }}
        minimumTrackStyle={props.sliderMinimumTrackStyle ?? {}}
        maximumTrackStyle={props.sliderMaximumTrackStyle ?? {}}
        step={1000}
        renderAboveThumbComponent={renderAboveThumbComponent}
        onSlidingStart={onSlidingStart}
        onValueChange={onSlidingValueChange}
        onSlidingComplete={onSlidingComplete}
        value={sliderTime}
        minimumTrackTintColor={theme.colors.seekBarMinimum}
        maximumTrackTintColor={theme.colors.seekBarMaximum}
        thumbTintColor={theme.colors.seekBarDot}
        thumbStyle={StyleSheet.flatten(props.thumbStyle)}
        thumbTouchSize={props.thumbTouchSize}
        renderTrackMarkComponent={chapterMarkerTimes.length ? props.chapterMarkers : undefined}
        trackMarks={chapterMarkerTimes}
      />
    </View>
  );
};

function normalizedTime(time: number): number {
  return isNaN(time) || !isFinite(time) ? 0 : Math.max(0, time);
}
