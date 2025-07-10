import { type StyleProp, type TextStyle, View } from 'react-native';
import * as React from 'react';

export interface SquareChapterMarkerProps {
  /**
   * The style overrides.
   */
  style?: StyleProp<TextStyle>;
}

export const SquareChapterMarker = (props: SquareChapterMarkerProps) => {
  return (
    <View
      style={[
        {
          width: 5,
          height: 4,
          backgroundColor: 'yellow',
        },
        props.style,
      ]}
    />
  );
};
