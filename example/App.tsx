import * as React from 'react';
import { useState } from 'react';
import {
  AdClickThroughButton,
  CenteredControlBar,
  CenteredDelayedActivityIndicator,
  ControlBar,
  DEFAULT_THEOPLAYER_THEME,
  FullscreenButton,
  LanguageMenuButton,
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
  ChapterLabel
} from '@theoplayer/react-native-ui';
import { PlayerConfiguration, PlayerEventType, TextTrackKind, THEOplayer, THEOplayerView } from 'react-native-theoplayer';

import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { AdDisplay } from '@theoplayer/react-native-ui';
import { AdCountdown } from '@theoplayer/react-native-ui';
import { AdSkipButton } from '@theoplayer/react-native-ui';

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
  return <View style={{
    width: 5,
    height: 4,
    backgroundColor: "yellow",
  }} />;
};

/**
 * The example app demonstrates the use of the THEOplayerView with a custom UI using the provided UI components.
 * If you don't want to create a custom UI, you can just use the THEOplayerDefaultUi component instead.
 */
export default function App() {
  const [player, setPlayer] = useState<THEOplayer | undefined>(undefined);
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
      textTracks: [{
        kind: TextTrackKind.chapters,
        src: 'https://cdn.theoplayer.com/video/sintel/chapters.vtt',
        format: 'webvtt',
        srclang: 'en',
        label: 'Chapters',
        default: true
      }],
    };

    player.muted = true;
    player.autoplay = true;

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

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000' }]}>
      <View style={PLAYER_CONTAINER_STYLE}>
        <THEOplayerView config={playerConfig} onPlayerReady={onPlayerReady}>
          {player !== undefined && (
            <UiContainer
              theme={{ ...DEFAULT_THEOPLAYER_THEME }}
              player={player}
              behind={<CenteredDelayedActivityIndicator size={50} />}
              top={
                <ControlBar>
                  <LanguageMenuButton />
                  <SettingsMenuButton>
                    {/*Note: quality selection is not available on iOS */}
                    <QualitySubMenu />
                    <PlaybackRateSubMenu />
                  </SettingsMenuButton>
                </ControlBar>
              }
              center={<CenteredControlBar left={<SkipButton skip={-10} />} middle={<PlayButton />} right={<SkipButton skip={30} />} />}
              bottom={
                <>
                  <ControlBar>
                    <SeekBar chapterMarkers={() => (<SquareMarker/>)} />
                  </ControlBar>
                  <ControlBar>
                    <MuteButton />
                    <TimeLabel showDuration={true} />
                    <ChapterLabel />
                    <Spacer />
                    <PipButton />
                    <FullscreenButton />
                  </ControlBar>
                </>
              }
              adTop={
                <ControlBar>
                  <AdClickThroughButton />
                </ControlBar>
              }
              adCenter={<CenteredControlBar middle={<PlayButton />} />}
              adBottom={
                <>
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
                </>
              }
            />
          )}
        </THEOplayerView>
      </View>
    </View>
  );
}
