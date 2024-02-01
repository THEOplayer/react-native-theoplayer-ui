import React, { PureComponent } from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { StyleProp, Text, TextStyle } from 'react-native';
import { AdEvent, AdEventType, PlayerEventType } from 'react-native-theoplayer';

interface AdDisplayProps {
  /**
   * Optional style applied to the AdDisplay
   */
  style?: StyleProp<TextStyle>;
}

interface AdDisplayState {
  adPlaying: boolean;
  currentAd: number | undefined;
  totalAds: number | undefined;
}

export class AdDisplay extends PureComponent<AdDisplayProps, AdDisplayState> {
  private static initialState = {
    adPlaying: false,
    currentAd: undefined,
    totalAds: undefined,
  };

  constructor(props: AdDisplayProps) {
    super(props);
    this.state = AdDisplay.initialState;
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.AD_EVENT, this.onAdEvent);
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.AD_EVENT, this.onAdEvent);
  }

  private onAdEvent = (event: AdEvent) => {
    void this.updateAdDisplayState(event.subType);
  };

  private async updateAdDisplayState(type: AdEventType) {
    const { adPlaying, currentAd } = this.state;

    if (type === AdEventType.AD_BREAK_BEGIN && !adPlaying) {
      const player = (this.context as UiContext).player;
      const currentAdBreak = await player.ads.currentAdBreak();
      const currentAds = currentAdBreak.ads;
      if (currentAds) {
        this.setState({ adPlaying: true, currentAd: 0, totalAds: currentAds.length });
      }
    } else if (type === AdEventType.AD_BREAK_END) {
      this.setState(AdDisplay.initialState);
    } else if (type === AdEventType.AD_BEGIN) {
      const newCurrentAd = currentAd ? currentAd + 1 : 1;
      this.setState({ currentAd: newCurrentAd });
    }
  }

  render() {
    const { adPlaying, currentAd, totalAds } = this.state;
    const { style } = this.props;
    if (!adPlaying || totalAds === undefined) {
      return <></>;
    }

    const label = totalAds > 1 ? `Ad ${currentAd} of ${totalAds}` : 'Ad';

    return (
      <PlayerContext.Consumer>
        {(context: UiContext) => <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{label}</Text>}
      </PlayerContext.Consumer>
    );
  }
}

AdDisplay.contextType = PlayerContext;
