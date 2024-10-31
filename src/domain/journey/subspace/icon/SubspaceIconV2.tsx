import { SvgIcon, SvgIconProps } from '@mui/material';

import SubspaceIconIconSvg from './SubspaceIcon.svg?react';

const SubspaceIconV2 = (props: SvgIconProps) => {
  return <SvgIcon component={SubspaceIconIconSvg} inheritViewBox {...props} />;
};

SubspaceIconV2.muiName = 'Subspace';

export { SubspaceIconV2 };
