import React, { PureComponent, ReactNode } from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { StyleProp, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import { Ad, AdEvent, AdEventType, PlayerEventType, TimeUpdateEvent } from 'react-native-theoplayer';
import { arrayFind } from '../../utils/ArrayUtils';
import { isLinearAd } from '../../utils/AdUtils';
import { ActionButton } from '../button/actionbutton/ActionButton';
import { SkipNextSvg } from '../button/svg/SkipNext';

export interface AdSkipButtonProps {
  /**
   * Optional style applied to the ad skip button
   */
  style?: StyleProp<TextStyle>;
  /**
   * The style overrides for the text in the ad skip button.
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * The icon components used in the button.
   */
  icon?: ReactNode;
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
    const { style, textStyle, icon } = this.props;

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

    const skipSvg: ReactNode = icon ?? <SkipNextSvg />;
    return (
      <PlayerContext.Consumer>
        {(context: UiContext) => (
          <View style={[{ flexDirection: 'row', backgroundColor: context.style.colors.adSkipBackground, padding: 5 }, style]}>
            <TouchableOpacity style={[{ flexDirection: 'row' }, style]} onPress={this.onPress}>
              <Text style={[context.style.text, { color: context.style.colors.text }, textStyle]}>Skip Ad</Text>
              <ActionButton touchable={false} svg={skipSvg} />
            </TouchableOpacity>
          </View>
        )}
      </PlayerContext.Consumer>
    );
  }
}

AdSkipButton.contextType = PlayerContext;
