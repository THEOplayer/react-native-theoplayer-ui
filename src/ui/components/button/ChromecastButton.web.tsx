import { CastState } from 'react-native-theoplayer';
import { ActionButton } from '@theoplayer/react-native-ui';
import React, { type ReactNode, useCallback, useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { ChromecastSvg } from './svg/ChromecastSvg';
import { Platform } from 'react-native';
import { useChromecast } from '../../hooks/useChromecast';
import type { ButtonBaseProps } from './ButtonBaseProps';
import { TestIDs } from '../../utils/TestIDs';

export interface CastButtonProps extends ButtonBaseProps {
  /**
   * The icon component used in the button. Only overrideable for web.
   */
  icon?: ReactNode;
}

export function isConnected(state: CastState | undefined): boolean {
  return state === 'connecting' || state === 'connected';
}

/**
 * The button to enable Chromecast for web for the `react-native-theoplayer` UI
 */
export function ChromecastButton(props: CastButtonProps) {
  const { player } = useContext(PlayerContext);
  const castState = useChromecast();
  const { icon } = props;

  const onPress = useCallback(() => {
    if (isConnected(castState)) {
      player.cast.chromecast?.stop();
    } else {
      player.cast.chromecast?.start();
    }
  }, [player, castState]);

  if (Platform.OS === 'web' && castState === CastState.unavailable) {
    return <></>;
  }

  return (
    <ActionButton
      style={props.style}
      testID={props.testID ?? TestIDs.CHROMECAST_BUTTON}
      svg={icon ?? <ChromecastSvg />}
      touchable={true}
      onPress={onPress}
      highlighted={isConnected(castState)}
    />
  );
}
