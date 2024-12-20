import { useContext, useEffect, useState } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { PlayerEventType, type TimeRange, ProgressEvent } from 'react-native-theoplayer';

/**
 * Returns {@link react-native-theoplayer!THEOplayer.seekable | the player's seekable range}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useSeekable = () => {
  const player = useContext(PlayerContext).player;
  const [seekable, setSeekable] = useState<TimeRange[]>([]);
  useEffect(() => {
    const onUpdateSeekable = (event: ProgressEvent) => {
      setSeekable(event.seekable ?? player?.seekable ?? []);
    };
    player?.addEventListener(PlayerEventType.PROGRESS, onUpdateSeekable);
    return () => {
      player?.removeEventListener(PlayerEventType.PROGRESS, onUpdateSeekable);
    };
  }, [player]);
  return seekable;
};
