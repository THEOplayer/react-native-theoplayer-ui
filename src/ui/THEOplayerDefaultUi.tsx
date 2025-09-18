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
} from '..';

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
}

/**
 * A default UI layout which uses UI components from `react-native-theoplayer` to create a basic playback UI around a THEOplayerView.
 */
export function THEOplayerDefaultUi(props: THEOplayerDefaultUiProps) {
  const { theme, config, topSlot, bottomSlot, style, locale } = props;
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
                {topSlot}
                <ControlBar>
                  <Spacer />
                  {!Platform.isTV && (
                    <>
                      <AirplayButton />
                      <ChromecastButton />
                    </>
                  )}
                  <LanguageMenuButton />
                  <SettingsMenuButton>
                    {/*Note: quality selection is not available on iOS */}
                    <QualitySubMenu />
                    <PlaybackRateSubMenu />
                  </SettingsMenuButton>
                </ControlBar>
              </AutoFocusGuide>
            }
            center={
              <AutoFocusGuide>
                <CenteredControlBar
                  style={{ width: '50%' }}
                  left={<SkipButton skip={-10} testID={TestIDs.SKIP_BWD_BUTTON} />}
                  middle={<PlayButton />}
                  right={<SkipButton skip={30} testID={TestIDs.SKIP_FWD_BUTTON} />}
                />
              </AutoFocusGuide>
            }
            bottom={
              <AutoFocusGuide>
                {bottomSlot}
                {!Platform.isTV && (
                  <ControlBar style={{ justifyContent: 'flex-start' }}>
                    <CastMessage />
                  </ControlBar>
                )}
                <ControlBar>
                  <SeekBar />
                </ControlBar>
                <ControlBar>
                  <MuteButton />
                  <TimeLabel showDuration={true} />
                  <Spacer />
                  <PipButton />
                  <FullscreenButton />
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
