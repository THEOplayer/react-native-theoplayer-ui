import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import React from 'react';
import { SvgContext } from './SvgUtils';

export const ListSvg = (props: SvgProps) => {
  return (
    <SvgContext.Consumer>
      {(context) => (
        <>
          <Svg viewBox={'0 96 960 960'} {...context} {...props}>
            <Path d="M400 856q-17 0-28.5-11.5T360 816q0-17 11.5-28.5T400 776h400q17 0 28.5 11.5T840 816q0 17-11.5 28.5T800 856H400Zm0-240q-17 0-28.5-11.5T360 576q0-17 11.5-28.5T400 536h400q17 0 28.5 11.5T840 576q0 17-11.5 28.5T800 616H400Zm0-240q-17 0-28.5-11.5T360 336q0-17 11.5-28.5T400 296h400q17 0 28.5 11.5T840 336q0 17-11.5 28.5T800 376H400ZM200 896q-33 0-56.5-23.5T120 816q0-33 23.5-56.5T200 736q33 0 56.5 23.5T280 816q0 33-23.5 56.5T200 896Zm0-240q-33 0-56.5-23.5T120 576q0-33 23.5-56.5T200 496q33 0 56.5 23.5T280 576q0 33-23.5 56.5T200 656Zm0-240q-33 0-56.5-23.5T120 336q0-33 23.5-56.5T200 256q33 0 56.5 23.5T280 336q0 33-23.5 56.5T200 416Z" />
          </Svg>
        </>
      )}
    </SvgContext.Consumer>
  );
};
