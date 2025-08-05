import { useCurrentTime } from '../../hooks/useCurrentTime';

/**
 * Returns the player's current slider time.
 *
 * Optionally throttle the amount of state update by providing a minimal interval.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 **
 * @param throttledIntervalMs The minimum interval (in milliseconds) between state updates.
 * @group Hooks
 */
export const useSliderTime = (throttledIntervalMs: number | undefined = undefined) => {
  const currentTime = useCurrentTime(throttledIntervalMs);
  return Number.isFinite(currentTime) ? Math.round(currentTime * 1e-3) * 1e3 : 0;
};
