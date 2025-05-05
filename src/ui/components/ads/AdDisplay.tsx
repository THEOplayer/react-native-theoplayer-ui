import React, { PureComponent } from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { StyleProp, Text, TextStyle } from 'react-native';
import { AdEvent, AdEventType, PlayerEventType } from 'react-native-theoplayer';
import { arrayFind } from '../../utils/ArrayUtils';
import { isLinearAd } from '../../utils/AdUtils';

export interface AdDisplayProps {
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
    const context = this.context as UiContext;
    const player = context.player;
    player.addEventListener(PlayerEventType.AD_EVENT, this.onAdEvent);
    if (context.adInProgress) {
      void this.updateAdDisplayState();
    }
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.AD_EVENT, this.onAdEvent);
  }

  private onAdEvent = (event: AdEvent) => {
    void this.updateAdDisplayState(event.subType);
  };

  private async updateAdDisplayState(type?: AdEventType): Promise<void> {
    const { adPlaying } = this.state;
    const context = this.context as UiContext;
    if (type === AdEventType.AD_BREAK_END) {
      this.setState(AdDisplay.initialState);
    } else if (adPlaying || context.adInProgress || type === AdEventType.AD_BREAK_BEGIN) {
      const player = context.player;
      const currentAdBreak = await player.ads.currentAdBreak();
      const currentLinearAds = (currentAdBreak.ads ?? []).filter(isLinearAd);
      let index = 0;
      if (currentLinearAds.length > 1) {
        const currentAds = await player.ads.currentAds();
        const currentLinearAd = arrayFind(currentAds, isLinearAd);
        if (currentLinearAd) {
          index = currentLinearAds.indexOf(currentLinearAd);
        }
      }
      this.setState({ adPlaying: true, currentAd: index + 1, totalAds: currentLinearAds.length });
      return;
    }
  }

  render() {
    const { adPlaying, currentAd, totalAds } = this.state;
    const { style } = this.props;
    if (!adPlaying || totalAds === undefined || currentAd === undefined) {
      return <></>;
    }

    return (
      <PlayerContext.Consumer>
        {(context: UiContext) => (
          <Text
            style={[
              context.style.text,
              {
                color: context.style.colors.adDiplayText,
                backgroundColor: context.style.colors.adDisplayBackground,
                borderRadius: 2,
                padding: 5,
              },
              style,
            ]}>
            {context.localization.adLabel({ currentAd, totalAds })}
          </Text>
        )}
      </PlayerContext.Consumer>
    );
  }
}

AdDisplay.contextType = PlayerContext;
