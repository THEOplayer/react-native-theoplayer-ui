import React, { ReactNode, useState } from 'react';
import { PlayerConfiguration, THEOplayer, THEOplayerView } from 'react-native-theoplayer';

import { DEFAULT_THEOPLAYER_THEME, THEOplayerTheme } from './THEOplayerTheme';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import { TestIDs } from './utils/TestIDs';
import type { Locale } from './components/util/Locale';
import {
  AirplayButton,
  AutoFocusGuide,
  CenteredControlBar,
  CenteredDelayedActivityIndicator,
  ChromecastButton,
  ControlBar,
  FullscreenButton,
  FULLSCREEN_CENTER_STYLE,
  MuteButton,
  PipButton,
  PlaybackRateSubMenu,
  PlayButton,
  QualitySubMenu,
  SeekBar,
  SettingsMenuButton,
  SkipButton,
  Spacer,
  TimeLabel,
  UiContainer,
  LanguageMenuButton,
  CastMessage,
  AdClickThroughButton,
  AdDisplay,
  AdCountdown,
  AdSkipButton,
  GoToLiveButton,
} from '..';

export enum UIFeature {
  Chromecast,
  AirPlay,
  Fullscreen,
  Language,
  Mute,
  PiP,
  PlaybackRate,
  SeekBar,
  TrickPlay,
  VideoQuality,
}

// By default, exclude Chromecast, for which an extra dependency is needed.
const defaultExcludedFeatures = [UIFeature.Chromecast];

export interface THEOplayerDefaultUiProps {
  /**
   * The style for the container.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * The theme for all components.
   */
  theme?: Partial<THEOplayerTheme>;
  /**
   * The localized strings used in the UI components.
   */
  locale?: Partial<Locale>;
  /**
   * The player configuration with THEOplayer license.
   */
  config?: PlayerConfiguration;
  /**
   * The callback that is called when the internal THEOplayer is created.
   * @param player the internal THEOplayer
   */
  onPlayerReady?: (player: THEOplayer) => void;
  /**
   * A slot in the top right to add additional UI components.
   */
  topSlot?: ReactNode;
  /**
   * A slot in the bottom right to add additional UI components.
   */
  bottomSlot?: ReactNode;
  /**
   * A set of features to exclude from the UI.
   *
   * @default [Cast]
   */
  excludedFeatures?: UIFeature[];
}

/**
 * A default UI layout which uses UI components from `react-native-theoplayer` to create a basic playback UI around a THEOplayerView.
 */
export function THEOplayerDefaultUi(props: THEOplayerDefaultUiProps) {
  const { theme, config, topSlot, bottomSlot, style, locale, excludedFeatures = defaultExcludedFeatures } = props;
  const [player, setPlayer] = useState<THEOplayer | undefined>(undefined);

  const onPlayerReady = (player: THEOplayer) => {
    setPlayer(player);
    props.onPlayerReady?.(player);
  };

  return (
    <View style={[FULLSCREEN_CENTER_STYLE, { backgroundColor: '#000000' }, style]}>
      <THEOplayerView config={config} onPlayerReady={onPlayerReady}>
        {player !== undefined && (
          <UiContainer
            theme={{ ...DEFAULT_THEOPLAYER_THEME, ...theme }}
            locale={locale}
            player={player}
            behind={<CenteredDelayedActivityIndicator size={50} />}
            top={
              <AutoFocusGuide>
                <ControlBar>
                  {topSlot}
                  <Spacer />
                  {!Platform.isTV && (
                    <>
                      {!excludedFeatures.includes(UIFeature.AirPlay) && <AirplayButton />}
                      {!excludedFeatures.includes(UIFeature.Chromecast) && <ChromecastButton />}
                    </>
                  )}
                  {!excludedFeatures.includes(UIFeature.Language) && <LanguageMenuButton />}
                  <SettingsMenuButton>
                    {!excludedFeatures.includes(UIFeature.VideoQuality) && <QualitySubMenu />}
                    {!excludedFeatures.includes(UIFeature.PlaybackRate) && <PlaybackRateSubMenu />}
                  </SettingsMenuButton>
                </ControlBar>
              </AutoFocusGuide>
            }
            center={
              <AutoFocusGuide>
                <CenteredControlBar
                  style={{ width: '50%' }}
                  left={!excludedFeatures.includes(UIFeature.TrickPlay) ? <SkipButton skip={-10} testID={TestIDs.SKIP_BWD_BUTTON} /> : <></>}
                  middle={<PlayButton />}
                  right={!excludedFeatures.includes(UIFeature.TrickPlay) ? <SkipButton skip={30} testID={TestIDs.SKIP_FWD_BUTTON} /> : <></>}
                />
              </AutoFocusGuide>
            }
            bottom={
              <AutoFocusGuide>
                {!Platform.isTV && !excludedFeatures.includes(UIFeature.Chromecast) && !excludedFeatures.includes(UIFeature.AirPlay) && (
                  <ControlBar style={{ justifyContent: 'flex-start' }}>
                    <CastMessage />
                  </ControlBar>
                )}
                <ControlBar>{!excludedFeatures.includes(UIFeature.SeekBar) && <SeekBar />}</ControlBar>
                <ControlBar>
                  {!excludedFeatures.includes(UIFeature.Mute) && <MuteButton />}
                  <GoToLiveButton />
                  <TimeLabel showDuration={true} />
                  <Spacer />
                  {bottomSlot}
                  {!excludedFeatures.includes(UIFeature.PiP) && <PipButton />}
                  {!excludedFeatures.includes(UIFeature.Fullscreen) && <FullscreenButton />}
                </ControlBar>
              </AutoFocusGuide>
            }
            adTop={
              <AutoFocusGuide>
                <ControlBar>
                  <AdClickThroughButton />
                </ControlBar>
              </AutoFocusGuide>
            }
            adCenter={
              <AutoFocusGuide>
                <CenteredControlBar middle={<PlayButton />} />
              </AutoFocusGuide>
            }
            adBottom={
              <AutoFocusGuide>
                <ControlBar style={{ justifyContent: 'flex-start' }}>
                  <AdDisplay />
                  <AdCountdown />
                  <Spacer />
                  <AdSkipButton />
                </ControlBar>
                <ControlBar>
                  <MuteButton />
                  <SeekBar />
                </ControlBar>
              </AutoFocusGuide>
            }
          />
        )}
      </THEOplayerView>
    </View>
  );
}
