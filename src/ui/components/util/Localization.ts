import type { PlayerError, VideoQuality } from 'react-native-theoplayer';

export type Localization = Partial<AllLocalization>;

export interface AllLocalization {
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

