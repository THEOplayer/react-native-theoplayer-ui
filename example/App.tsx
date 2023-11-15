import * as React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  PlayerEventType,
  THEOplayer,
  THEOplayerView,
} from 'react-native-theoplayer';

const playerConfig = {
  license: 'YOUR_LICENSE_HERE',
};
const onPlayerReady = (player: THEOplayer) => {
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
    sources: {
      src: 'https://cdn.theoplayer.com/video/adultswim/clip.m3u8',
      type: 'application/x-mpegurl',
    },
    poster: 'https://cdn.theoplayer.com/video/adultswim/poster.jpg',
    metadata: {
      title: 'The Venture Bros',
      subtitle: 'Adult Swim',
      album: 'React-Native THEOplayer demos',
      displayIconUri: 'https://cdn.theoplayer.com/video/adultswim/poster.jpg',
      artist: 'THEOplayer',
      type: 'tv-show',
      releaseDate: 'november 29th',
      releaseYear: 1997,
    },
  };
  player.muted = true;
  player.autoplay = true;

  player.backgroundAudioConfiguration = {enabled: true};
  player.pipConfiguration = {startsAutomatically: true};
  console.log('THEOplayer is ready:', player.version);
};

export default function App() {
  return (
    <View style={styles.container}>
      <THEOplayerView
        style={StyleSheet.absoluteFill}
        config={playerConfig}
        onPlayerReady={onPlayerReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
