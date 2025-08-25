import { StyleProp, Text, TextStyle } from 'react-native';
import React, { useContext } from 'react';
import { PlayerContext } from '../../util/PlayerContext';

export interface MenuTitleProps {
  /**
   * The label of the menu title component.
   */
  label: string;
  /**
   * The style overrides.
   */
  style?: StyleProp<TextStyle>;
}

/**
 * The default style for the menu title.
 */
export const DEFAULT_MENU_TITLE_STYLE: TextStyle = {
  fontSize: 20,
  lineHeight: 24,
  padding: 10,
  textAlign: 'center',
  fontWeight: 'bold',
};

/**
 * The title placed at the top of the fullscreen menu.
 */
export const MenuTitle = (props: MenuTitleProps) => {
  const { label, style } = props;
  const context = useContext(PlayerContext);
  return <Text style={[DEFAULT_MENU_TITLE_STYLE, { color: context.style.colors.text }, style]}>{label}</Text>;
};
