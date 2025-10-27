import type { ButtonBaseProps } from './ButtonBaseProps';
import React, { type ReactNode, useCallback, useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { ActionButton } from './actionbutton/ActionButton';
import { useCurrentTime, useDuration, useSeekable } from '../../hooks/barrel';
import { isAtLive, isLiveDuration } from '../util/LiveUtils';
import { Text, View } from 'react-native';
import { TestIDs } from '../../utils/TestIDs';

export interface LiveButtonProps extends ButtonBaseProps {
  /**
   * The icon components used in the button.
   */
  icon?: { goToLive: ReactNode };
}

/**
 * The default go to live button for the `react-native-theoplayer` UI.
 */
export function GoToLiveButton(props: LiveButtonProps) {
  const { style } = props;
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
      style={[props.style, { justifyContent: 'center', aspectRatio: 1.5 }]}
      testID={props.testID ?? TestIDs.GO_TO_LIVE_BUTTON}
      onPress={goToLive}
      touchable={true}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[context.style.text, { color: liveIndicatorColor, marginRight: 6 }, style]}>●</Text>
        <Text style={[context.style.text, { color: context.style.colors.text }, style]}>{context.locale.liveLabel}</Text>
      </View>
    </ActionButton>
  );
}
