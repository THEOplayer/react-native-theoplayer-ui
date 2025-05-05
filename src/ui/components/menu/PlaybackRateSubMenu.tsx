import React, { useContext, useState } from 'react';
import { PlayerContext } from '../util/PlayerContext';
import { MenuView } from './common/MenuView';
import { ScrollableMenu } from './common/ScrollableMenu';
import { MenuRadioButton } from './common/MenuRadioButton';
import { SubMenuWithButton } from './common/SubMenuWithButton';
import type { StyleProp, ViewStyle } from 'react-native';

export interface PlaybackRateValue {
  /**
   * The playbackRate value.
   */
  readonly value: number;
  /**
   * The label of the playbackRate value.
   */
  readonly label: string;
}

/**
 * The default playback rate values for the menu.
 *
 * @deprecated, use DEFAULT_NUMBER_PLAYBACK_RATE_MENU_VALUES instead.
 */
export const DEFAULT_PLAYBACK_RATE_MENU_VALUES: PlaybackRateValue[] = [
  { value: 0.25, label: '0.25x' },
  { value: 0.5, label: '0.5x' },
  { value: 1, label: 'Normal' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
];

/**
 * The default number playback rate values for the menu.
 */
export const DEFAULT_NUMBER_PLAYBACK_RATE_MENU_VALUES: PlaybackRateValues = [0.25, 0.5, 1, 1.25, 1.5, 2];

export type PlaybackRateValues = PlaybackRateValue[] | number[];

export interface PlaybackRateSubMenuProps {
  /**
   * Overrides for the default playbackRate values.
   */
  values?: PlaybackRateValues;
  /**
   * Overrides for the style of the menu.
   */
  menuStyle?: StyleProp<ViewStyle>;
}

/**
 * A button component that opens a playbackRate selection menu for the `react-native-theoplayer` UI.
 */
export const PlaybackRateSubMenu = (props: PlaybackRateSubMenuProps) => {
  const { values, menuStyle } = props;
  const { player, localization } = useContext(PlayerContext);

  const selectedValues: PlaybackRateValues = values ?? DEFAULT_NUMBER_PLAYBACK_RATE_MENU_VALUES;
  const localizedValues: PlaybackRateValue[] = selectedValues.map((value) => {
    if (typeof value === 'number') {
      return { value: value, label: localization.playbackRateValue({ rate: value }) } satisfies PlaybackRateValue;
    }
    return value;
  });

  const createMenu = () => {
    return <PlaybackSelectionView values={localizedValues} menuStyle={menuStyle} />;
  };
  return (
    <SubMenuWithButton
      menuConstructor={createMenu}
      label={localization.playbackRateTitle}
      preview={localization.playbackRateValue({ rate: player.playbackRate })}
    />
  );
};

export interface PlaybackSelectionViewProps {
  menuStyle?: StyleProp<ViewStyle>;
  values: PlaybackRateValue[];
}

export const PlaybackSelectionView = (props: PlaybackSelectionViewProps) => {
  const { values, menuStyle } = props;
  const { player, localization } = useContext(PlayerContext);
  const [selectedPlaybackRate, setSelectedPlaybackRate] = useState(player.playbackRate);
  const onChangePlaybackRate = (playbackRate: number | undefined) => {
    if (playbackRate) {
      player.playbackRate = playbackRate;
      setSelectedPlaybackRate(playbackRate);
    }
  };

  return (
    <MenuView
      style={menuStyle}
      menu={
        <ScrollableMenu
          title={localization.playbackRateTitle}
          items={values.map((playbackRateValue, id) => (
            <MenuRadioButton
              key={id}
              label={playbackRateValue.label}
              uid={playbackRateValue.value}
              onSelect={onChangePlaybackRate}
              selected={selectedPlaybackRate === playbackRateValue.value}></MenuRadioButton>
          ))}
        />
      }
    />
  );
};
