import { useCallback, useContext, useEffect, useState } from 'react';
import { PlayerContext, useThrottledState } from '@theoplayer/react-native-ui';
import { type PlayerEventMap, PlayerEventType, type Event } from 'react-native-theoplayer';

const TIME_CHANGE_EVENTS = [PlayerEventType.TIME_UPDATE, PlayerEventType.SEEKING, PlayerEventType.SEEKED] satisfies ReadonlyArray<
  keyof PlayerEventMap
>;

type TimeChangeEventType = (typeof TIME_CHANGE_EVENTS)[number];

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
  const isThrottling = throttledIntervalMs !== undefined;
  const [currentTime, setCurrentTime] = isThrottling
    ? useThrottledState(player?.currentTime ?? 0, throttledIntervalMs)
    : useState(player?.currentTime ?? 0);
  const onTimeUpdate = useCallback(
    (event: Event<TimeChangeEventType>) => {
      if (player) {
        // Do not throttle state update when currentTime changes due to seeking/seeked events.
        const forced = isThrottling && event.type !== PlayerEventType.TIME_UPDATE;
        setCurrentTime(player.currentTime, forced);
      }
    },
    [player],
  );
  useEffect(() => {
    if (!player) return;
    TIME_CHANGE_EVENTS.forEach((event) => player.addEventListener(event, onTimeUpdate));
    return () => {
      TIME_CHANGE_EVENTS.forEach((event) => player.removeEventListener(event, onTimeUpdate));
    };
  }, [player, onTimeUpdate]);

  return currentTime;
};
