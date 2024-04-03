import { CastEvent, CastEventType, CastState, PlayerEventType } from 'react-native-theoplayer';
import { ActionButton } from '@theoplayer/react-native-ui';
import React, { PureComponent, type ReactNode } from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { ChromecastSvg } from './svg/ChromecastSvg';
import { Platform } from 'react-native';

interface CastButtonState {
  castState: CastState;
}

export interface CastButtonProps {
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
export class ChromecastButton extends PureComponent<CastButtonProps, CastButtonState> {
  private static initialState: CastButtonState = {
    castState: CastState.unavailable,
  };

  constructor(props: CastButtonProps) {
    super(props);
    this.state = ChromecastButton.initialState;
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.CAST_EVENT, this.onCastStateChangeEvent);
    this.setState({ castState: player.cast.chromecast?.state ?? CastState.unavailable });
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.CAST_EVENT, this.onCastStateChangeEvent);
  }

  private onCastStateChangeEvent = (event: CastEvent) => {
    if (event.subType != CastEventType.CHROMECAST_STATE_CHANGE) {
      return;
    }
    this.setState({ castState: event.state });
  };

  private onPress = () => {
    const player = (this.context as UiContext).player;
    if (isConnected(this.state.castState)) {
      player.cast.chromecast?.stop();
    } else {
      player.cast.chromecast?.start();
    }
  };

  render() {
    const { castState } = this.state;
    const { icon } = this.props;
    // TODO: state is reported as unavailable by Android bridge when it is available.
    if (Platform.OS === 'web' && castState === CastState.unavailable) {
      return <></>;
    }
    return <ActionButton svg={icon ?? <ChromecastSvg />} touchable={true} onPress={this.onPress} highlighted={isConnected(castState)} />;
  }
}

ChromecastButton.contextType = PlayerContext;
