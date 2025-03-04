import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { PlayerEventType } from 'react-native-theoplayer';

/**
 * Returns {@link react-native-theoplayer!THEOplayer.muted | the player's muted state}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useMuted = () => {
  const { player } = useContext(PlayerContext);
  const subscribe = useCallback(
    (callback: () => void) => {
      player?.addEventListener(PlayerEventType.VOLUME_CHANGE, callback);
      return () => player?.removeEventListener(PlayerEventType.VOLUME_CHANGE, callback);
    },
    [player],
  );
  return useSyncExternalStore(subscribe, () => (player ? player.muted : false));
};
