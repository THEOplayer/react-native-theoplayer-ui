import React, { forwardRef, lazy } from 'react';
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

const TVFocusGuideView = lazy((): Promise<{ default: typeof ReactNative.TVFocusGuideView }> => {
  if (Platform.OS === 'ios' && Platform.isTV) {
    if (ReactNative.TVFocusGuideView) {
      return Promise.resolve({ default: ReactNative.TVFocusGuideView });
    } else {
      console.warn('TVFocusGuideView not supported, a dependency on react-native-tvos is required.');
    }
  }
  return Promise.resolve({ default: forwardRef(({ children }) => <>{children}</>) });
});

/**
 * A TV platform FocusGuide with autofocus capabilities
 */
export const AutoFocusGuide = (props: React.PropsWithChildren<AutoFocusGuideProps>) => {
  const { style, children } = props;
  return (
    <TVFocusGuideView autoFocus style={[FOCUS_GUIDE_STYLE, style]}>
      {children}
    </TVFocusGuideView>
  );
};
