import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { type PlayerEventMap, PlayerEventType } from 'react-native-theoplayer';

const ENDED_CHANGE_EVENTS = [PlayerEventType.ENDED, PlayerEventType.SEEKING] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Returns {@link react-native-theoplayer!THEOplayer.ended | the player's ended state}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useEnded = () => {
  const { player } = useContext(PlayerContext);
  const subscribe = useCallback(
    (callback: () => void) => {
      player?.addEventListener(ENDED_CHANGE_EVENTS, callback);
      return () => player?.removeEventListener(ENDED_CHANGE_EVENTS, callback);
    },
    [player],
  );
  return useSyncExternalStore(
    subscribe,
    // TODO: replace this with `player.ended` once added to the SDK.
    () => (player ? player.duration > 0 && player.currentTime === player.duration : true),
  );
};
