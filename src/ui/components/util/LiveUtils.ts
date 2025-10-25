import type { THEOplayer } from 'react-native-theoplayer';

const LIVE_MARGIN = 10;

/**
 * Check whether the player is playing a live stream.
 */
export function isLive(player: THEOplayer): boolean {
  const duration = player.duration;
  if (isNaN(duration)) {
    return false;
  }

  return duration === Infinity;
}

/**
 * Check whether the given timestamp is at the live point.
 */
export function isAtLive(player: THEOplayer, time: number): boolean {
  if (isLive(player)) {
    const seekable = player.seekable;
    if (seekable.length === 0) {
      return true;
    }
    const seekableEnd = seekable[seekable.length - 1].end;
    return seekableEnd - time < LIVE_MARGIN;
  }

  return false;
}
