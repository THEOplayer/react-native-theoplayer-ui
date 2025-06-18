import React from 'react';
import * as ReactNative from 'react-native';
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
  if (Platform.OS === 'ios' && Platform.isTV) {
    if (ReactNative.TVFocusGuideView) {
      return (
        <ReactNative.TVFocusGuideView style={[FOCUS_GUIDE_STYLE, style]} autoFocus>
          {children}
        </ReactNative.TVFocusGuideView>
      );
    }
    console.warn('TVFocusGuideView not supported, a dependency on react-native-tvos is required.');
  }
  return <>{children}</>;
};
