import type { PlayerError, VideoQuality } from 'react-native-theoplayer';

/**
 * The localized strings used in the player's user interface.
 */
export interface Locale {
  /**
   * The text used in the back button, on all menus.
   */
  backButton: string;
  /**
   * The title at the top of the settings menu.
   */
  settingsTitle: string;
  /**
   * The title of the video quality selection menu.
   */
  qualityTitle: string;
  /**
   * The label of a video quality.
   * @param quality
   */
  qualityLabel: ({ quality }: { quality: VideoQuality | undefined }) => string;
  /**
   * The extended label of a video quality.
   * @param quality The video quality
   */
  qualityLabelExtended: ({ quality }: { quality: VideoQuality | undefined }) => string;
  /**
   * The title of the audio track selection menu.
   */
  audioTitle: string;
  /**
   * The title of the subtitle track selection menu.
   */
  subtitleTitle: string;
  /**
   * The title of the playback speed menu.
   */
  playbackRateTitle: string;
  /**
   * The label of the selectable playback speed.
   * @param rate The playback speed value
   */
  playbackRateLabel: ({ rate }: { rate: number }) => string;
  /**
   * The label showing advertisement progress.
   * @param currentAd The ad counter
   * @param totalAds The amount of total ads
   */
  adProgress: ({ currentAd, totalAds }: { currentAd: number; totalAds: number }) => string;
  /**
   * The label during the countdown, when it can be skipped.
   * @param seconds The amount of remaining seconds
   */
  adSkipCounter: ({ seconds }: { seconds: number }) => string;
  /**
   * The text on the button to skip advertisements.
   */
  adSkip: string;
  /**
   * The countdown text shown during advertisements.
   * @param remainingDuration The remaining duration in seconds
   */
  adCountdown: ({ remainingDuration }: { remainingDuration: number }) => string;
  /**
   * The text on the click through button, potentially shown during advertisements.
   */
  adClickThroughButton: string;
  /**
   * The text shown on the player while connecting to a cast target.
   * @param target Chromecast or Airplay
   */
  castConnecting: ({ target }: { target: 'Chromecast' | 'Airplay' }) => string;
  /**
   * The text shown on the player while connected to a cast target.
   * @param target Chromecast or Airplay
   */
  castConnected: ({ target }: { target: 'Chromecast' | 'Airplay' }) => string;
  /**
   * The error message shown on the player when the player has errored.
   * @param error The error message object
   */
  errorMessage: ({ error }: { error: PlayerError }) => string;
  /**
   * The label used to indicate the player is playing a live steam.
   */
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
  playbackRateLabel: ({ rate }) => {
    if (rate === 1) return 'Normal';
    return `${rate}x`;
  },
  adProgress: ({ currentAd, totalAds }) => {
    return totalAds > 1 ? `Ad ${currentAd} of ${totalAds}` : 'Ad';
  },
  adSkipCounter: ({ seconds }) => {
    return `Skip in ${Math.ceil(seconds)}s`;
  },
  adSkip: 'Skip Ad',
  adCountdown: ({ remainingDuration }) => {
    return `Content will resume in ${Math.ceil(remainingDuration)}s`;
  },
  adClickThroughButton: 'Visit Advertiser',
  castConnecting: ({ target }) => {
    return `Connecting to ${target} ...`;
  },
  castConnected: ({ target }) => {
    return `Playing on ${target}`;
  },
  errorMessage: ({ error }) => {
    return error.errorMessage;
  },
};
