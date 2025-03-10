import type { StyleProp, ViewStyle } from 'react-native';

export interface ButtonBaseProps {
  /**
   * The style overrides for the button.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * An id used to locate this view in end-to-end tests.
   */
  testID?: string;
}
