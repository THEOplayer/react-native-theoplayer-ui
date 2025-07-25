import { ActionButton } from './actionbutton/ActionButton';
import React, { type ReactNode, useCallback, useContext } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { PlaySvg } from './svg/PlaySvg';
import { PauseSvg } from './svg/PauseSvg';
import { ReplaySvg } from './svg/ReplaySvg';
import { usePaused } from '../../hooks/usePaused';
import { useEnded } from '../../hooks/useEnded';
import type { ButtonBaseProps } from './ButtonBaseProps';
import { TestIDs } from '../../utils/TestIDs';
import { useWaiting } from '../../hooks/useWaiting';
import { DelayedActivityIndicator } from '../activityindicator/DelayedActivityIndicator';

export interface PlayButtonProps extends ButtonBaseProps {
  /**
   * Whether the play/pause icon should be replaced with the DelayedActivityIndicatorComponent when the player is stalling.
   */
  showSpinner?: boolean;
  /**
   * The icon components used in the button.
   */
  icon?: { play: ReactNode; pause: ReactNode; replay: ReactNode };
}

/**
 * The default play/pause button for the `react-native-theoplayer` UI.
 */
export function PlayButton(props: PlayButtonProps) {
  const { icon, style, showSpinner } = props;
  const playSvg: ReactNode = icon?.play ?? <PlaySvg />;
  const pauseSvg: ReactNode = icon?.pause ?? <PauseSvg />;
  const replaySvg: ReactNode = icon?.replay ?? <ReplaySvg />;
  const { player } = useContext(PlayerContext);
  const paused = usePaused();
  const waiting = useWaiting()
  const ended = useEnded();

  const togglePlayPause = useCallback(() => {
    if (player.paused) {
      player.play();
    } else {
      player.pause();
    }
  }, [player]);

  const shouldShowSpinner = () => {
    return showSpinner && !player.paused && waiting
  }

  return (shouldShowSpinner() ? <DelayedActivityIndicator/> :
    <ActionButton
      style={style}
      testID={props.testID ?? TestIDs.PLAY_BUTTON}
      touchable={true}
      svg={ended ? replaySvg : paused ? playSvg : pauseSvg}
      onPress={togglePlayPause}
    />
  );
}
