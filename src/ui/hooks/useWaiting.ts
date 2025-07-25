import { useCallback, useContext, useEffect, useState } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { PlayerEventType, PlayerEventMap } from 'react-native-theoplayer';

const BUFFERING_EVENTS = [PlayerEventType.WAITING, PlayerEventType.PLAYING] satisfies ReadonlyArray<
  keyof PlayerEventMap
>;

/**
 * Returns whether the player is waiting, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useWaiting = () => {
  const { player } = useContext(PlayerContext);
  const [waiting, setWaiting] = useState(false);
  const onBufferingEvent = useCallback((event: PlayerEventMap[PlayerEventType.PLAYING] | PlayerEventMap[PlayerEventType.WAITING]) => {
    if (!player) return
    if (event.type === PlayerEventType.WAITING) setWaiting(true)
    if (event.type === PlayerEventType.PLAYING) setWaiting(false);
  }, [player]);
  useEffect(() => {
    if (!player) return;
    BUFFERING_EVENTS.forEach((event) => player.addEventListener(event, onBufferingEvent));
    return () => {
      BUFFERING_EVENTS.forEach((event) => player.removeEventListener(event, onBufferingEvent));
    };
  }, [player, onBufferingEvent]);

  return waiting;
};