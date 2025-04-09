import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { PlayerEventType, type PlayerEventMap, TextTrack } from 'react-native-theoplayer';

const TEXT_TRACK_CHANGE_EVENTS = [PlayerEventType.LOADED_DATA, PlayerEventType.TEXT_TRACK_LIST] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Retain first chapters track encountered in the textTracks list.
 */
export function filterChaptersTrack(textTracks: TextTrack[] | undefined): TextTrack | undefined {
    return textTracks && textTracks.find(isChaptersTrack);
  }
  
  /**
   * Query whether a track is a valid chapters track.
   */
  export function isChaptersTrack(textTrack: TextTrack | undefined): boolean {
    return !!textTrack && (textTrack.kind === 'chapters');
  }

/**
 * Returns a chapters track, if available.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useChaptersTrack = () => {
  const { player } = useContext(PlayerContext);
  const subscribe = useCallback(
    (callback: () => void) => {
      TEXT_TRACK_CHANGE_EVENTS.forEach((event) => player?.addEventListener(event, callback));
      return () => TEXT_TRACK_CHANGE_EVENTS.forEach((event) => player?.removeEventListener(event, callback));
    },
    [player],
  );
  return useSyncExternalStore(subscribe, () => filterChaptersTrack(player.textTracks));
};
