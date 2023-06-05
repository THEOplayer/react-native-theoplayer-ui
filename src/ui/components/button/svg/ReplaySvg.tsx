import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import React from 'react';
import { SvgContext } from './SvgUtils';

export const ReplaySvg = (props: SvgProps) => {
  return (
    <SvgContext.Consumer>
      {(context) => (
        <>
          <Svg viewBox={'0 0 24 24'} {...context} {...props}>
            <Path d="M12 23q-3.725 0-6.438-2.375Q2.85 18.25 2.275 14.7q-.1-.625.325-1.088.425-.462 1.125-.462.6 0 1.087.437.488.438.663 1.113.5 2.225 2.313 3.688Q9.6 19.85 12 19.85q2.8 0 4.75-1.963 1.95-1.962 1.95-4.762t-1.962-4.75q-1.963-1.95-4.763-1.95H11.8l.525.525q.375.375.363.85-.013.475-.363.825t-.85.363q-.5.012-.85-.338l-2.7-2.7q-.225-.225-.337-.513-.113-.287-.113-.587t.113-.588q.112-.287.337-.512L10.6 1.075q.35-.35.875-.363.525-.012.875.363.35.35.338.85-.013.5-.363.85l-.5.5h.15q2.05 0 3.85.775 1.8.775 3.15 2.112Q20.325 7.5 21.1 9.287q.775 1.788.775 3.838t-.775 3.85q-.775 1.8-2.112 3.137-1.338 1.338-3.138 2.113Q14.05 23 12 23Z" />
          </Svg>
        </>
      )}
    </SvgContext.Consumer>
  );
};