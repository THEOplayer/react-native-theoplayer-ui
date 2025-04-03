import React, { type ReactNode, useCallback, useContext } from 'react';
import { PresentationMode } from 'react-native-theoplayer';
import { Platform } from 'react-native';
import { ActionButton } from './actionbutton/ActionButton';
import { PlayerContext } from '../util/PlayerContext';
import { PipExitSvg } from './svg/PipExitSvg';
import { PipEnterSvg } from './svg/PipEnterSvg';
import { usePresentationMode } from '../../hooks/usePresentationMode';
import type { ButtonBaseProps } from './ButtonBaseProps';
import { TestIDs } from '../../utils/TestIDs';

export interface PipButtonProps extends ButtonBaseProps {
  /**
   * The icon components used in the button.
   */
  icon?: { enter: ReactNode; exit: ReactNode };
}

/**
 * The default button to enable picture-in-picture for the `react-native-theoplayer` UI.
 */
export function PipButton(props: PipButtonProps) {
  const { icon } = props;
  const { player, ui } = useContext(PlayerContext);
  const presentationMode = usePresentationMode();
  const togglePip = useCallback(() => {
    switch (player.presentationMode) {
      case 'inline':
      case 'fullscreen':
        ui.enterPip_();
        break;
      case 'picture-in-picture':
        player.presentationMode = PresentationMode.inline;
        break;
    }
  }, [player]);

  const enterSvg: ReactNode = icon?.enter ?? <PipEnterSvg />;
  const exitSvg: ReactNode = icon?.exit ?? <PipExitSvg />;
  if (Platform.isTV) {
    return <></>;
  }
  return (
    <ActionButton
      style={props.style}
      testID={props.testID ?? TestIDs.PIP_BUTTON}
      svg={presentationMode === 'picture-in-picture' ? exitSvg : enterSvg}
      onPress={togglePip}
    />
  );
}
