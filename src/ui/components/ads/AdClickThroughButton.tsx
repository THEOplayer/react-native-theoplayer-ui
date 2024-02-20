import React, { PureComponent } from 'react';
import { Button, Linking } from 'react-native';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { Ad, AdEvent, AdEventType, PlayerEventType, TimeUpdateEvent } from 'react-native-theoplayer';
import { arrayFind } from '../../utils/ArrayUtils';
import { isLinearAd } from '../../utils/AdUtils';

interface AdClickThroughButtonState {
  currentAd: Ad | undefined;
  clickThrough: string | undefined;
}

export class AdClickThroughButton extends PureComponent<unknown, AdClickThroughButtonState> {
  private static initialState = {
    currentAd: undefined,
    clickThrough: undefined,
  };

  constructor(props: unknown) {
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

    if (clickThrough === undefined || (currentAd && currentAd.integration === 'google-ima')) {
      return <></>;
    }

    return (
      <PlayerContext.Consumer>{(_context: UiContext) => <Button title="Visit Advertiser" onPress={this.onPress}></Button>}</PlayerContext.Consumer>
    );
  }
}

AdClickThroughButton.contextType = PlayerContext;
