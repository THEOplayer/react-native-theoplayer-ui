import { Image, ImageSourcePropType, Platform, TouchableOpacity, View, ViewStyle } from 'react-native';
import React, { ReactNode, useContext, useRef, useState } from 'react';
import { SvgContext } from '../svg/SvgUtils';
import { PlayerContext } from '../../util/PlayerContext';
import type { ButtonBaseProps } from '../ButtonBaseProps';

export interface ActionButtonProps extends ButtonBaseProps {
  /**
   * The image to put in the button.
   */
  icon?: ImageSourcePropType;
  /**
   * The SVG component to put in the button. Takes priority over images.
   */
  svg?: ReactNode;
  /**
   * Whether the button should be touchable. This is `true` by default.
   */
  touchable?: boolean;
  /**
   * The callback when the button is pressed.
   */
  onPress?: () => void;
  /**
   * Whether the button should be highlighted with `ColorTheme.iconSelected` color.
   */
  highlighted?: boolean;
  /**
   * Determines what the opacity of the wrapped view should be when touch is active. Defaults to 0.2.
   */
  activeOpacity?: number | undefined;
}

/**
 * The default style applied to the ActionButton
 */
export const DEFAULT_ACTION_BUTTON_STYLE: ViewStyle = {
  height: '100%',
  aspectRatio: 1,
  padding: 5,
};

/**
 * The default button component that renders an image/svg source for the `react-native-theoplayer` UI.
 */
export const ActionButton = (props: React.PropsWithChildren<ActionButtonProps>) => {
  const { activeOpacity, children, icon, style, svg, onPress, highlighted, testID } = props;
  const [focused, setFocused] = useState<boolean>(false);
  const isPressed = useRef<boolean>(false);
  const context = useContext(PlayerContext);
  const shouldChangeTintColor = highlighted || (focused && Platform.isTV);
  const touchable = props.touchable != false;
  if (!touchable) {
    return <View style={[DEFAULT_ACTION_BUTTON_STYLE, style]}>{svg}</View>;
  }

  const onTouchIn = () => {
    if (context.ui.buttonsEnabled_) {
      isPressed.current = true;
    }
    context.ui.onUserAction_();
  };
  const onTouchOut = () => {
    if (context.ui.buttonsEnabled_) {
      onPress?.();
    }
    isPressed.current = false;
  };

  return (
    <TouchableOpacity
      style={[DEFAULT_ACTION_BUTTON_STYLE, style]}
      testID={testID}
      activeOpacity={activeOpacity}
      onPressIn={onTouchIn}
      onPressOut={onTouchOut}
      onFocus={() => {
        context.ui.onUserAction_();
        setFocused(true);
      }}
      onBlur={() => {
        setFocused(false);
      }}>
      {/* Give priority to SVG over image sources.*/}
      {svg && (
        <SvgContext.Provider
          value={{
            fill: shouldChangeTintColor ? context.style.colors.iconSelected : context.style.colors.icon,
            height: '100%',
            width: '100%',
          }}>
          <View>{svg}</View>
        </SvgContext.Provider>
      )}
      {svg === undefined && icon && (
        <Image
          style={[
            { height: '100%', width: '100%' },
            { tintColor: shouldChangeTintColor ? context.style.colors.iconSelected : context.style.colors.icon },
          ]}
          source={icon}
        />
      )}
      {children}
    </TouchableOpacity>
  );
};
