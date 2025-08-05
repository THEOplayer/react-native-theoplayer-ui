import { Dimensions, View } from 'react-native';
import { PlayerContext } from '../../util/PlayerContext';
import { ThumbnailView } from './ThumbnailView';
import React, { useContext, useMemo } from 'react';
import { useThumbnailTrack } from '../../../hooks/useThumbnailTrack';
import { useSeekable } from '../../../hooks/useSeekable';
import { useDuration } from '../../../hooks/useDuration';

export interface ThumbnailViewProps {
  /**
   * The current scrubber time.
   */
  currentTime: number;

  /**
   * The width of the seekbar.
   */
  seekBarWidth: number;

  /**
   * The size of the thumbnail image, expressed as a percentage of the smaller screen dimension (width or height).
   *
   * @default 0.35 (35%).
   */
  thumbSize?: number;
}

/**
 * Component for displaying a single preview thumbnail image, sourced from a metadata track containing thumbnail data.
 */
export function SingleThumbnailView(props: ThumbnailViewProps) {
  const player = useContext(PlayerContext).player;
  const thumbnailTrack = useThumbnailTrack();
  const thumbnailSize = useMemo(() => {
    const window = Dimensions.get('window');
    return 0.35 * Math.min(window.height, window.width);
  }, []);
  const seekable = useSeekable();
  const duration = useDuration();

  if (!thumbnailTrack) {
    return <></>;
  }

  const { currentTime, seekBarWidth } = props;
  const marginHorizontal = 8;
  const normalizedDuration = isNaN(duration) || !isFinite(duration) ? 0 : Math.max(0, duration);
  const seekableRange = {
    start: seekable.length > 0 ? seekable[0].start : 0,
    end: seekable.length > 0 ? seekable[seekable.length - 1].end : normalizedDuration,
  };

  // Do not let the thumbnail pass left & right borders.
  const range = seekableRange.end - seekableRange.start;
  const offset = range ? (seekBarWidth * (currentTime - seekableRange.start)) / range : 0;
  let left = -0.5 * thumbnailSize;
  if (offset + marginHorizontal < 0.5 * thumbnailSize) {
    left = -offset - marginHorizontal;
  } else if (offset - marginHorizontal > seekBarWidth - 0.5 * thumbnailSize) {
    left = -offset + marginHorizontal + seekBarWidth - thumbnailSize;
  }

  return (
    <View style={{ left, marginHorizontal }}>
      <ThumbnailView thumbnailTrack={thumbnailTrack} duration={player.duration} time={currentTime} size={thumbnailSize} showTimeLabel={false} />
    </View>
  );
}
