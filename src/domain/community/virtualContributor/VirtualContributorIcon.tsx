import { SvgIcon, SvgIconProps } from '@mui/material';

import { ReactComponent as VirtualContributorIconSvg } from './VirtualContributor.svg';

const VirtualContributorIcon = (props: SvgIconProps) => {
  return <SvgIcon component={VirtualContributorIconSvg} inheritViewBox {...props} />;
};

VirtualContributorIcon.muiName = 'VirtualContributor';

export { VirtualContributorIcon };
