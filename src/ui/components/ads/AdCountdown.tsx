import React, { PureComponent } from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { StyleProp, Text, TextStyle } from 'react-native';
import { AdEvent, AdEventType, PlayerEventType, TimeUpdateEvent } from 'react-native-theoplayer';

interface AdCountdownProps {
  /**
   * Optional style applied to the AdCountdown
   */
  style?: StyleProp<TextStyle>;
}

interface AdCountdownState {
  maxRemainingDuration: number | undefined;
}

export class AdCountdown extends PureComponent<AdCountdownProps, AdCountdownState> {
  private static initialState = {
    maxRemainingDuration: undefined,
  };

  constructor(props: AdCountdownProps) {
    super(props);
    this.state = AdCountdown.initialState;
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.AD_EVENT, this.onAdEvent);
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.AD_EVENT, this.onAdEvent);
    player.removeEventListener(PlayerEventType.TIME_UPDATE, this.onTimeUpdateEvent);
  }

  private onAdEvent = (event: AdEvent) => {
    const player = (this.context as UiContext).player;
    if (event.subType === AdEventType.AD_BREAK_BEGIN) {
      void this.update();
      player.addEventListener(PlayerEventType.TIME_UPDATE, this.onTimeUpdateEvent);
    } else if (event.subType === AdEventType.AD_BREAK_END) {
      this.setState(AdCountdown.initialState);
      player.removeEventListener(PlayerEventType.TIME_UPDATE, this.onTimeUpdateEvent);
    }
  };

  private onTimeUpdateEvent = (_event: TimeUpdateEvent) => {
    void this.update();
  };

  private async update() {
    const player = (this.context as UiContext).player;
    const currentAdBreak = await player.ads.currentAdBreak();
    const maxRemainingDuration = currentAdBreak?.maxRemainingDuration;
    this.setState({ maxRemainingDuration: maxRemainingDuration });
  }

  render() {
    const { maxRemainingDuration } = this.state;
    const { style } = this.props;
    if (maxRemainingDuration === undefined || isNaN(maxRemainingDuration) || maxRemainingDuration < 0) {
      return <></>;
    }

    const label = `Content will resume in ${Math.ceil(maxRemainingDuration)}s`;

    return (
      <PlayerContext.Consumer>
        {(context: UiContext) => <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{label}</Text>}
      </PlayerContext.Consumer>
    );
  }
}

AdCountdown.contextType = PlayerContext;
