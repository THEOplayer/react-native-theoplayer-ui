import { useCallback, useContext, useSyncExternalStore } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { PlayerEventType, PresentationMode } from 'react-native-theoplayer';

/**
 * Returns {@link react-native-theoplayer!THEOplayer.presentationMode | the player's presentationMode}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const usePresentationMode = () => {
  const { player } = useContext(PlayerContext);
  const subscribe = useCallback(
    (callback: () => void) => {
      player?.addEventListener(PlayerEventType.PRESENTATIONMODE_CHANGE, callback);
      return () => player?.removeEventListener(PlayerEventType.PRESENTATIONMODE_CHANGE, callback);
    },
    [player],
  );
  return useSyncExternalStore(subscribe, () => (player ? player.presentationMode : PresentationMode.inline));
};
