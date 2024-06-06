import { SvgIcon, SvgIconProps } from '@mui/material';

import { ReactComponent as CalloutIconIconSvg } from './CalloutIcon.svg';

const CalloutIcon = (props: SvgIconProps) => {
  return <SvgIcon component={CalloutIconIconSvg} inheritViewBox {...props} />;
};

CalloutIcon.muiName = 'Callout';

export { CalloutIcon };
