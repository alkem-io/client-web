import { SvgIcon, SvgIconProps } from '@mui/material';

import SubspaceIconIconSvg from './SubspaceIcon.svg?react';

/**
 * @deprecated This component is deprecated and will be removed in future releases.
 * Please use the `SubspaceIcon2` component instead /main/ui/icons.
 */
const SubspaceIconV2 = (props: SvgIconProps) => {
  return <SvgIcon component={SubspaceIconIconSvg} inheritViewBox {...props} />;
};

SubspaceIconV2.muiName = 'Subspace';

export { SubspaceIconV2 };
