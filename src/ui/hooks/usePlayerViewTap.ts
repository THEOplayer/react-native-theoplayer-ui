import { useEffect } from 'react';
import { PlayerEventType, type THEOplayer } from 'react-native-theoplayer';

const VIEW_TAP = (PlayerEventType as Record<string, string>).VIEW_TAP as PlayerEventType | undefined;

/**
 * Calls `onTap` whenever the user taps or clicks the player view itself, as opposed to a UI component on top of it.
 *
 * @param player the player whose view is observed.
 * @param onTap called on every tap on the player view.
 * @param enabled whether to observe taps at all.
 * @returns whether taps are observed, which requires a `react-native-theoplayer` version that dispatches
 * `PlayerEventType.VIEW_TAP`.
 */
export function usePlayerViewTap(player: THEOplayer, onTap: () => void, enabled: boolean): boolean {
  const supported = enabled && VIEW_TAP !== undefined;
  useEffect(() => {
    if (!supported || VIEW_TAP === undefined) {
      return;
    }
    player.addEventListener(VIEW_TAP, onTap);
    return () => player.removeEventListener(VIEW_TAP, onTap);
  }, [player, onTap, supported]);
  return supported;
}
