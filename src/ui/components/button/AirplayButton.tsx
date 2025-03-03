import React, { type ReactNode, useCallback, useContext } from 'react';
import { Platform } from 'react-native';
import { PlayerContext } from '../util/PlayerContext';
import { isConnected } from './ChromecastButton';
import { ActionButton } from './actionbutton/ActionButton';
import { AirplaySvg } from './svg/AirplaySvg';
import { CastState } from 'react-native-theoplayer';
import { useAirplay } from '../hooks/useAirplay';

export interface AirplayButtonProps {
  /**
   * The icon component used in the button.
   */
  icon?: ReactNode;
}

/**
 * The default button to enable Airplay for the `react-native-theoplayer` UI.
 */
export function AirplayButton(props: AirplayButtonProps) {
  const { icon } = props;
  const { player } = useContext(PlayerContext);
  const castState = useAirplay();
  const onUIAirplayToggled = useCallback(() => {
    if (castState !== CastState.unavailable) {
      if (isConnected(castState)) {
        player.cast.airplay?.stop();
      } else {
        player.cast.airplay?.start();
      }
    }
  }, [player]);

  if (castState === CastState.unavailable || Platform.isTV) {
    return <></>;
  }
  return <ActionButton svg={icon ?? <AirplaySvg />} touchable={true} onPress={onUIAirplayToggled} highlighted={isConnected(castState)} />;
}
