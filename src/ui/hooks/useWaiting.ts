import { useContext, useEffect, useState } from 'react';
import { PlayerEventType, PlayerEventMap, ReadyStateChangeEvent, type Event } from 'react-native-theoplayer';
import { PlayerContext } from '../barrel';

const WAITING_CHANGE_EVENTS = [
  PlayerEventType.READYSTATE_CHANGE,
  PlayerEventType.ERROR,
  PlayerEventType.PLAYING,
  PlayerEventType.SOURCE_CHANGE,
  PlayerEventType.LOAD_START,
] satisfies ReadonlyArray<keyof PlayerEventMap>;

type WaitingChangeEventType = (typeof WAITING_CHANGE_EVENTS)[number];

/**
 * Returns whether the player is waiting, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useWaiting = () => {
  const [waiting, setWaiting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { player } = useContext(PlayerContext);

  useEffect(() => {
    if (!player) return;
    const onUpdateWaiting = (event: Event<WaitingChangeEventType>) => {
      if (!player) return;
      switch (event.type) {
        case PlayerEventType.READYSTATE_CHANGE:
          setWaiting((event as ReadyStateChangeEvent).readyState < 3 && !hasError && !player.paused);
          break;
        case PlayerEventType.ERROR:
          setHasError(true);
          setWaiting(false);
          break;
        case PlayerEventType.PLAYING:
          setWaiting(false);
          break;
        case PlayerEventType.SOURCE_CHANGE:
          setHasError(false);
          setWaiting(false);
          break;
        case PlayerEventType.LOAD_START:
          setHasError(false);
          setWaiting(!player.paused);
          break;
      }
    };

    player.addEventListener(WAITING_CHANGE_EVENTS, onUpdateWaiting);
    return () => {
      player.removeEventListener(WAITING_CHANGE_EVENTS, onUpdateWaiting);
    };
  }, [player, hasError]);

  return waiting;
};
