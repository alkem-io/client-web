import { SvgIcon, SvgIconProps } from '@mui/material';

import { ReactComponent as InnovationFlowIconSvg } from './InnovationFlowIcon.svg';

const InnovationFlowIcon = (props: SvgIconProps) => {
  return <SvgIcon component={InnovationFlowIconSvg} inheritViewBox {...props} />;
};

InnovationFlowIcon.muiName = 'InnovationFlow';

export { InnovationFlowIcon };
