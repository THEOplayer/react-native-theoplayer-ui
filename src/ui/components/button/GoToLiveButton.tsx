import type { ButtonBaseProps } from './ButtonBaseProps';
import React, { type ReactNode, useCallback, useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { ActionButton } from './actionbutton/ActionButton';
import { useCurrentTime, useDuration, useSeekable } from '../../hooks/barrel';
import { isAtLive, isLiveDuration } from '../util/LiveUtils';
import { StyleProp, Text, TextStyle, View } from 'react-native';
import { TestIDs } from '../../utils/TestIDs';

export interface LiveButtonProps extends ButtonBaseProps {
  /**
   * The icon components used in the button.
   */
  icon?: { goToLive: ReactNode };
  /**
   * The text style overrides for the button.
   */
  textStyle?: StyleProp<TextStyle>;
}

/**
 * The default go to live button for the `react-native-theoplayer` UI.
 */
export function GoToLiveButton(props: LiveButtonProps) {
  const { style, textStyle } = props;
  const context = useContext(PlayerContext);
  const duration = useDuration();
  const currentTime = useCurrentTime();
  const seekable = useSeekable();

  const goToLive = useCallback(() => {
    context.player.currentTime = Infinity;
  }, [context.player]);

  const liveIndicatorColor = isAtLive(duration, currentTime, seekable) ? '#f00' : '#888';

  if (isNaN(duration) || !isLiveDuration(duration)) {
    return <></>;
  }

  return (
    <ActionButton
      style={[props.style, { justifyContent: 'center', aspectRatio: 1.5 }, style]}
      testID={props.testID ?? TestIDs.GO_TO_LIVE_BUTTON}
      onPress={goToLive}
      touchable={true}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[context.style.text, { color: liveIndicatorColor, marginRight: 6 }]}>●</Text>
        <Text style={[context.style.text, { color: context.style.colors.text }, textStyle]}>{context.locale.liveLabel}</Text>
      </View>
    </ActionButton>
  );
}
