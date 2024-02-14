import React, { PureComponent, type ReactNode } from 'react';
import type { PresentationModeChangeEvent } from 'react-native-theoplayer';
import { PlayerEventType, PresentationMode } from 'react-native-theoplayer';
import { Platform } from 'react-native';
import { ActionButton } from './actionbutton/ActionButton';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { PipExitSvg } from './svg/PipExitSvg';
import { PipEnterSvg } from './svg/PipEnterSvg';

interface PipButtonState {
  presentationMode: PresentationMode;
}

interface PipButtonProps {
  /**
   * The icon components used in the button.
   */
  icon?: { enter: ReactNode; exit: ReactNode };
}

/**
 * The default button to enable picture-in-picture for the `react-native-theoplayer` UI.
 */
export class PipButton extends PureComponent<PipButtonProps, PipButtonState> {
  constructor(props: PipButtonProps) {
    super(props);
    this.state = { presentationMode: PresentationMode.inline };
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.PRESENTATIONMODE_CHANGE, this.onPresentationModeChange);
    this.setState({ presentationMode: player.presentationMode });
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.PRESENTATIONMODE_CHANGE, this.onPresentationModeChange);
  }

  private readonly onPresentationModeChange = (event: PresentationModeChangeEvent) => {
    this.setState({ presentationMode: event.presentationMode });
  };

  private togglePip = () => {
    const context = this.context as UiContext;
    const player = context.player;
    switch (player.presentationMode) {
      case 'inline':
      case 'fullscreen':
        context.ui.enterPip_();
        break;
      case 'picture-in-picture':
        player.presentationMode = PresentationMode.inline;
        break;
    }
  };

  render() {
    const { icon } = this.props;
    if (Platform.isTV) {
      return <></>;
    }
    const { presentationMode } = this.state;
    const enterSvg: ReactNode = icon?.enter ?? <PipEnterSvg />;
    const exitSvg: ReactNode = icon?.exit ?? <PipExitSvg />;
    return <ActionButton svg={presentationMode === 'picture-in-picture' ? exitSvg : enterSvg} onPress={this.togglePip} />;
  }
}

PipButton.contextType = PlayerContext;
