import type { VideoQuality } from 'react-native-theoplayer';
import { findMediaTrackByUid, MediaTrack, PlayerEventType } from 'react-native-theoplayer';
import React, { PureComponent, useContext } from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { PlayerContext, UiContext } from '../util/PlayerContext';
import { MenuView } from './common/MenuView';
import { ScrollableMenu } from './common/ScrollableMenu';
import { MenuRadioButton } from './common/MenuRadioButton';
import { SubMenuWithButton } from './common/SubMenuWithButton';

export interface QualitySubMenuProps {
  /**
   * Overrides for the style of the menu.
   */
  menuStyle?: StyleProp<ViewStyle>;
}

/**
 * A button component that opens a playbackRate selection menu for the `react-native-theoplayer` UI.
 */
export const QualitySubMenu = (props: QualitySubMenuProps) => {
  const { menuStyle } = props;
  const { player, localization } = useContext(PlayerContext);

  if (Platform.OS === 'ios') {
    return <></>;
  }
  const createMenu = () => {
    return <QualitySelectionView style={menuStyle} />;
  };

  let selectedQualityLabel = localization.qualityLabel({ quality: undefined });
  if (player.targetVideoQuality !== undefined) {
    let id: number | undefined;
    if (typeof player.targetVideoQuality === 'number') {
      id = player.targetVideoQuality;
    } else {
      id = player.targetVideoQuality.length > 0 ? player.targetVideoQuality[0] : undefined;
    }
    const selectedTrack = player.videoTracks.find((track) => track.uid === player.selectedVideoTrack);
    const selectedQuality = selectedTrack !== undefined ? selectedTrack.qualities.find((quality) => quality.uid === id) : undefined;
    selectedQualityLabel = localization.qualityLabel({ quality: selectedQuality as VideoQuality });
  }

  return <SubMenuWithButton menuConstructor={createMenu} label={localization.qualityTitle} preview={selectedQualityLabel} />;
};

export interface QualitySelectionViewState {
  videoTracks: MediaTrack[];
  selectedVideoTrack: number | undefined;
  targetVideoTrackQuality: number | number[] | undefined;
}

export interface QualitySelectionViewProps {
  style?: StyleProp<ViewStyle>;
}

export class QualitySelectionView extends PureComponent<QualitySelectionViewProps, QualitySelectionViewState> {
  constructor(props: QualitySelectionViewProps) {
    super(props);
    this.state = {
      videoTracks: [],
      selectedVideoTrack: undefined,
      targetVideoTrackQuality: undefined,
    };
  }

  componentDidMount() {
    const player = (this.context as UiContext).player;
    player.addEventListener(PlayerEventType.MEDIA_TRACK_LIST, this.onTrackListChanged);
    this.setState({
      videoTracks: player.videoTracks,
      selectedVideoTrack: player.selectedVideoTrack,
      targetVideoTrackQuality: player.targetVideoQuality,
    });
  }

  componentWillUnmount() {
    const player = (this.context as UiContext).player;
    player.removeEventListener(PlayerEventType.MEDIA_TRACK_LIST, this.onTrackListChanged);
  }

  private onTrackListChanged = () => {
    const player = (this.context as UiContext).player;
    this.setState({
      videoTracks: player.videoTracks,
      selectedVideoTrack: player.selectedVideoTrack,
      targetVideoTrackQuality: player.targetVideoQuality,
    });
  };

  private selectTargetVideoQuality = (qualityIndex: number | undefined) => {
    const { videoTracks, selectedVideoTrack } = this.state;
    if (!videoTracks || !selectedVideoTrack) {
      return;
    }
    const videoTrack = videoTracks.find((track) => track.uid === selectedVideoTrack);
    const qualities = videoTrack?.qualities;
    if (!qualities) {
      return;
    }
    let uid: number | undefined = undefined;
    if (qualityIndex !== undefined && qualityIndex > 0) {
      // The first quality in the list is "auto". The rest are selectable qualities.
      uid = qualities[qualityIndex - 1].uid;
    }
    const player = (this.context as UiContext).player;
    player.targetVideoQuality = uid;
    this.setState({ targetVideoTrackQuality: uid });
  };

  render() {
    const { style } = this.props;
    const { videoTracks, selectedVideoTrack, targetVideoTrackQuality } = this.state;
    const availableVideoQualities = findMediaTrackByUid(videoTracks, selectedVideoTrack)?.qualities || [];
    availableVideoQualities.sort((q1, q2) => q2.bandwidth - q1.bandwidth);

    let selectedTarget: number | undefined;
    if (targetVideoTrackQuality === undefined || typeof targetVideoTrackQuality === 'number') {
      selectedTarget = targetVideoTrackQuality;
    } else {
      selectedTarget = targetVideoTrackQuality.length > 0 ? targetVideoTrackQuality[0] : undefined;
    }

    return (
      <PlayerContext.Consumer>
        {(context: UiContext) => (
          <MenuView
            style={style}
            menu={
              <ScrollableMenu
                title={context.localization.qualityTitle}
                items={[undefined, ...availableVideoQualities].map((track, id) => (
                  <MenuRadioButton
                    key={id}
                    label={context.localization.qualityLabelExtended({ quality: track as VideoQuality })}
                    uid={id}
                    onSelect={this.selectTargetVideoQuality}
                    selected={
                      (track === undefined && selectedTarget === undefined) || (track !== undefined && track.uid === selectedTarget)
                    }></MenuRadioButton>
                ))}
              />
            }
          />
        )}
      </PlayerContext.Consumer>
    );
  }
}

QualitySelectionView.contextType = PlayerContext;
