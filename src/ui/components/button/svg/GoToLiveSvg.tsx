import React from 'react';
import { Svg, Path, Line, type SvgProps } from 'react-native-svg';
import { SvgContext } from '@theoplayer/react-native-ui';

export function GoToLiveSvg(props: SvgProps) {
  return (
    <SvgContext.Consumer>
      {(context) => (
        <>
          <Svg viewBox={'0 0 24 24'} {...context} {...props}>
            <Path d="M4 4 L16 12 L4 20 Z" />
            <Line x1="19" y1="5" x2="19" y2="19" strokeWidth="2" strokeLinecap="square" stroke={'#fff'} />
          </Svg>
        </>
      )}
    </SvgContext.Consumer>
  );
}
