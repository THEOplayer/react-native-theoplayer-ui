import React, { PureComponent } from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { Button, StyleProp, Text, TextStyle } from 'react-native';
import { Ad, AdEvent, AdEventType, PlayerEventType, TimeUpdateEvent } from 'react-native-theoplayer';
import { arrayFind } from '../../utils/ArrayUtils';
import { isLinearAd } from '../../utils/AdUtils';

interface AdSkipButtonProps {
  /**
   * Optional style applied to the AdSkipButton
   */
  style?: StyleProp<TextStyle>;
}

interface AdSkipButtonState {
  currentAd: Ad | undefined;
  timeToSkip: number | undefined;
}

export class AdSkipButton extends PureComponent<AdSkipButtonProps, AdSkipButtonState> {
  private static initialState = {
    currentAd: undefined,
    timeToSkip: undefined,
  };

  constructor(props: AdSkipButtonProps) {
    super(props);
    this.state = AdSkipButton.initialState;
  }

  componentDidMount() {
    const context = this.context as UiContext;
    const player = context.player;
    player.addEventListener(PlayerEventType.AD_EVENT, this.onAdEvent);
    if (context.adInProgress) {
      void this.update();
      player.addEventListener(PlayerEventType.TIME_UPDATE, this.onTimeUpdateEvent);
    }
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
      this.setState(AdSkipButton.initialState);
      player.removeEventListener(PlayerEventType.TIME_UPDATE, this.onTimeUpdateEvent);
    }
  };

  private onTimeUpdateEvent = (_event: TimeUpdateEvent) => {
    void this.update();
  };

  private async update() {
    const player = (this.context as UiContext).player;
    const currentAds = await player.ads.currentAds();
    const linearAd = arrayFind(currentAds ?? [], isLinearAd);
    const skipOffset = linearAd?.skipOffset;
    if (skipOffset === undefined || skipOffset < 0) {
      this.setState({ currentAd: linearAd, timeToSkip: undefined });
    } else {
      const timeToSkip = Math.ceil(skipOffset - player.currentTime / 1000);
      this.setState({ currentAd: linearAd, timeToSkip: timeToSkip });
    }
  }

  private onPress = () => {
    const player = (this.context as UiContext).player;
    player.ads.skip();
  };

  render() {
    const { currentAd, timeToSkip } = this.state;
    const { style } = this.props;

    if (timeToSkip === undefined || isNaN(timeToSkip) || (currentAd && currentAd.integration === 'google-ima')) {
      return <></>;
    }

    if (timeToSkip > 0) {
      const label = `Skip in ${Math.ceil(timeToSkip)}s`;
      return (
        <PlayerContext.Consumer>
          {(context: UiContext) => <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{label}</Text>}
        </PlayerContext.Consumer>
      );
    }

    return (
      <PlayerContext.Consumer>{(_context: UiContext) => <Button title="Skip to content" onPress={this.onPress}></Button>}</PlayerContext.Consumer>
    );
  }
}

AdSkipButton.contextType = PlayerContext;
