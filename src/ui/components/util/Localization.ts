import type { PlayerError, VideoQuality } from 'react-native-theoplayer';

export interface Locale {
  backButton: string;
  settingsTitle: string;
  qualityTitle: string;
  qualityLabel: ({ quality }: { quality: VideoQuality | undefined }) => string;
  qualityLabelExtended: ({ quality }: { quality: VideoQuality | undefined }) => string;
  audioTitle: string;
  subtitleTitle: string;
  playbackRateTitle: string;
  playbackRateValue: ({ rate }: { rate: number }) => string;
  adLabel: ({ currentAd, totalAds }: { currentAd: number; totalAds: number }) => string;
  adSkipLabel: ({ seconds }: { seconds: number }) => string;
  adCountdown: ({ remainingDuration }: { remainingDuration: number }) => string;
  adClickThroughButton: string;
  castMessage: ({ state, target }: { state: 'connecting' | 'connected'; target: 'Chromecast' | 'Airplay' }) => string;
  errorMessage: ({ error }: { error: PlayerError }) => string;
  liveLabel: string;
}

export const defaultLocale: Locale = {
  backButton: 'Back',
  settingsTitle: 'Settings',
  qualityTitle: 'Video Quality',
  audioTitle: 'Audio',
  subtitleTitle: 'Subtitles',
  playbackRateTitle: 'Playback Speed',
  liveLabel: 'LIVE',
  qualityLabel: ({ quality }) => {
    if (quality === undefined) return 'auto';
    if (quality.label && quality.label !== '') return quality.label;
    if (quality.height) return quality.height + 'p';
    return '';
  },
  qualityLabelExtended: ({ quality }) => {
    if (quality === undefined) return 'auto';
    if (quality.label && quality.label !== '') return quality.label;
    let label = '';
    if (quality.height) {
      label = quality.height + 'p';
    }
    let bandwidth;
    if (quality.bandwidth > 1e7) {
      bandwidth = (quality.bandwidth / 1e6).toFixed(0) + 'Mbps';
    } else if (quality.bandwidth > 1e6) {
      bandwidth = (quality.bandwidth / 1e6).toFixed(1) + 'Mbps';
    } else {
      bandwidth = (quality.bandwidth / 1e3).toFixed(0) + 'kbps';
    }
    const isHD = quality.height ? quality.height >= 720 : false;
    return `${label} - ${bandwidth} ${isHD ? '(HD)' : ''}`;
  },
  playbackRateValue: ({ rate }) => {
    if (rate === 1) return 'Normal';
    return `${rate}x`;
  },
  adLabel: ({ currentAd, totalAds }) => {
    return totalAds > 1 ? `Ad ${currentAd} of ${totalAds}` : 'Ad';
  },
  adSkipLabel: ({ seconds }) => {
    return `Skip in ${Math.ceil(seconds)}s`;
  },
  adCountdown: ({ remainingDuration }) => {
    return `Content will resume in ${Math.ceil(remainingDuration)}s`;
  },
  adClickThroughButton: 'Visit Advertiser',
  castMessage: ({ state, target }) => {
    if (state === 'connecting') return `Connecting to ${target} ...`;
    return `Playing on ${target}`;
  },
  errorMessage: ({ error }) => {
    return error.errorMessage;
  },
};
