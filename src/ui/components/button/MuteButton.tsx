import { ActionButton } from './actionbutton/ActionButton';
import React, { type ReactNode, useCallback, useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { Platform } from 'react-native';
import { VolumeOffSvg } from './svg/VolumeOffSvg';
import { VolumeUpSvg } from './svg/VolumeUpSvg';
import { useMuted } from '../hooks/useMuted';

export interface MuteButtonProps {
  /**
   * The icon components used in the button.
   */
  icon?: { volumeUp: ReactNode; volumeOff: ReactNode };
}

export function MuteButton(props: MuteButtonProps) {
  const { icon } = props;
  const { player } = useContext(PlayerContext);
  const muted = useMuted();
  const toggleMuted = useCallback(() => {
    player.muted = !player.muted;
  }, [player]);

  const volumeUpSvg: ReactNode = icon?.volumeUp ?? <VolumeUpSvg />;
  const volumeOffSvg: ReactNode = icon?.volumeOff ?? <VolumeOffSvg />;
  if (Platform.isTV) {
    return <></>;
  }
  return <ActionButton svg={muted ? volumeOffSvg : volumeUpSvg} onPress={toggleMuted} touchable={true} />;
}
