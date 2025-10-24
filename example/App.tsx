import * as React from 'react';
import { useState } from 'react';
import {
  AdClickThroughButton,
  AdCountdown,
  AdDisplay,
  AdSkipButton,
  AutoFocusGuide,
  CenteredControlBar,
  CenteredDelayedActivityIndicator,
  ChapterLabel,
  ControlBar,
  DEFAULT_THEOPLAYER_THEME,
  FullscreenButton,
  LanguageMenuButton,
  type Locale,
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
} from '@theoplayer/react-native-ui';
import { PlayerConfiguration, PlayerEventType, TextTrackKind, THEOplayer, THEOplayerView } from 'react-native-theoplayer';

import { Platform, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GoToLiveButton } from '../src/ui/components/button/GoToLiveButton';

const playerConfig: PlayerConfiguration = {
  // Get your THEOplayer license from https://portal.theoplayer.com/
  // Without a license, only demo sources hosted on '*.theoplayer.com' domains can be played.
  license: undefined, // insert your license here
  libraryLocation: 'theoplayer',
  mediaControl: {
    mediaSessionEnabled: true,
  },
  mutedAutoplay: 'all',
};

const SquareMarker = () => {
  return (
    <View
      style={{
        width: 5,
        height: 4,
        backgroundColor: 'yellow',
      }}
    />
  );
};

/**
 * The example app demonstrates the use of the THEOplayerView with a custom UI using the provided UI components.
 * If you don't want to create a custom UI, you can just use the THEOplayerDefaultUi component instead.
 */
export default function App() {
  const [player, setPlayer] = useState<THEOplayer | undefined>(undefined);
  const [scrubTime, setScrubTime] = useState<number | undefined>(undefined);
  const isDarkMode = useColorScheme() === 'dark';

  const onPlayerReady = (player: THEOplayer) => {
    setPlayer(player);
    // optional debug logs
    player.addEventListener(PlayerEventType.SOURCE_CHANGE, console.log);
    player.addEventListener(PlayerEventType.LOADED_DATA, console.log);
    player.addEventListener(PlayerEventType.LOADED_METADATA, console.log);
    player.addEventListener(PlayerEventType.READYSTATE_CHANGE, console.log);
    player.addEventListener(PlayerEventType.PLAY, console.log);
    player.addEventListener(PlayerEventType.PLAYING, console.log);
    player.addEventListener(PlayerEventType.PAUSE, console.log);
    player.addEventListener(PlayerEventType.SEEKING, console.log);
    player.addEventListener(PlayerEventType.SEEKED, console.log);
    player.addEventListener(PlayerEventType.ENDED, console.log);
    player.muted = true;
    player.autoplay = true;

    player.source = {
      sources: [
        {
          src: 'https://cdn.theoplayer.com/video/sintel/nosubs.m3u8',
          type: 'application/x-mpegurl',
        },
      ],
      metadata: {
        title: 'Sintel',
        subtitle: 'HLS - Sideloaded Chapters',
        album: 'React-Native THEOplayer demos',
        mediaUri: 'https://theoplayer.com',
        displayIconUri: 'https://cdn.theoplayer.com/video/sintel_old/poster.jpg',
        artist: 'THEOplayer',
      },
      textTracks: [
        {
          kind: TextTrackKind.chapters,
          src: 'https://cdn.theoplayer.com/video/sintel/chapters.vtt',
          format: 'webvtt',
          srclang: 'en',
          label: 'Chapters',
          default: true,
        },
      ],
    };

    player.backgroundAudioConfiguration = { enabled: true };
    player.pipConfiguration = { startsAutomatically: true };
    console.log('THEOplayer is ready:', player.version);
  };

  const myCustomLocale: Partial<Locale> = {
    backButton: 'Terug',
    settingsTitle: 'Instellingen',
    qualityTitle: 'Videokwaliteit',
    audioTitle: 'Taal',
    subtitleTitle: 'Ondertitels',
    playbackRateTitle: 'Afspeelsnelheid',
    liveLabel: 'LIVE',
  };

  return (
    /**
     * The SafeAreaProvider component is a View from where insets provided by consumers are relative to.
     * This means that if this view overlaps with any system elements (status bar, notches, etc.) these values will be provided to
     * descendent consumers such as SafeAreaView.
     * {@link https://appandflow.github.io/react-native-safe-area-context/api/safe-area-provider}
     */
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.container}>
        <View style={styles.playerContainer}>
          <THEOplayerView config={playerConfig} onPlayerReady={onPlayerReady}>
            {player !== undefined && (
              <UiContainer
                theme={{ ...DEFAULT_THEOPLAYER_THEME }}
                player={player}
                locale={myCustomLocale}
                behind={<CenteredDelayedActivityIndicator size={50} />}
                top={
                  <AutoFocusGuide>
                    <ControlBar>
                      <Spacer />
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
                      left={<SkipButton skip={-10} />}
                      middle={<PlayButton />}
                      right={<SkipButton skip={30} />}
                    />
                  </AutoFocusGuide>
                }
                bottom={
                  <AutoFocusGuide>
                    <ControlBar>
                      <Spacer />
                      <ChapterLabel scrubTime={scrubTime} />
                      <Spacer />
                    </ControlBar>
                    <ControlBar>
                      <SeekBar chapterMarkers={() => <SquareMarker />} onScrubbing={setScrubTime} />
                    </ControlBar>
                    <ControlBar>
                      <MuteButton />
                      <TimeLabel showDuration={true} />
                      <GoToLiveButton />
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  playerContainer: {
    flex: 1,
    // on iOS, we cannot stretch an inline playerView to cover the whole screen, otherwise it assumes fullscreen presentationMode.
    marginHorizontal: Platform.select({ ios: 2, default: 0 }),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
