import React, { PureComponent } from 'react';
import { CastEvent, CastEventType, CastState, PlayerEventType } from 'react-native-theoplayer';
import { Text } from 'react-native';
import { PlayerContext, UiContext } from '../util/PlayerContext';

interface CastMessageState {
  message: string | undefined;
}

/**
 * A simple cast message showing the current state of casting for the `react-native-theoplayer` UI.
 */
export class CastMessage extends PureComponent<unknown, CastMessageState> {
  constructor(props: unknown) {
    super(props);
    this.state = { message: undefined };
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.CAST_EVENT, this.onCastEvent);
    const chromecastState = player.cast.chromecast?.state;
    const airplayState = player.cast.airplay?.state;
    if (chromecastState === 'connecting' || chromecastState === 'connected') {
      this._processCastState(chromecastState, 'Chromecast');
    } else if (airplayState === 'connecting' || airplayState === 'connected') {
      this._processCastState(airplayState, 'Airplay');
    }
  }

  componentWillUnmount() {
    const context = this.context as UiContext;
    context.player.removeEventListener(PlayerEventType.CAST_EVENT, this.onCastEvent);
  }

  private _processCastState = (state: CastState, target: 'Chromecast' | 'Airplay') => {
    let message: string | undefined;
    const { locale } = this.context as UiContext;
    switch (state) {
      case CastState.connecting:
        message = locale.castConnecting({ target });
        break;
      case CastState.connected:
        message = locale.castConnected({ target });
        break;
    }
    this.setState({
      message,
    });
  };

  private onCastEvent = (event: CastEvent) => {
    if (event.subType !== CastEventType.CHROMECAST_STATE_CHANGE && event.subType !== CastEventType.AIRPLAY_STATE_CHANGE) {
      return;
    }
    const castTarget = event.subType === CastEventType.CHROMECAST_STATE_CHANGE ? 'Chromecast' : 'Airplay';
    this._processCastState(event.state, castTarget);
  };

  render() {
    const { message } = this.state;

    if (!message) {
      return <></>;
    }

    return (
      <PlayerContext.Consumer>
        {(context: UiContext) => <Text style={[context.style.text, { color: context.style.colors.text }]}>{message}</Text>}
      </PlayerContext.Consumer>
    );
  }
}

CastMessage.contextType = PlayerContext;
