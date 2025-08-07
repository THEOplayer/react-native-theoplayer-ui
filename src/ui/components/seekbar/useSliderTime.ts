import { useCurrentTime } from '../../hooks/useCurrentTime';

/**
 * Returns the player's current slider time.
 *
 * This hook must only be used in a component mounted inside a {@link THEOplayerDefaultUi} or {@link UiContainer},
 * or alternatively any other component that provides a {@link PlayerContext}.
 **
 * @group Hooks
 */
export const useSliderTime = () => {
  const currentTime = useCurrentTime();
  return Number.isFinite(currentTime) ? Math.round(currentTime * 1e-3) * 1e3 : 0;
};
