import { useContext, useEffect, useState } from 'react';
import { PlayerEventType, PlayerEventMap, ReadyStateChangeEvent, type Event } from 'react-native-theoplayer';
import { PlayerContext } from '../barrel';

const WAITING_CHANGE_EVENTS = [
  PlayerEventType.WAITING,
  PlayerEventType.READYSTATE_CHANGE,
  PlayerEventType.ERROR,
  PlayerEventType.PLAYING,
  PlayerEventType.PLAY,
  PlayerEventType.PAUSE,
  PlayerEventType.ENDED,
  PlayerEventType.SEEKING,
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
  const { player } = useContext(PlayerContext);

  useEffect(() => {
    if (!player) return;
    let buffering = false;
    let hasError = false;
    let ended = false;
    const updateWaiting = () => setWaiting(buffering && !hasError && !ended && !player.paused);
    const onUpdateWaiting = (event: Event<WaitingChangeEventType>) => {
      switch (event.type) {
        case PlayerEventType.WAITING:
          buffering = true;
          updateWaiting();
          break;
        case PlayerEventType.READYSTATE_CHANGE:
          buffering = (event as ReadyStateChangeEvent).readyState < 3;
          updateWaiting();
          break;
        case PlayerEventType.ERROR:
          hasError = true;
          setWaiting(false);
          break;
        case PlayerEventType.ENDED:
          ended = true;
          buffering = false;
          setWaiting(false);
          break;
        case PlayerEventType.PAUSE:
          setWaiting(false);
          break;
        case PlayerEventType.SEEKING:
          ended = false;
          updateWaiting();
          break;
        case PlayerEventType.PLAY:
          updateWaiting();
          break;
        case PlayerEventType.PLAYING:
          buffering = false;
          setWaiting(false);
          break;
        case PlayerEventType.SOURCE_CHANGE:
          hasError = false;
          ended = false;
          buffering = false;
          setWaiting(false);
          break;
        case PlayerEventType.LOAD_START:
          hasError = false;
          ended = false;
          buffering = true;
          updateWaiting();
          break;
      }
    };

    player.addEventListener(WAITING_CHANGE_EVENTS, onUpdateWaiting);
    return () => {
      player.removeEventListener(WAITING_CHANGE_EVENTS, onUpdateWaiting);
    };
  }, [player]);

  return waiting;
};
