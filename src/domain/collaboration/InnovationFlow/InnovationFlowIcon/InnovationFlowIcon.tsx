import { SvgIcon, SvgIconProps } from '@mui/material';

import InnovationFlowIconSvg from './InnovationFlowIcon.svg?react';

const InnovationFlowIcon = (props: SvgIconProps) => (
  <SvgIcon component={InnovationFlowIconSvg} inheritViewBox {...props} />
);

InnovationFlowIcon.muiName = 'InnovationFlow';

// check and delete
export { InnovationFlowIcon };
