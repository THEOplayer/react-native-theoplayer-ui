import { ActionButton } from './actionbutton/ActionButton';
import React, { PureComponent, type ReactNode } from 'react';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { PlayerEventType, VolumeChangeEvent } from 'react-native-theoplayer';
import { Platform } from 'react-native';
import { VolumeOffSvg } from './svg/VolumeOffSvg';
import { VolumeUpSvg } from './svg/VolumeUpSvg';

interface MuteButtonState {
  muted: boolean;
}

export interface MuteButtonProps {
  /**
   * The icon components used in the button.
   */
  icon?: { volumeUp: ReactNode; volumeOff: ReactNode };
}

/**
 * The default mute button for the `react-native-theoplayer` UI.
 */
export class MuteButton extends PureComponent<MuteButtonProps, MuteButtonState> {
  constructor(props: MuteButtonProps) {
    super(props);
    this.state = { muted: false };
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.VOLUME_CHANGE, this.onVolumeChange);
    this.setState({ muted: player.muted });
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.VOLUME_CHANGE, this.onVolumeChange);
  }

  private onVolumeChange = (_: VolumeChangeEvent) => {
    const player = (this.context as UiContext).player;
    this.setState({ muted: player.muted });
  };

  private toggleMuted = () => {
    const player = (this.context as UiContext).player;
    player.muted = !player.muted;
  };

  render() {
    const { muted } = this.state;
    const { icon } = this.props;
    if (Platform.isTV) {
      return <></>;
    }
    const volumeUpSvg: ReactNode = icon?.volumeUp ?? <VolumeUpSvg />;
    const volumeOffSvg: ReactNode = icon?.volumeOff ?? <VolumeOffSvg />;
    return <ActionButton svg={muted ? volumeOffSvg : volumeUpSvg} onPress={this.toggleMuted} touchable={true} />;
  }
}

MuteButton.contextType = PlayerContext;
