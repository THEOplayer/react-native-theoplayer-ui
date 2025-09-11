import { ActionButton } from './actionbutton/ActionButton';
import React, { type ReactNode, useCallback, useContext, useRef } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { ForwardSvg } from './svg/ForwardSvg';
import type { StyleProp, TextStyle } from 'react-native';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { BackwardSvg } from './svg/BackwardSvg';
import type { ButtonBaseProps } from './ButtonBaseProps';
import { useSeekable } from '../../hooks/useSeekable';

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

const ANIMATION_DURATION_MSEC = 100;

/**
 * The default skip button for the `react-native-theoplayer` UI.
 */
export function SkipButton(props: SkipButtonProps) {
  const { style, skip, rotate, icon, textStyle } = props;
  const spinValue = useRef<Animated.Value>(new Animated.Value(0)).current;
  const { player, ui, style: uiStyle } = useContext(PlayerContext);
  const seekable = useSeekable();

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: skip >= 0 ? ['0deg', '360deg'] : ['360deg', '0deg'],
  });

  const doSkip = useCallback(() => {
    player.currentTime = player.currentTime + skip * 1e3;
    if (rotate === true) {
      Animated.timing(spinValue, {
        toValue: 0.1,
        duration: ANIMATION_DURATION_MSEC,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(spinValue, {
          toValue: 0,
          duration: ANIMATION_DURATION_MSEC,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [player, skip, rotate, spinValue]);

  const forwardSvg: ReactNode = icon?.forward ?? <ForwardSvg />;
  const backwardSvg: ReactNode = icon?.backward ?? <BackwardSvg />;

  if (seekable.length === 0) {
    return <></>;
  }

  return (
    <Animated.View style={[{ height: '100%', aspectRatio: 1 }, style, { transform: [{ rotate: spin }] }]}>
      <ActionButton
        activeOpacity={rotate === true ? 1 : 0.2}
        style={[{ height: '100%', aspectRatio: 1, justifyContent: 'center' }, style]}
        testID={props.testID}
        svg={skip < 0 ? backwardSvg : forwardSvg}
        onPress={() => {
          doSkip();
          ui.onUserAction_();
        }}>
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center' }]}>
          <Text style={[uiStyle.text, { color: uiStyle.colors.text }, textStyle]}>{Math.abs(skip)}</Text>
        </View>
      </ActionButton>
    </Animated.View>
  );
}
