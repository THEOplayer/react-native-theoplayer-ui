import React, { type ReactNode } from 'react';
import { CastButton } from 'react-native-google-cast';
import type { CastState } from 'react-native-theoplayer';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { DEFAULT_ACTION_BUTTON_STYLE } from './actionbutton/ActionButton';
import { useChromecast } from '../hooks/useChromecast';
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
 * The native button to enable Chromecast for the `react-native-theoplayer` UI.
 * This component uses the button from `react-native-google-cast` and is not supported on web.
 */
export function ChromecastButton(props: CastButtonProps) {
  const castState = useChromecast();

  return (
    <PlayerContext.Consumer>
      {(context: UiContext) => (
        <CastButton
          style={props.style ?? DEFAULT_ACTION_BUTTON_STYLE}
          testID={props.testID ?? TestIDs.CHROMECAST_BUTTON}
          tintColor={isConnected(castState) ? context.style.colors.iconSelected : context.style.colors.icon}
        />
      )}
    </PlayerContext.Consumer>
  );
}
