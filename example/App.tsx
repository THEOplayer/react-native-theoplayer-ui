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

import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

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
  const [scrubTime, setScrubTime] = useState<number | undefined>(undefined)
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

  const needsBorder = Platform.OS === 'ios';
  const PLAYER_CONTAINER_STYLE: ViewStyle = {
    position: 'absolute',
    top: needsBorder ? 20 : 0,
    left: needsBorder ? 5 : 0,
    bottom: 0,
    right: needsBorder ? 5 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
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
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]}>
      <View style={PLAYER_CONTAINER_STYLE}>
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
                    <ChapterLabel scrubTime={scrubTime}/>
                    <Spacer />
                  </ControlBar>
                  <ControlBar>
                    <SeekBar chapterMarkers={() => <SquareMarker />} onScrubbing={setScrubTime} />
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
    </View>
  );
}
