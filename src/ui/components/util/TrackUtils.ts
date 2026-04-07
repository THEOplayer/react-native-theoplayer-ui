import type { MediaTrack, TextTrack, VideoQuality } from 'react-native-theoplayer';
import { TrackListEventType } from 'react-native-theoplayer';
import { getISO639LanguageByCode } from '../../utils/language/Language';
import type { QualityLabelLocaleParams } from './Locale';

declare module 'react-native-theoplayer' {
  interface TextTrack {
    // TODO Remove after updating to THEOplayer 10.14.0.
    captionChannel?: number;
  }
}

export function getMediaTrackLabel(track: MediaTrack): string {
  const label = track.label;
  const languageCode = track.language;
  if (label) {
    if (label === languageCode) {
      // Ignore default label with just the language code.
    } else {
      return label;
    }
  }
  if (languageCode) {
    const iso639Language = getISO639LanguageByCode(languageCode);
    if (iso639Language) {
      return iso639Language.local;
    }
  }
  return languageCode || label || '';
}

export function getTextTrackLabel(track: TextTrack): string {
  const label = track.label;
  const languageCode = track.language;
  if (label) {
    if (label === languageCode) {
      // Ignore default label with just the language code.
    } else if (track.type === 'cea608' && /^CC\d+$/.test(track.label)) {
      // Ignore default label with just the caption channel.
    } else {
      return label;
    }
  }
  if (languageCode) {
    const iso639Language = getISO639LanguageByCode(languageCode);
    if (iso639Language) {
      return iso639Language.local;
    }
  }
  if (track.type === 'cea608' && typeof track.captionChannel === 'number') {
    return `CC${track.captionChannel}`;
  }
  return languageCode || label || '';
}

export function stringFromTextTrackListEvent(type: TrackListEventType): string {
  switch (type) {
    case TrackListEventType.ADD_TRACK:
      return 'AddTrack';
    case TrackListEventType.REMOVE_TRACK:
      return 'RemoveTrack';
    case TrackListEventType.CHANGE_TRACK:
      return 'ChangeTrack';
  }
}

/**
 * Retain renderable tracks.
 * https://html.spec.whatwg.org/multipage/embedded-content.html#text-track-showing
 */
export function filterRenderableTracks(textTracks: TextTrack[]): TextTrack[] {
  return textTracks.filter((textTrack) => textTrack.kind === 'subtitles' || textTrack.kind === 'captions');
}

export function calculateQualityLabelParams(quality: VideoQuality): QualityLabelLocaleParams {
  let bitrate: string;
  let unit: 'Mbps' | 'kbps';
  if (quality.bandwidth > 1e7) {
    bitrate = (quality.bandwidth / 1e6).toFixed(0);
    unit = 'Mbps';
  } else if (quality.bandwidth > 1e6) {
    bitrate = (quality.bandwidth / 1e6).toFixed(1);
    unit = 'Mbps';
  } else {
    bitrate = (quality.bandwidth / 1e3).toFixed(0);
    unit = 'kbps';
  }
  return {
    quality: quality,
    label: quality.label,
    width: quality.width,
    height: quality.height,
    bitrate,
    unit,
  };
}
