import React, { ReactNode, useContext } from 'react';
import { StyleProp, View, type ViewProps, ViewStyle } from 'react-native';
import { PlayerContext } from '../util/PlayerContext';

/**
 * The default style for the control bar.
 */
export const DEFAULT_CONTROL_BAR_STYLE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'flex-end',
};

export interface ControlBarProps extends ViewProps {
  /**
   * The style overrides for the control bar.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A control bar component that renders all children horizontally.
 */
export const ControlBar = (props: React.PropsWithChildren<ControlBarProps>) => {
  const { style, children, pointerEvents } = props;
  const context = useContext(PlayerContext);
  return (
    <View
      {...props}
      pointerEvents={pointerEvents ?? 'box-none'}
      style={[DEFAULT_CONTROL_BAR_STYLE, { height: context.style.dimensions.controlBarHeight }, style]}>
      {children}
    </View>
  );
};

export interface CenteredControlBarProps {
  /**
   * The style overrides for the control bar.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * The component that will be placed in the left slot.
   */
  left?: ReactNode;
  /**
   * The component that will be placed in the middle slot.
   */
  middle?: ReactNode;
  /**
   * The component that will be placed in the right slot.
   */
  right?: ReactNode;
}

/**
 * A control bar that can only render 3 properties in the left/middle/right. This is used to create controls in the center of the player.
 */
export const CenteredControlBar = (props: CenteredControlBarProps) => {
  const { style, middle, left, right } = props;
  const context = useContext(PlayerContext);
  return (
    <ControlBar
      style={[
        {
          height: context.style.dimensions.centerControlBarHeight,
          width: '60%',
          justifyContent: 'space-between',
        },
        style,
      ]}>
      <View style={{ height: context.style.dimensions.centerControlBarHeight }}>{left}</View>
      {middle}
      <View style={{ height: context.style.dimensions.centerControlBarHeight }}>{right}</View>
    </ControlBar>
  );
};
