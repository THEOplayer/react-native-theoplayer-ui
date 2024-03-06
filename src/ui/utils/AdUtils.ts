import type { Ad } from 'react-native-theoplayer';

export function isLinearAd(ad: Ad): boolean {
  return ad.type === 'linear';
}
