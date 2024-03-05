import React, { PureComponent } from 'react';
import { Linking, StyleProp, Text, TextStyle, TouchableOpacity } from 'react-native';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { Ad, AdEvent, AdEventType, PlayerEventType, TimeUpdateEvent } from 'react-native-theoplayer';
import { arrayFind } from '../../utils/ArrayUtils';
import { isLinearAd } from '../../utils/AdUtils';

interface AdClickThroughButtonProps {
  /**
   * Optional style applied to the ad click through button
   */
  style?: StyleProp<TextStyle>;
}

interface AdClickThroughButtonState {
  currentAd: Ad | undefined;
  clickThrough: string | undefined;
}

export class AdClickThroughButton extends PureComponent<AdClickThroughButtonProps, AdClickThroughButtonState> {
  private static initialState = {
    currentAd: undefined,
    clickThrough: undefined,
  };

  constructor(props: AdClickThroughButtonProps) {
    super(props);
    this.state = AdClickThroughButton.initialState;
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
  }

  private onAdEvent = (event: AdEvent) => {
    const player = (this.context as UiContext).player;
    if (event.subType === AdEventType.AD_BREAK_BEGIN) {
      void this.update();
      player.addEventListener(PlayerEventType.TIME_UPDATE, this.onTimeUpdateEvent);
    } else if (event.subType === AdEventType.AD_BREAK_END) {
      this.setState(AdClickThroughButton.initialState);
      player.removeEventListener(PlayerEventType.TIME_UPDATE, this.onTimeUpdateEvent);
    }
  };

  private onTimeUpdateEvent = (_event: TimeUpdateEvent) => {
    void this.update();
  };

  private async update(): Promise<void> {
    const player = (this.context as UiContext).player;
    const currentAds = await player.ads.currentAds();
    const linearAd = arrayFind(currentAds ?? [], isLinearAd);
    const clickThrough = linearAd?.clickThrough;
    if (clickThrough !== undefined) {
      this.setState({ clickThrough: clickThrough });
    }
  }

  private onPress = () => {
    const { clickThrough } = this.state;
    const player = (this.context as UiContext).player;
    player.pause();
    if (clickThrough) {
      void Linking.openURL(clickThrough);
    }
  };

  render() {
    const { clickThrough, currentAd } = this.state;
    const { style } = this.props;

    if (clickThrough === undefined || (currentAd && currentAd.integration === 'google-ima')) {
      return <></>;
    }

    return (
      <PlayerContext.Consumer>
        {(context: UiContext) => (
          <TouchableOpacity style={{ padding: 5 }} onPress={this.onPress}>
            <Text style={[context.style.text, { color: context.style.colors.text }, style]}>Visit Advertiser</Text>
          </TouchableOpacity>
        )}
      </PlayerContext.Consumer>
    );
  }
}

AdClickThroughButton.contextType = PlayerContext;
