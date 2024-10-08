import { ActionButton } from './actionbutton/ActionButton';
import React, { PureComponent, type ReactNode } from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { ForwardSvg } from './svg/ForwardSvg';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackwardSvg } from './svg/BackwardSvg';
import { PlayerEventType, ProgressEvent } from 'react-native-theoplayer';

export interface SkipButtonProps {
  /**
   * The style overrides for the skip button.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * The style overrides for the text in the skip button.
   */
  textStyle?: StyleProp<TextStyle>;
  /**
  /**
   * The skip value for the skip button. This can be set to negative to skip backwards.
   */
  skip: number;
  /**
   * Whether the skip button should do a rotation animation when pressed instead of fading.
   */
  rotate?: boolean;

  /**
   * The icon components used in the button.
   */
  icon?: { forward: ReactNode; backward: ReactNode };
}

interface SkipButtonState {
  enabled: boolean;
  spinValue: Animated.Value;
}

/**
 * The default skip button for the `react-native-theoplayer` UI.
 */
export class SkipButton extends PureComponent<SkipButtonProps, SkipButtonState> {
  constructor(props: SkipButtonProps) {
    super(props);
    this.state = { enabled: false, spinValue: new Animated.Value(0) };
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.PROGRESS, this.onProgress);
    player.addEventListener(PlayerEventType.PLAYING, this.onPlaying);
    this.setState({ enabled: player.seekable.length > 0 });
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.PROGRESS, this.onProgress);
    player.removeEventListener(PlayerEventType.PLAYING, this.onPlaying);
  }

  private readonly onProgress = (event: ProgressEvent) => {
    this.setState({ enabled: event.seekable.length > 0 || event.buffered.length > 0 });
  };

  private readonly onPlaying = () => {
    const player = (this.context as UiContext).player;
    const isCasting = player.cast.chromecast?.casting ?? false;
    this.setState({ enabled: player.seekable.length > 0 || player.buffered.length > 0 || isCasting });
  };

  private readonly onPress = () => {
    const { skip, rotate } = this.props;
    const { spinValue } = this.state;
    const player = (this.context as UiContext).player;
    player.currentTime = player.currentTime + skip * 1e3;

    if (rotate === true) {
      Animated.timing(spinValue, {
        toValue: 0.1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(spinValue, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  render() {
    const { style, skip, rotate, icon, textStyle } = this.props;
    const { enabled, spinValue } = this.state;

    if (!enabled) {
      return <></>;
    }

    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: skip >= 0 ? ['0deg', '360deg'] : ['360deg', '0deg'],
    });

    const forwardSvg: ReactNode = icon?.forward ?? <ForwardSvg />;
    const backwardSvg: ReactNode = icon?.backward ?? <BackwardSvg />;

    return (
      <>
        <PlayerContext.Consumer>
          {(context: UiContext) => (
            <Animated.View style={[{ height: '100%', aspectRatio: 1 }, style, { transform: [{ rotate: spin }] }]}>
              <TouchableOpacity
                activeOpacity={rotate === true ? 1 : 0.2}
                style={[{ height: '100%', aspectRatio: 1, justifyContent: 'center' }, style]}
                onPress={this.onPress}>
                <ActionButton touchable={false} svg={skip < 0 ? backwardSvg : forwardSvg} />
                <View style={[StyleSheet.absoluteFill, { justifyContent: 'center' }]}>
                  <Text style={[context.style.text, { color: context.style.colors.text }, textStyle]}>{Math.abs(skip)}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </PlayerContext.Consumer>
      </>
    );
  }
}

SkipButton.contextType = PlayerContext;
