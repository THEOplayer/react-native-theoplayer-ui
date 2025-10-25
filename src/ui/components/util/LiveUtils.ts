import type { TimeRange } from 'react-native-theoplayer';

const LIVE_MARGIN = 10;

/**
 * Check whether the player is playing a live stream.
 */
export function isLiveDuration(duration: number | undefined): boolean {
  return duration !== undefined && !isFinite(duration);
}

/**
 * Check whether the given timestamp is at the live point.
 */
export function isAtLive(duration: number | undefined, time: number, seekable: TimeRange[] | undefined): boolean {
  if (isLiveDuration(duration)) {
    if (!seekable || seekable.length === 0) {
      return true;
    }
    const seekableEnd = seekable[seekable.length - 1].end;
    return seekableEnd - time < LIVE_MARGIN;
  }

  return false;
}
