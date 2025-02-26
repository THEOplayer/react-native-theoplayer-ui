import { useCallback, useContext, useEffect, useState } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { type PlayerEventMap, PlayerEventType } from 'react-native-theoplayer';

const TIME_CHANGE_EVENTS = [PlayerEventType.TIME_UPDATE, PlayerEventType.SEEKING, PlayerEventType.SEEKED] satisfies ReadonlyArray<
  keyof PlayerEventMap
>;

/**
 * Returns {@link react-native-theoplayer!THEOplayer.duration | the player's current time}, automatically updating whenever it changes.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @group Hooks
 */
export const useCurrentTime = () => {
  const { player } = useContext(PlayerContext);
  const [currentTime, setCurrentTime] = useState(player?.currentTime ?? 0);
  const onTimeUpdate = useCallback(() => {
    if (player) {
      setCurrentTime(player.currentTime);
    }
  }, [player]);
  useEffect(() => {
    if (!player) return;
    TIME_CHANGE_EVENTS.forEach((event) => player.addEventListener(event, onTimeUpdate));
    return () => {
      TIME_CHANGE_EVENTS.forEach((event) => player.removeEventListener(event, onTimeUpdate));
    };
  }, [player, onTimeUpdate]);

  return currentTime;
};
