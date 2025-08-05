import { useContext, useEffect } from 'react';
import { PlayerContext, useThrottledState } from '@theoplayer/react-native-ui';
import { PlayerEventType, type TimeRange, ProgressEvent } from 'react-native-theoplayer';

const THROTTLED_INTERVAL = 1000;

/**
 * Returns {@link react-native-theoplayer!THEOplayer.seekable | the player's seekable range}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useSeekable = () => {
  const { player } = useContext(PlayerContext);
  const [seekable, setSeekable] = useThrottledState<TimeRange[]>([], THROTTLED_INTERVAL);
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
