import React, { useCallback, useContext, useEffect, useState } from 'react';
import { PlayerContext } from '@theoplayer/react-native-ui';
import { type PlayerEventMap, PlayerEventType } from 'react-native-theoplayer';

const TIME_CHANGE_EVENTS = [PlayerEventType.TIME_UPDATE, PlayerEventType.SEEKING, PlayerEventType.SEEKED] satisfies ReadonlyArray<
  keyof PlayerEventMap
>;

/**
 * Returns the player's current slider time, and its scrubbing state.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 **
 * @group Hooks
 */
export const useSlider = (): [number, boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const { player } = useContext(PlayerContext);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [currentTime, setCurrentTime] = useState(player?.currentTime ?? 0);
  useEffect(() => {
    if (!player) return;
     // Block time updates while scrubbing
    if (isScrubbing) return;
    const onTimeUpdate = () => {
      setCurrentTime(player.currentTime);
    };
    TIME_CHANGE_EVENTS.forEach((event) => player.addEventListener(event, onTimeUpdate));
    return () => {
      TIME_CHANGE_EVENTS.forEach((event) => player.removeEventListener(event, onTimeUpdate));
    };
  }, [player, isScrubbing]);

  return [Number.isFinite(currentTime) ? Math.round(currentTime * 1e-3) * 1e3 : 0, isScrubbing, setIsScrubbing];
};
