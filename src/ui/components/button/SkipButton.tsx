import { ActionButton } from './actionbutton/ActionButton';
import React, { type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { ForwardSvg } from './svg/ForwardSvg';
import type { StyleProp, TextStyle } from 'react-native';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackwardSvg } from './svg/BackwardSvg';
import { PlayerEventType } from 'react-native-theoplayer';
import type { ButtonBaseProps } from './ButtonBaseProps';

export interface SkipButtonProps extends ButtonBaseProps {
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

/**
 * The default skip button for the `react-native-theoplayer` UI.
 */
export function SkipButton(props: SkipButtonProps) {
  const { style, skip, rotate, icon, textStyle } = props;
  const spinValue = useRef<Animated.Value>(new Animated.Value(0)).current;
  const { player } = useContext(PlayerContext);
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: skip >= 0 ? ['0deg', '360deg'] : ['360deg', '0deg'],
  });

  const [enabled, setEnabled] = useState<boolean>(false);
  useEffect(() => {
    const onUpdateEnabled = () => {
      setEnabled(player.seekable.length > 0 || player.buffered.length > 0);
    };
    const onPlaying = () => {
      const isCasting = player.cast.chromecast?.casting ?? false;
      setEnabled(player.seekable.length > 0 || player.buffered.length > 0 || isCasting);
    };
    player.addEventListener([PlayerEventType.PROGRESS, PlayerEventType.SOURCE_CHANGE], onUpdateEnabled);
    player.addEventListener(PlayerEventType.PLAYING, onPlaying);
    return () => {
      player.removeEventListener([PlayerEventType.PROGRESS, PlayerEventType.SOURCE_CHANGE], onUpdateEnabled);
      player.removeEventListener(PlayerEventType.PLAYING, onPlaying);
    };
  }, [player]);

  const onPress = useCallback(() => {
    player.currentTime = player.currentTime + skip * 1e3;
    if (rotate === true) {
      Animated.timing(spinValue, {
        toValue: 0.1,
        duration: 900,
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
  }, [player, skip, rotate, spinValue]);

  const forwardSvg: ReactNode = icon?.forward ?? <ForwardSvg />;
  const backwardSvg: ReactNode = icon?.backward ?? <BackwardSvg />;
  if (!enabled) {
    return <></>;
  }

  return (
    <PlayerContext.Consumer>
      {(context: UiContext) => (
        <Animated.View style={[{ height: '100%', aspectRatio: 1 }, style, { transform: [{ rotate: spin }] }]}>
          <TouchableOpacity
            activeOpacity={rotate === true ? 1 : 0.2}
            style={[{ height: '100%', aspectRatio: 1, justifyContent: 'center' }, style]}
            testID={props.testID}
            onPress={() => {
              onPress();
              context.ui.onUserAction_();
            }}>
            <ActionButton touchable={false} svg={skip < 0 ? backwardSvg : forwardSvg} />
            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center' }]}>
              <Text style={[context.style.text, { color: context.style.colors.text }, textStyle]}>{Math.abs(skip)}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </PlayerContext.Consumer>
  );
}
