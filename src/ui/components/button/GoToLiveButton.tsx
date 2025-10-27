import type { ButtonBaseProps } from './ButtonBaseProps';
import React, { type ReactNode, useCallback, useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { ActionButton } from './actionbutton/ActionButton';
import { useCurrentTime, useDuration, useSeekable } from '../../hooks/barrel';
import { TestIDs } from '../../utils/TestIDs';
import { GoToLiveSvg } from './svg/GoToLiveSvg';
import { isAtLive } from '../util/LiveUtils';

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
  const { icon, style } = props;
  const goLiveSvg: ReactNode = icon?.goToLive ?? <GoToLiveSvg />;
  const { player } = useContext(PlayerContext);
  const duration = useDuration();
  const currentTime = useCurrentTime();
  const seekable = useSeekable();

  const goToLive = useCallback(() => {
    player.currentTime = Infinity;
  }, [player]);

  if (isNaN(duration) || isAtLive(duration, currentTime, seekable)) {
    return <></>;
  }

  return <ActionButton style={style} testID={props.testID ?? TestIDs.GO_TO_LIVE_BUTTON} touchable={true} svg={goLiveSvg} onPress={goToLive} />;
}
