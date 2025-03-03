import React, { type ReactNode, useCallback, useContext } from 'react';
import { PresentationMode } from 'react-native-theoplayer';
import { Platform } from 'react-native';
import { ActionButton } from './actionbutton/ActionButton';
import { PlayerContext } from '../util/PlayerContext';
import { FullscreenExitSvg } from './svg/FullscreenExitSvg';
import { FullscreenEnterSvg } from './svg/FullscreenEnterSvg';
import { usePresentationMode } from '../hooks/usePresentationMode';

export interface FullscreenProps {
  /**
   * The icon components used in the button.
   */
  icon?: { enter: ReactNode; exit: ReactNode };
}

/**
 * The button to enable/disable fullscreen for the `react-native-theoplayer` UI.
 */
export function FullscreenButton(props: FullscreenProps) {
  const { icon } = props;
  const { player } = useContext(PlayerContext);
  const presentationMode = usePresentationMode();
  const toggleFullScreen = useCallback(() => {
    switch (player.presentationMode) {
      case 'picture-in-picture':
      case 'inline':
        player.presentationMode = PresentationMode.fullscreen;
        break;
      case 'fullscreen':
        player.presentationMode = PresentationMode.inline;
        break;
    }
  }, [player]);

  const enterSvg: ReactNode = icon?.enter ?? <FullscreenEnterSvg />;
  const exitSvg: ReactNode = icon?.exit ?? <FullscreenExitSvg />;
  if (Platform.isTV) {
    return <></>;
  }
  return <ActionButton svg={presentationMode === 'fullscreen' ? exitSvg : enterSvg} onPress={toggleFullScreen} />;
}
