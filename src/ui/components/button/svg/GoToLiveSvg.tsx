import React from 'react';
import { Svg, Path, Line } from 'react-native-svg';

export function GoToLiveSvg({ size = 24, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 4 L16 12 L4 20 Z" fill={color} />
      <Line x1="19" y1="4" x2="19" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}
