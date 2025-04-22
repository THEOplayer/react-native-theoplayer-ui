import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';

export interface AutoFocusGuideProps {
  /**
   * Overrides for the style of the guide.
   */
  style?: StyleProp<ViewStyle>;
}

const FOCUS_GUIDE_STYLE: ViewStyle = {
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
};

/**
 * A TV platform FocusGuide with autofocus capabilities
 */
export const AutoFocusGuide = (props: React.PropsWithChildren<AutoFocusGuideProps>) => {
  const { style, children } = props;
  try {
    if (Platform.isTVOS) {
      const TVFocusGuideView = require('react-native-tvos').TVFocusGuideView;
      return (
        <TVFocusGuideView autoFocus style={[FOCUS_GUIDE_STYLE, style]}>
          {children}
        </TVFocusGuideView>
      );
    }
  } catch (e) {
    console.warn('TVFocusGuideView not available, a dependency on react-native-tvos is necessary.');
  }
  return <>{children}</>;
};
