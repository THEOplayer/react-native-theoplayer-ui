import { useCallback, useContext, useEffect, useState } from 'react';
import { PlayerContext, useThrottledState } from '@theoplayer/react-native-ui';
import { type PlayerEventMap, PlayerEventType } from 'react-native-theoplayer';

const TIME_CHANGE_EVENTS = [PlayerEventType.TIME_UPDATE, PlayerEventType.SEEKING, PlayerEventType.SEEKED] satisfies ReadonlyArray<
  keyof PlayerEventMap
>;

/**
 * Returns {@link react-native-theoplayer!THEOplayer.duration | the player's current time}, automatically updating whenever it changes.
 *
 * Optionally throttle the amount of state update by providing a minimal interval.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 *
 * @param throttledIntervalMs The minimum interval (in milliseconds) between state updates.
 * @group Hooks
 */
export const useCurrentTime = (throttledIntervalMs: number | undefined = undefined) => {
  const { player } = useContext(PlayerContext);
  const [currentTime, setCurrentTime] = throttledIntervalMs
    ? useThrottledState(player?.currentTime ?? 0, throttledIntervalMs)
    : useState(player?.currentTime ?? 0);
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
