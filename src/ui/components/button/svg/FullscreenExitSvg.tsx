import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import React from 'react';
import { SvgContext } from './SvgUtils';

export const FullscreenExitSvg = (props: SvgProps) => {
  return (
    <SvgContext.Consumer>
      {(context) => (
        <>
          <Svg viewBox={'0 0 24 24'} {...context} {...props}>
            <Path d="M9 19.225q-.475 0-.812-.325-.338-.325-.338-.8v-1.95H5.9q-.475 0-.8-.338-.325-.337-.325-.812 0-.475.325-.812.325-.338.8-.338H9q.475 0 .812.338.338.337.338.812v3.1q0 .475-.338.8-.337.325-.812.325ZM5.9 10.15q-.475 0-.8-.338-.325-.337-.325-.812 0-.475.325-.813.325-.337.8-.337h1.95V5.9q0-.475.338-.8.337-.325.812-.325.475 0 .812.325.338.325.338.8V9q0 .475-.338.812-.337.338-.812.338Zm9.1 9.075q-.475 0-.812-.325-.338-.325-.338-.8V15q0-.475.338-.812.337-.338.812-.338h3.1q.475 0 .8.338.325.337.325.812 0 .475-.325.812-.325.338-.8.338h-1.95v1.95q0 .475-.337.8-.338.325-.813.325Zm0-9.075q-.475 0-.812-.338-.338-.337-.338-.812V5.9q0-.475.338-.8.337-.325.812-.325.475 0 .813.325.337.325.337.8v1.95h1.95q.475 0 .8.337.325.338.325.813 0 .475-.325.812-.325.338-.8.338Z" />
          </Svg>
        </>
      )}
    </SvgContext.Consumer>
  );
};
