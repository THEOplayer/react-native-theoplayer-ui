import { Dimensions, View } from 'react-native';
import { PlayerContext } from '../../util/PlayerContext';
import { ThumbnailView } from './ThumbnailView';
import React, { useContext, useMemo } from 'react';
import { useThumbnailTrack } from '../../hooks/useThumbnailTrack';

export interface ThumbnailViewProps {
  seekableStart: number;
  seekableEnd: number;
  currentTime: number;
  seekBarWidth: number;
}

export function SingleThumbnailView(props: ThumbnailViewProps) {
  const player = useContext(PlayerContext).player;
  const thumbnailTrack = useThumbnailTrack();

  if (!thumbnailTrack) {
    return <></>;
  }
  const thumbnailSize = useMemo(() => {
    const window = Dimensions.get('window');
    return 0.35 * Math.min(window.height, window.width);
  }, []);

  const { seekableStart, seekableEnd, currentTime, seekBarWidth } = props;

  // Do not let the thumbnail pass left & right borders.
  const seekableRange = seekableEnd - seekableStart;
  const offset = seekableRange ? (seekBarWidth * (currentTime - seekableStart)) / seekableRange : 0;
  let left = -0.5 * thumbnailSize;
  if (offset < 0.5 * thumbnailSize) {
    left = -offset;
  } else if (offset > seekBarWidth - 0.5 * thumbnailSize) {
    left = -offset + seekBarWidth - thumbnailSize;
  }

  return (
    <View style={{ left, marginHorizontal: 8 }}>
      <ThumbnailView thumbnailTrack={thumbnailTrack} duration={player.duration} time={currentTime} size={thumbnailSize} showTimeLabel={false} />
    </View>
  );
}
