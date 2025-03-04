import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { type PlayerEventMap, PlayerEventType } from 'react-native-theoplayer';

const PAUSED_CHANGE_EVENTS = [PlayerEventType.PLAY, PlayerEventType.PAUSE] satisfies ReadonlyArray<keyof PlayerEventMap>;

/**
 * Returns {@link react-native-theoplayer!THEOplayer.pause | the player's paused state}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const usePaused = () => {
  const { player } = useContext(PlayerContext);
  const subscribe = useCallback(
    (callback: () => void) => {
      player?.addEventListener(PAUSED_CHANGE_EVENTS, callback);
      return () => player?.removeEventListener(PAUSED_CHANGE_EVENTS, callback);
    },
    [player],
  );
  return useSyncExternalStore(subscribe, () => (player ? player.paused : true));
};
