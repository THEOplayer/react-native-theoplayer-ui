import { useContext, useEffect, useState } from 'react';
import { type ErrorEvent, type PlayerError, type PlayerEventMap, PlayerEventType } from 'react-native-theoplayer';
import { PlayerContext } from '../barrel';

const ERROR_CHANGE_EVENTS = [PlayerEventType.ERROR, PlayerEventType.SOURCE_CHANGE, PlayerEventType.LOAD_START] satisfies ReadonlyArray<keyof PlayerEventMap>;

type ErrorChangeEventType = (typeof ERROR_CHANGE_EVENTS)[number];

/**
 * Returns the current player error, or `undefined` if there is no error.
 * Automatically updates when an error occurs, and resets when a new source is loaded.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useError = (): PlayerError | undefined => {
  const [error, setError] = useState<PlayerError | undefined>(undefined);
  const { player } = useContext(PlayerContext);

  useEffect(() => {
    if (!player) return;
    const onEvent = (event: { type: ErrorChangeEventType }) => {
      if (event.type === PlayerEventType.ERROR) {
        setError((event as ErrorEvent).error);
      } else {
        setError(undefined);
      }
    };

    player.addEventListener(ERROR_CHANGE_EVENTS, onEvent);
    return () => {
      player.removeEventListener(ERROR_CHANGE_EVENTS, onEvent);
    };
  }, [player]);

  return error;
};
