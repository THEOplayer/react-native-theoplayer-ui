import React, { useState } from 'react';
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
  const [tvFocusGuideAvailable, setTvFocusGuideAvailable] = useState(true);
  const { style, children } = props;

  if (Platform.OS === 'ios' && Platform.isTV) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const TVFocusGuideView = require('react-native').TVFocusGuideView;
      return (
        <TVFocusGuideView autoFocus style={[FOCUS_GUIDE_STYLE, style]}>
          {children}
        </TVFocusGuideView>
      );
    } catch (e) {
      if (tvFocusGuideAvailable) {
        console.warn('TVFocusGuideView not supported, a dependency on react-native-tvos is required.');
        setTvFocusGuideAvailable(false);
      }
    }
  }
  return <>{children}</>;
};
