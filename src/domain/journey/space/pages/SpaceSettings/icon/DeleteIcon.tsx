import { SvgIcon, SvgIconProps } from '@mui/material';

import { ReactComponent as DeleteIconSvg } from './DeleteIcon.svg';

const DeleteIcon = (props: SvgIconProps) => {
  return <SvgIcon component={DeleteIconSvg} inheritViewBox {...props} />;
};

DeleteIcon.muiName = 'DeleteIcon';

export { DeleteIcon };
