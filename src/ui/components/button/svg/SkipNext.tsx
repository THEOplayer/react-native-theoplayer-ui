import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import React from 'react';
import { SvgContext } from './SvgUtils';

export const SkipNextSvg = (props: SvgProps) => {
  return (
    <SvgContext.Consumer>
      {(context) => (
        <>
          <Svg viewBox={'0 0 24 24'} {...context} {...props}>
            <Path d="M17.5 18q-.425 0-.712-.288-.288-.287-.288-.712V7q0-.425.288-.713Q17.075 6 17.5 6t.712.287q.288.288.288.713v10q0 .425-.288.712-.287.288-.712.288ZM7.05 16.975q-.5.35-1.025.05-.525-.3-.525-.9v-8.25q0-.6.525-.888.525-.287 1.025.038l6.2 4.15q.45.3.45.825 0 .525-.45.825Z" />
          </Svg>
        </>
      )}
    </SvgContext.Consumer>
  );
};
