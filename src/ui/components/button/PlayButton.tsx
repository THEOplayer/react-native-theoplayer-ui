import { ActionButton } from './actionbutton/ActionButton';
import type { StyleProp, ViewStyle } from 'react-native';
import React, { type ReactNode, useCallback, useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { PlaySvg } from './svg/PlaySvg';
import { PauseSvg } from './svg/PauseSvg';
import { ReplaySvg } from './svg/ReplaySvg';
import { usePaused } from '../hooks/usePaused';
import { useEnded } from '../hooks/useEnded';

export interface PlayButtonProps {
  /**
   * The style overrides for the play/pause button.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * The icon components used in the button.
   */
  icon?: { play: ReactNode; pause: ReactNode; replay: ReactNode };
}

/**
 * The default play/pause button for the `react-native-theoplayer` UI.
 */
export function PlayButton(props: PlayButtonProps) {
  const { icon, style } = props;
  const playSvg: ReactNode = icon?.play ?? <PlaySvg />;
  const pauseSvg: ReactNode = icon?.pause ?? <PauseSvg />;
  const replaySvg: ReactNode = icon?.replay ?? <ReplaySvg />;
  const { player } = useContext(PlayerContext);
  const paused = usePaused();
  const ended = useEnded();

  const togglePlayPause = useCallback(() => {
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  }, [player]);

  return <ActionButton style={style} touchable={true} svg={ended ? replaySvg : paused ? playSvg : pauseSvg} onPress={togglePlayPause} />;
}
