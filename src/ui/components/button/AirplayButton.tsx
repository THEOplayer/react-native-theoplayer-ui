import React, { PureComponent, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { isConnected } from './ChromecastButton';
import { ActionButton } from './actionbutton/ActionButton';
import { AirplaySvg } from './svg/AirplaySvg';
import { CastEvent, CastEventType, CastState, PlayerEventType } from 'react-native-theoplayer';

interface CastButtonState {
  castState: CastState;
}

export interface AirplayButtonProps {
  /**
   * The icon component used in the button.
   */
  icon?: ReactNode;
}

/**
 * The default button to enable Airplay for the `react-native-theoplayer` UI.
 */
export class AirplayButton extends PureComponent<AirplayButtonProps, CastButtonState> {
  private static initialState: CastButtonState = {
    castState: CastState.unavailable,
  };

  constructor(props: AirplayButtonProps) {
    super(props);
    this.state = AirplayButton.initialState;
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.CAST_EVENT, this.onCastStateChangeEvent);
    this.setState({ castState: player.cast.airplay?.state ?? CastState.unavailable });
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.CAST_EVENT, this.onCastStateChangeEvent);
  }

  private onCastStateChangeEvent = (event: CastEvent) => {
    if (event.subType != CastEventType.AIRPLAY_STATE_CHANGE) {
      return;
    }
    this.setState({ castState: event.state });
  };

  private onUIAirplayToggled = () => {
    const player = (this.context as UiContext).player;
    if (player.cast.airplay?.state !== CastState.unavailable) {
      if (isConnected(player.cast.airplay?.state)) {
        player.cast.airplay?.stop();
      } else {
        player.cast.airplay?.start();
      }
    }
  };

  render() {
    const { castState } = this.state;
    const { icon } = this.props;
    if (castState === CastState.unavailable || Platform.isTV) {
      return <></>;
    }
    return <ActionButton svg={icon ?? <AirplaySvg />} touchable={true} onPress={this.onUIAirplayToggled} highlighted={isConnected(castState)} />;
  }
}

AirplayButton.contextType = PlayerContext;
