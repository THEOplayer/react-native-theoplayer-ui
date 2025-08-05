import { useContext, useEffect, useState } from 'react';
import { PlayerContext, useThrottledState } from '@theoplayer/react-native-ui';
import { PlayerEventType, type TimeRange, ProgressEvent } from 'react-native-theoplayer';

/**
 * Returns {@link react-native-theoplayer!THEOplayer.seekable | the player's seekable range}, automatically updating whenever it changes.
 *
 * Optionally throttle the amount of state update by providing a minimal interval.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @param throttledIntervalMs The minimum interval (in milliseconds) between state updates.
 * @group Hooks
 */
export const useSeekable = (throttledIntervalMs: number | undefined = undefined) => {
  const { player } = useContext(PlayerContext);
  const [seekable, setSeekable] = throttledIntervalMs ? useThrottledState<TimeRange[]>([], throttledIntervalMs) : useState<TimeRange[]>([]);
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
