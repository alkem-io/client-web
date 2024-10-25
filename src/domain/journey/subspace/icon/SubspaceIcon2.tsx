import { SvgIcon, SvgIconProps } from '@mui/material';

import SubspaceIconIconSvg from './SubspaceIcon.svg?react';

const SubspaceIcon = (props: SvgIconProps) => {
  return <SvgIcon component={SubspaceIconIconSvg} inheritViewBox {...props} />;
};

SubspaceIcon.muiName = 'Subspace';

export { SubspaceIcon };
