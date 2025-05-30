import React, { PureComponent, type ReactNode } from 'react';
import type { MediaTrack } from 'react-native-theoplayer';
import { PlayerEventType, TextTrack } from 'react-native-theoplayer';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { LanguageSvg } from '../button/svg/LanguageSvg';
import { ScrollableMenu } from './common/ScrollableMenu';
import { MenuRadioButton } from './common/MenuRadioButton';
import { MenuButton } from './common/MenuButton';
import { filterRenderableTracks, getTrackLabel } from '../util/TrackUtils';
import { MenuView } from './common/MenuView';
import type { StyleProp, ViewStyle } from 'react-native';

export interface LanguageMenuButtonState {
  audioTracks: MediaTrack[];
  textTracks: TextTrack[];
}

export interface LanguageMenuButtonProps {
  /**
   * The style overrides.
   */
  menuStyle?: StyleProp<ViewStyle>;

  /**
   * The icon component used in the button.
   */
  icon?: ReactNode;
}

/**
 * A button component that opens a language selection menu (audio/text) for the `react-native-theoplayer` UI.
 */
export class LanguageMenuButton extends PureComponent<LanguageMenuButtonProps, LanguageMenuButtonState> {
  constructor(props: LanguageMenuButtonProps) {
    super(props);
    this.state = { audioTracks: [], textTracks: [] };
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.MEDIA_TRACK_LIST, this._updateTrackLists);
    player.addEventListener(PlayerEventType.TEXT_TRACK_LIST, this._updateTrackLists);
    this._updateTrackLists();
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.MEDIA_TRACK_LIST, this._updateTrackLists);
    player.removeEventListener(PlayerEventType.TEXT_TRACK_LIST, this._updateTrackLists);
  }

  private _updateTrackLists = () => {
    const player = (this.context as UiContext).player;
    this.setState({
      audioTracks: player.audioTracks,
      textTracks: player.textTracks,
    });
  };

  render() {
    const { audioTracks, textTracks } = this.state;
    const { menuStyle, icon } = this.props;

    const selectableTextTracks = filterRenderableTracks(textTracks);

    if (audioTracks.length < 2 && selectableTextTracks.length === 0) {
      return <></>;
    }

    const createMenu = () => {
      return <LanguageMenuView style={menuStyle} />;
    };

    return <MenuButton svg={icon ?? <LanguageSvg />} menuConstructor={createMenu} />;
  }
}

export interface LanguageMenuViewState extends LanguageMenuButtonState {
  selectedAudioTrack: number | undefined;
  selectedTextTrack: number | undefined;
}

export interface LanguageMenuViewProps {
  style?: StyleProp<ViewStyle>;
}

export class LanguageMenuView extends PureComponent<LanguageMenuViewProps, LanguageMenuViewState> {
  constructor(props: LanguageMenuViewProps) {
    super(props);
    this.state = {
      audioTracks: [],
      textTracks: [],
      selectedAudioTrack: undefined,
      selectedTextTrack: undefined,
    };
  }

  private _updateTrackLists = () => {
    const player = (this.context as UiContext).player;
    this.setState({
      audioTracks: player.audioTracks,
      textTracks: player.textTracks,
      selectedAudioTrack: player.selectedAudioTrack,
      selectedTextTrack: player.selectedTextTrack,
    });
  };

  componentDidMount() {
    const player = (this.context as UiContext).player;
    // The track lists might change while the menu is open, so we need to monitor them.
    player.addEventListener(PlayerEventType.MEDIA_TRACK_LIST, this._updateTrackLists);
    player.addEventListener(PlayerEventType.TEXT_TRACK_LIST, this._updateTrackLists);
    this._updateTrackLists();
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.MEDIA_TRACK_LIST, this._updateTrackLists);
    player.removeEventListener(PlayerEventType.TEXT_TRACK_LIST, this._updateTrackLists);
  }

  private onSelectTextTrack = (uid: number | undefined) => {
    const { textTracks } = this.state;
    const textTrack = textTracks.find((track) => track.uid === uid);
    const context = this.context as UiContext;
    context.player.selectedTextTrack = textTrack?.uid;
    this.setState({ selectedTextTrack: textTrack?.uid });
  };

  private selectAudioTrack = (uid: number | undefined) => {
    const { audioTracks } = this.state;
    const audioTrack = audioTracks.find((track) => track.uid === uid);
    if (audioTrack) {
      const context = this.context as UiContext;
      context.player.selectedAudioTrack = audioTrack.uid;
      this.setState({ selectedAudioTrack: audioTrack.uid });
    }
  };

  render() {
    const { style } = this.props;
    const { audioTracks, textTracks, selectedAudioTrack, selectedTextTrack } = this.state;
    // The sort is needed because tracks are returned in different order on the native SDKs.
    const selectableTextTracks = filterRenderableTracks(textTracks).sort((first, second) => first.uid - second.uid);
    const selectableAudioTracks = audioTracks.sort((first, second) => first.uid - second.uid);
    return (
      <PlayerContext.Consumer>
        {(context: UiContext) => (
          <MenuView
            style={style}
            menu={
              <>
                {selectableAudioTracks.length > 1 && (
                  <ScrollableMenu
                    title={context.locale.audioTitle}
                    items={selectableAudioTracks.map((track, id) => (
                      <MenuRadioButton
                        key={id}
                        label={getTrackLabel(track)}
                        uid={track.uid}
                        onSelect={this.selectAudioTrack}
                        selected={track.uid === selectedAudioTrack}></MenuRadioButton>
                    ))}
                  />
                )}
                {selectableTextTracks.length > 0 && (
                  <ScrollableMenu
                    title={context.locale.subtitleTitle}
                    items={
                      <>
                        <MenuRadioButton
                          key={0}
                          label={'off'}
                          uid={undefined}
                          onSelect={this.onSelectTextTrack}
                          selected={selectedTextTrack === undefined}
                        />
                        {selectableTextTracks.map((track, id) => (
                          <MenuRadioButton
                            key={id + 1}
                            label={getTrackLabel(track)}
                            uid={track.uid}
                            onSelect={this.onSelectTextTrack}
                            selected={track.uid === selectedTextTrack}
                          />
                        ))}
                      </>
                    }
                  />
                )}
              </>
            }
          />
        )}
      </PlayerContext.Consumer>
    );
  }
}

LanguageMenuButton.contextType = PlayerContext;
LanguageMenuView.contextType = PlayerContext;
