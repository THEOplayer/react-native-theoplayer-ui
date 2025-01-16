import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { PlayerEventType, filterThumbnailTracks, type PlayerEventMap } from 'react-native-theoplayer';

const TEXT_TRACK_CHANGE_EVENTS = [PlayerEventType.LOADED_DATA, PlayerEventType.TEXT_TRACK_LIST] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Returns a thumbnail track, if available.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useThumbnailTrack = () => {
  const player = useContext(PlayerContext).player;
  const subscribe = useCallback(
    (callback: () => void) => {
      TEXT_TRACK_CHANGE_EVENTS.forEach((event) => player?.addEventListener(event, callback));
      return () => TEXT_TRACK_CHANGE_EVENTS.forEach((event) => player?.removeEventListener(event, callback));
    },
    [player],
  );
  return useSyncExternalStore(subscribe, () => filterThumbnailTracks(player.textTracks));
};
