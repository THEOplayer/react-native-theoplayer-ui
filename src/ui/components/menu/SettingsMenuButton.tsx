import React, { type ReactNode, useContext } from 'react';
import { MenuButton } from './common/MenuButton';
import { SettingsSvg } from '../button/svg/SettingsSvg';
import { MenuView } from './common/MenuView';
import { ScrollableMenu } from './common/ScrollableMenu';
import type { StyleProp, ViewStyle } from 'react-native';
import { PlayerContext } from '../util/PlayerContext';

export interface SettingsMenuButtonProps {
  /**
   * Overrides for the style of the menu.
   */
  menuStyle?: StyleProp<ViewStyle>;

  /**
   * The icon component used in the button.
   */
  icon?: ReactNode;
}

/**
 * A button component that opens a settings menu containing all children for the `react-native-theoplayer` UI.
 */
export const SettingsMenuButton = (props: React.PropsWithChildren<SettingsMenuButtonProps>) => {
  const { children, menuStyle, icon } = props;
  const context = useContext(PlayerContext);
  const createMenu = () => {
    return <MenuView style={menuStyle} menu={<ScrollableMenu title={context.localization.settingsTitle} items={children} />} />;
  };

  return <MenuButton svg={icon ?? <SettingsSvg />} menuConstructor={createMenu} />;
};
