import React from 'react';
import type { THEOplayer } from 'react-native-theoplayer';
import type { THEOplayerTheme } from '../../THEOplayerTheme';
import { DEFAULT_THEOPLAYER_THEME } from '../../THEOplayerTheme';
import type { UiControls } from '../uicontroller/UiControls';
import { type Locale, defaultLocale } from './Locale';
import type { ScrubberState } from '../seekbar/ScrubberState';

export interface UiContext {
  /**
   * The THEOplayer from the THEOplayerView.
   */
  readonly player: THEOplayer;
  /**
   * The configured THEOplayerTheme.
   */
  readonly style: THEOplayerTheme;
  /**
   * UI controls for the components to communicate with the UI.
   */
  readonly ui: UiControls;

  /**
   * Whether a linear ad is currently in progress.
   */
  readonly adInProgress: boolean;

  /**
   * The localized strings used in the UI components.
   */
  readonly locale: Locale;

  /**
   * The current scrubber state, whether the user is dragging the seekbar's thumbnail.
   */
  readonly scrubberState: ScrubberState;
}

/**
 * The context for all UI components of `react-native-theoplayer`.
 */
export const PlayerContext = React.createContext<UiContext>({
  player: undefined as unknown as THEOplayer,
  style: DEFAULT_THEOPLAYER_THEME,
  ui: undefined as unknown as UiControls,
  adInProgress: false,
  locale: defaultLocale,
  scrubberState: {
    isScrubbing: false,
    currentTime: undefined,
  },
});
