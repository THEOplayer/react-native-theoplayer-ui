import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { type PlayerEventMap, PlayerEventType } from 'react-native-theoplayer';

const DURATION_CHANGE_EVENTS = [PlayerEventType.LOADED_DATA, PlayerEventType.DURATION_CHANGE] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Returns {@link react-native-theoplayer!THEOplayer.duration | the player's duration}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useDuration = () => {
  const player = useContext(PlayerContext).player;
  const subscribe = useCallback(
    (callback: () => void) => {
      DURATION_CHANGE_EVENTS.forEach((event) => player?.addEventListener(event, callback));
      return () => DURATION_CHANGE_EVENTS.forEach((event) => player?.removeEventListener(event, callback));
    },
    [player],
  );
  return useSyncExternalStore(subscribe, () => (player ? player.duration : NaN));
};
