import React, { useEffect, useState } from 'react';
import { type ImageErrorEventData, type NativeSyntheticEvent, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { Image, View } from 'react-native';
import type { TextTrackCue } from 'react-native-theoplayer';
import { isThumbnailTrack, TextTrack } from 'react-native-theoplayer';
import { StaticTimeLabel } from '@theoplayer/react-native-ui';
import type { Thumbnail } from './Thumbnail';
import { isTileMapThumbnail } from './Thumbnail';
import { URL as URLPolyfill } from './Urlpolyfill';

const SPRITE_REGEX = /^([^#]*)#xywh=(\d+),(\d+),(\d+),(\d+)\s*$/;
const TAG = 'ThumbnailView';

export interface ThumbnailViewProps {
  /**
   * Thumbnail track. A valid thumbnail track should have properties:
   * <br/> - `'kind'` equals `'metadata'`.
   * <br/> - `'label'` equals `'thumbnails'`.
   */
  thumbnailTrack: TextTrack;

  /**
   * Current time.
   */
  time: number;

  /**
   * Stream duration
   */
  duration: number;

  /**
   * Whether to show a time label.
   *
   * @default false.
   */
  showTimeLabel?: boolean;

  /**
   * Used to set the width of the rendered thumbnail. The height will be calculated according to the image's aspect ratio.
   */
  size: number;

  /**
   * Optional style applied to the time label.
   */
  timeLabelStyle?: StyleProp<ViewStyle>;
}

export const DEFAULT_THUMBNAIL_VIEW_STYLE: ThumbnailStyle = {
  containerThumbnail: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  thumbnail: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
};

export interface ThumbnailStyle {
  containerThumbnail: ViewStyle;
  thumbnail: ViewStyle;
}

function getCueIndexAtTime(thumbnailTrack: TextTrack, time: number): number | undefined {
  // Ignore if it's an invalid track or not a thumbnail track.
  if (!isThumbnailTrack(thumbnailTrack)) {
    console.warn(TAG, 'Invalid thumbnail track');
    return undefined;
  }

  // Ignore if the track does not have cues
  if (thumbnailTrack.cues == null || thumbnailTrack.cues.length == 0) {
    return undefined;
  }

  const cues = thumbnailTrack.cues;
  let cueIndex = 0;
  for (const [index, cue] of cues.entries()) {
    if (cue.startTime <= time) {
      cueIndex = index;
    } else if (time >= cue.endTime) {
      return cueIndex;
    }
  }
  return cueIndex;
}

function resolveThumbnailUrl(thumbnailTrack: TextTrack, thumbnail: string): string {
  if (thumbnailTrack && thumbnailTrack.src) {
    return new URLPolyfill(thumbnail, thumbnailTrack.src).href;
  } else {
    return thumbnail;
  }
}

function getThumbnailImageForCue(thumbnailTrack: TextTrack, cue: TextTrackCue): Thumbnail | null {
  const thumbnailContent = cue && cue.content;
  if (!thumbnailContent) {
    // Cue does not contain any thumbnail info.
    return null;
  }
  const spriteMatch = thumbnailContent.match(SPRITE_REGEX);
  if (spriteMatch) {
    // The thumbnail is part of a tile.
    const [, url, x, y, w, h] = spriteMatch;
    return {
      tileX: +x,
      tileY: +y,
      tileWidth: +w,
      tileHeight: +h,
      url: resolveThumbnailUrl(thumbnailTrack, url),
    };
  } else {
    // The thumbnail is a separate image.
    return {
      url: resolveThumbnailUrl(thumbnailTrack, thumbnailContent),
    };
  }
}

/**
 * Calculate the dimensions of the thumbnail tile map based on the W3C Media Fragments URIs for all cues.
 *
 * @param thumbnailTrack
 */
function maxThumbnailSize(thumbnailTrack: TextTrack) {
  let maxWidth = 0,
    maxHeight = 0;
  thumbnailTrack.cues?.forEach((cue) => {
    if (cue && cue.content) {
      const spriteMatch = cue.content.match(SPRITE_REGEX);
      if (spriteMatch) {
        const [, , tileX, tileY, tileWidth, tileHeight] = spriteMatch;
        maxWidth = Math.max(maxWidth, +tileX + +tileWidth);
        maxHeight = Math.max(maxHeight, +tileY + +tileHeight);
      }
    }
  });
  return { maxTileWidth: maxWidth, maxTileHeight: maxHeight };
}

export const ThumbnailView = (props: ThumbnailViewProps) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [imageWidth, setImageWidth] = useState<number>(props.size);
  const [imageHeight, setImageHeight] = useState<number>(props.size);
  const [renderWidth, setRenderWidth] = useState<number>(1);
  const [renderHeight, setRenderHeight] = useState<number>(1);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  const onTileImageLoad = (thumbnail: Thumbnail) => () => {
    if (!mounted) {
      return;
    }
    const { size } = props;
    const { tileWidth, tileHeight } = thumbnail;
    if (tileWidth && tileHeight) {
      /**
       * On Android, Fresco can scale the React Native `<Image>` component internally if it is considered to be
       * 'huge' (larger than 2048px width). There is no way to know the original size without using another
       * image package.
       * This work-around calculates the maximum tile size based on all cue W3C Media Fragments URIs.
       *
       * {@link https://github.com/facebook/react-native/issues/22145}
       */
      const { maxTileWidth, maxTileHeight } =
        Platform.OS === 'android' ? maxThumbnailSize(props.thumbnailTrack) : { maxTileWidth: 0, maxTileHeight: 0 };

      Image.getSize(thumbnail.url, (width: number, height: number) => {
        setImageWidth(Math.max(width, maxTileWidth));
        setImageHeight(Math.max(height, maxTileHeight));
        setRenderWidth(size);
        setRenderHeight((tileHeight * size) / tileWidth);
      });
    }
  };

  const onImageLoadError = (event: NativeSyntheticEvent<ImageErrorEventData>) => {
    console.error(TAG, 'Failed to load thumbnail url:', event.nativeEvent.error);
  };

  const onImageLoad = (thumbnail: Thumbnail) => () => {
    if (!mounted) {
      return;
    }
    const { size } = props;
    Image.getSize(thumbnail.url, (width: number, height: number) => {
      setImageWidth(width);
      setImageHeight(height);
      setRenderWidth(size);
      setRenderHeight((height * size) / width);
    });
  };

  const renderThumbnail = (thumbnail: Thumbnail, index: number) => {
    const { size } = props;
    const scale = 1.0;

    if (isTileMapThumbnail(thumbnail)) {
      const ratio = thumbnail.tileWidth == 0 ? 0 : (scale * size) / thumbnail.tileWidth;
      return (
        <View
          key={index}
          style={[
            DEFAULT_THUMBNAIL_VIEW_STYLE.thumbnail,
            {
              width: scale * renderWidth,
              height: scale * renderHeight,
            },
          ]}>
          <Image
            resizeMode={'cover'}
            style={{
              position: 'absolute',
              top: -ratio * thumbnail.tileY,
              left: -ratio * thumbnail.tileX,
              width: ratio * imageWidth,
              height: ratio * imageHeight,
            }}
            source={{ uri: thumbnail.url }}
            onError={onImageLoadError}
            onLoad={onTileImageLoad(thumbnail)}
          />
        </View>
      );
    } else {
      return (
        <View
          key={index}
          style={[
            DEFAULT_THUMBNAIL_VIEW_STYLE.thumbnail,
            {
              width: scale * renderWidth,
              height: scale * renderHeight,
            },
          ]}>
          <Image
            resizeMode={'contain'}
            style={{ width: scale * size, height: scale * renderHeight }}
            source={{ uri: thumbnail.url }}
            onError={onImageLoadError}
            onLoad={onImageLoad(thumbnail)}
          />
        </View>
      );
    }
  };

  const { time, duration, thumbnailTrack, showTimeLabel, timeLabelStyle } = props;
  if (!thumbnailTrack || !thumbnailTrack.cues || thumbnailTrack.cues.length === 0) {
    // No thumbnails to render.
    return <></>;
  }

  const nowCueIndex = getCueIndexAtTime(thumbnailTrack, time);
  if (nowCueIndex === undefined) {
    // No thumbnail for current time
    return <></>;
  }

  const current = getThumbnailImageForCue(thumbnailTrack, thumbnailTrack.cues[nowCueIndex]);
  if (current === null) {
    // No thumbnail for current time
    return <></>;
  }
  return (
    <View style={{ flexDirection: 'column' }}>
      {showTimeLabel && (
        <StaticTimeLabel
          style={[
            {
              marginLeft: 20,
              height: 20,
              alignSelf: 'center',
            },
            timeLabelStyle,
          ]}
          time={time}
          duration={duration}
          showDuration={false}
        />
      )}
      <View style={[DEFAULT_THUMBNAIL_VIEW_STYLE.containerThumbnail, { height: renderHeight }]}>{renderThumbnail(current, 0)}</View>
    </View>
  );
};
